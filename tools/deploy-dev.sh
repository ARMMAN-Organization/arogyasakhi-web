#!/usr/bin/env bash
#
# Dev-box deploy driver. Runs ON the box, invoked by .github/workflows/cd-dev.yml
# through `aws ssm send-command`.
#
# WHY A SCRIPT RATHER THAN INLINE COMMANDS
# Run Command has no stdin and no file copy, so a workflow that embeds its logic
# in the API call ends up with an unreviewable YAML string and a payload that
# grows every time the deploy changes. Keeping the logic here means the command
# is one line, and the logic is versioned and reviewed like any other code.
#
# Unlike the backend's deploy-dev.sh this file is COMMITTED, not gitignored. That
# script must survive the `git reset --hard` it is itself driving; this one is
# fetched fresh by the reset that precedes it, so versioning it means the box can
# never run a script that disagrees with the workflow calling it.
#
# TWO MODES, TWO USERS — both matter:
#   build    as ssm-user, via a login shell. The checkout is ssm-user-owned (root
#            git operations in it trip "dubious ownership"), and nvm lives in that
#            user's profile.
#   publish  as root (Run Command's default). Writes /var/www and calls systemctl,
#            neither of which ssm-user can do.
#
# WHY THE BUILD IS HERE AND NOT ON THE RUNNER
# Run Command cannot copy files, and the two ways to hand a runner-built dist to
# the box both cost something not available: an S3 relay needs s3:PutObject and
# s3:GetObject, and a git artifact branch needs build output committed to the
# repo. Building here means there is no artifact to move at all.
#
# scp is NOT an alternative. `ssm:StartSession` on AWS-StartSSHSession has been
# declined twice by the client, most recently when this script was written.
#
# THE MEMORY GUARD IS NOT OPTIONAL
# This box runs 16 backend services under PM2, each an `nx serve` webpack dev
# server, and sits near 81% RAM idle. If a build pushes it over, the kernel OOM
# killer chooses its victim by score — quite possibly auth-service rather than
# this build. So the build refuses to start below BUILD_MIN_AVAIL_MB and runs
# under a V8 heap cap, making the worst case a failed deploy instead of a backend
# outage nobody connects to a frontend push.
#
# OUTPUT
# GetCommandInvocation caps its response, and npm ci easily exceeds it. Noisy
# commands are redirected to a log file on the box and only markers plus a failure
# tail go to stdout. The log path is always printed.
#
# USAGE
#   DEV_WORKSPACE=... SOURCE_SHA=... [BUILD_MIN_AVAIL_MB=...] [NODE_HEAP_MB=...] deploy-dev.sh build
#   DEV_WORKSPACE=... WEB_ROOT=... DEV_USER=... SOURCE_SHA=... deploy-dev.sh publish
set -euo pipefail

WORKSPACE=${DEV_WORKSPACE:-/opt/dev/armaan/arogyasakhi-web}
WEB_ROOT=${WEB_ROOT:-/var/www/armman/app}
DEV_USER=${DEV_USER:-ssm-user}
SOURCE_SHA=${SOURCE_SHA:?SOURCE_SHA is required}
NODE_VERSION=${NODE_VERSION:-20.11.0}
# PROVISIONAL defaults — set these from the box's real `free -m`. The guard must
# sit above the heap cap, so the build hits its own ceiling first and exits
# cleanly rather than reaching the point where the kernel starts killing things.
BUILD_MIN_AVAIL_MB=${BUILD_MIN_AVAIL_MB:-1536}
NODE_HEAP_MB=${NODE_HEAP_MB:-1024}
RELEASES="$(dirname "$WEB_ROOT")/releases"
KEEP_RELEASES=${KEEP_RELEASES:-5}

mode=${1:?usage: deploy-dev.sh <build|publish>}

LOG_DIR=${LOG_DIR:-/var/tmp/arogyasakhi-web-deploy}
mkdir -p "$LOG_DIR"
chmod 1777 "$LOG_DIR" 2>/dev/null || true
LOG="$LOG_DIR/$(date -u +%Y%m%dT%H%M%SZ)-$mode.log"
echo "LOG=$LOG"

# Without this a non-zero exit tells the workflow nothing, because the detail
# went to the log rather than stdout.
on_err() {
  echo "--- last 40 log lines ---"
  tail -n 40 "$LOG" 2>/dev/null || true
}
trap on_err ERR

# MemAvailable, not MemFree: it accounts for reclaimable page cache, so it is the
# number that actually predicts whether a build will fit.
#
# Called TWICE in build mode, and that is deliberate. The first call fails fast
# before a pointless npm ci. The second runs immediately before `npm run build` —
# necessary because npm ci itself peaks around 410 MB and can consume the very
# headroom the first check just verified. The measured peak (721 MB) is in the
# build, so that is the moment the guard has to be accurate at; checking only at
# the top would let a marginal box pass the gate and then OOM nine seconds later.
require_memory() {
  local phase=$1 avail
  avail=$(awk '/^MemAvailable:/ {print int($2/1024)}' /proc/meminfo)
  echo "MEM_AVAILABLE=${avail}MB required=${BUILD_MIN_AVAIL_MB}MB phase=$phase"
  if [ "$avail" -lt "$BUILD_MIN_AVAIL_MB" ]; then
    echo "INSUFFICIENT_MEMORY avail=${avail}MB required=${BUILD_MIN_AVAIL_MB}MB phase=$phase"
    exit 1
  fi
}

case "$mode" in
  build)
    cd "$WORKSPACE"

    # Vite reads .env from the project root at build time and inlines every VITE_*
    # into the bundle. Without it config/env.ts throws in the browser, which is a
    # blank page with a console error rather than anything the deploy would catch.
    if [ ! -f .env ]; then
      echo "NO_ENV"
      exit 1
    fi

    require_memory pre-install

    # THE BACKEND SHARES THIS BOX. The 16 arogyasakhi-service processes under PM2
    # resolve the box's default node through this same user's profile, so the
    # deploy must hand that default back exactly as it found it.
    #
    # `nvm use` alone cannot break them: it rewrites PATH in THIS shell only, and
    # this shell dies when the SSM command ends. PM2's daemon is a long-running
    # process already holding its own node binary and is unreachable from here.
    #
    # What WOULD break them is `nvm alias default`, which is persistent and would
    # hand every service a different node on its next restart. Nothing below calls
    # it — and the assertion after the build is what keeps that true if someone
    # later edits this file.
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
      echo "MISSING_NVM"
      exit 1
    fi
    # nvm.sh is unversioned shell shipped by nvm; nothing to lint here.
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"

    # Captured, never assumed. The backend workflow's header says the box is on
    # Node 24 and it has also been described as 23 — reading the alias sidesteps
    # the question and keeps working if the box is upgraded.
    BOX_DEFAULT_NODE=$(nvm version default 2>/dev/null || echo '')
    echo "BOX_DEFAULT_NODE=${BOX_DEFAULT_NODE:-unknown}"

    # Restores the box default on ANY exit from here on — build failure, memory
    # guard, or success. Belt-and-braces given `nvm use` is process-scoped, but it
    # costs nothing and makes the switch visible in the deploy log.
    restore_node() {
      nvm use default >/dev/null 2>&1 || true
      echo "NODE_RESTORED=$(node -v 2>/dev/null || echo unknown)"
    }
    trap restore_node EXIT

    # package.json engines, the Dockerfile builder and CI all pin 20.11. Building
    # on the box's default would mean the bundle served to users was produced by a
    # toolchain no other environment uses, so this fails loudly rather than
    # falling back.
    if ! nvm use "$NODE_VERSION" >>"$LOG" 2>&1; then
      echo "MISSING_NODE_20 $(nvm ls --no-colors 2>/dev/null | tr '\n' ' ' | cut -c1-200)"
      exit 1
    fi
    echo "NODE=$(node -v) NPM=$(npm -v)"

    # npm ci wipes and reinstalls node_modules, which is the slowest and most
    # memory-hungry part of a deploy and is pure waste when the lockfile has not
    # moved. Keyed on the lockfile's own hash rather than a timestamp, so a
    # `git reset --hard` that rewrites the file without changing it does not
    # trigger a reinstall.
    lock_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
    stamp=node_modules/.armaan-lock-hash
    if [ ! -d node_modules ] || [ "$(cat "$stamp" 2>/dev/null || true)" != "$lock_hash" ]; then
      echo "INSTALLING deps"
      if ! npm ci >>"$LOG" 2>&1; then
        echo "INSTALL_FAILED"
        exit 1
      fi
      printf '%s' "$lock_hash" > "$stamp"
    else
      echo "DEPS_UNCHANGED"
    fi

    # Re-checked here, not just at the top: npm ci may have just consumed the
    # headroom, and this is the call that precedes the real peak.
    require_memory pre-build

    # The heap cap is what turns an over-large build into a clean failure instead
    # of a kernel-level one. Vite's own build is small; `tsc -b` is the half that
    # grows with the codebase, so it is the one that will eventually meet this cap.
    export NODE_OPTIONS="--max-old-space-size=$NODE_HEAP_MB"
    if ! npm run build >>"$LOG" 2>&1; then
      # Heap exhaustion and a genuine compile error need different fixes — raise
      # NODE_HEAP_MB versus go read the code — so they get different markers
      # rather than one that makes the operator guess from the log tail.
      if grep -qiE 'heap out of memory|Allocation failed' "$LOG"; then
        echo "BUILD_OOM heap=${NODE_HEAP_MB}MB"
      else
        echo "BUILD_FAILED"
      fi
      exit 1
    fi

    if [ ! -f dist/index.html ]; then
      echo "BUILD_FAILED no dist/index.html"
      exit 1
    fi

    # The invariant the backend actually depends on. `nvm use` above is harmless,
    # but if a future edit ever introduces `nvm alias default`, the 16 backend
    # services would silently come back on a different node at their next PM2
    # restart — a failure that would surface days later, nowhere near this deploy.
    # Fail the deploy here instead, while the cause is still on screen.
    now_default=$(nvm version default 2>/dev/null || echo '')
    if [ -n "$BOX_DEFAULT_NODE" ] && [ "$now_default" != "$BOX_DEFAULT_NODE" ]; then
      echo "DEFAULT_NODE_CHANGED was=$BOX_DEFAULT_NODE now=$now_default"
      exit 1
    fi

    # vite.config.ts sets sourcemap:true, which is right for local debugging and
    # wrong here: the maps are ~3.5 MB of a 4.4 MB dist and publish the app's full
    # source to anyone who opens devtools. Stripped after the fact rather than by
    # editing the config, so `npm run build` keeps its behaviour everywhere else.
    find dist -name '*.map' -delete

    # Travels with the release so `publish` can prove nginx is serving THIS build
    # and not a stale one that happens to return 200.
    cat > dist/BUILD_INFO <<EOF
sha=$SOURCE_SHA
node=$(node -v)
built_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

    echo "BUILT $SOURCE_SHA size=$(du -sh dist | cut -f1) files=$(find dist -type f | wc -l)"
    ;;

  publish)
    if [ ! -f "$WORKSPACE/dist/index.html" ]; then
      echo "EMPTY_ARTIFACT"
      exit 1
    fi
    # The build step runs first in the same SSM command, so a dist from an earlier
    # deploy means this run's build never produced one.
    if ! grep -qx "sha=$SOURCE_SHA" "$WORKSPACE/dist/BUILD_INFO" 2>/dev/null; then
      echo "EMPTY_ARTIFACT stale dist: $(sed -n 's/^sha=//p' "$WORKSPACE/dist/BUILD_INFO" 2>/dev/null)"
      exit 1
    fi

    mkdir -p "$RELEASES"

    # FIRST DEPLOY ONLY. A plain directory cannot be replaced atomically, so the
    # web root becomes a symlink into releases/ and every later deploy is a
    # rename — nginx never sees a half-copied SPA, where a stale index.html
    # referencing deleted asset hashes is a white screen for every user.
    #
    # Whatever was there is MOVED, never deleted: if this box was serving a
    # hand-copied build, that build is still on disk and the marker says where.
    if [ -e "$WEB_ROOT" ] && [ ! -L "$WEB_ROOT" ]; then
      backup="$RELEASES/pre-cicd-$(date -u +%Y%m%dT%H%M%SZ)"
      mv "$WEB_ROOT" "$backup"
      echo "MIGRATED_TO_RELEASES=$backup"
    fi

    release="$RELEASES/$(date -u +%Y%m%dT%H%M%SZ)-${SOURCE_SHA:0:12}"
    rm -rf "$release"
    cp -a "$WORKSPACE/dist" "$release"
    # Readable by nginx's worker, writable by nobody who does not already have
    # root. Ownership goes to the deploy user so a human can inspect it.
    chown -R "$DEV_USER":"$DEV_USER" "$release"
    find "$release" -type d -exec chmod 755 {} +
    find "$release" -type f -exec chmod 644 {} +

    # `ln -sfn` is unlink-then-symlink, so it has a window where the path does
    # not exist. Creating a temp link and renaming over it is a single rename(2).
    mkdir -p "$(dirname "$WEB_ROOT")"
    ln -sfn "$release" "$WEB_ROOT.incoming"
    mv -Tf "$WEB_ROOT.incoming" "$WEB_ROOT"

    # Never reload an invalid config — a bad conf takes the whole site down, and
    # this is the same nginx fronting the backend gateway. The new release is
    # already linked, so a fix-and-rerun picks up exactly here.
    if ! nginx -t >>"$LOG" 2>&1; then
      echo "NGINX_CONFIG_INVALID"
      tail -n 20 "$LOG" || true
      exit 1
    fi
    # reload, not restart: restart drops in-flight connections, and this nginx
    # also fronts the API gateway. Set DEPLOY_NGINX_ACTION=restart to override.
    systemctl "${DEPLOY_NGINX_ACTION:-reload}" nginx >>"$LOG" 2>&1

    # NO POST-DEPLOY VERIFICATION — REMOVED DELIBERATELY, NOT MISSING.
    #
    # This used to poll http://127.0.0.1/BUILD_INFO for up to 20s, confirm the
    # reply was `sha=$SOURCE_SHA`, and on failure swap the symlink back to the
    # previous release and exit 1 (emitting NOT_SERVING / ROLLED_BACK= for the
    # workflow to report). Removed on request.
    #
    # What that costs: a reload exiting 0 only means nginx accepted the signal.
    # Nothing now confirms a request actually reaches this build, and nothing
    # rolls back on its own. A misrouted server block, a wrong `root`, or a
    # release directory nginx cannot read all report success.
    #
    # `nginx -t` above is kept — it is a config syntax check, not a serving
    # probe, and it is what stops a broken reload taking the site down.
    #
    # Verify by hand after a deploy that matters. dist/BUILD_INFO is still
    # written by the build phase and the `location = /BUILD_INFO` block in
    # deploy/nginx/arogyasakhi-web.conf still serves it to localhost:
    #
    #   curl -s http://127.0.0.1/BUILD_INFO   # expect sha=<the sha deployed>
    #
    # /BUILD_INFO rather than /: index.html is byte-identical across builds often
    # enough that a 200 on it proves only that nginx is up, not that it is
    # serving THIS release.

    # Keep a few releases back so a rollback is one symlink swap. pre-cicd-* is
    # excluded — that is the operator's pre-existing build and is not ours to
    # reap. Note this no longer waits on a verified release, so the retained set
    # is simply the last KEEP_RELEASES deploys, working or not.
    find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -name '*-*' ! -name 'pre-cicd-*' \
         -printf '%T@\t%p\n' 2>/dev/null \
      | sort -rn | cut -f2- \
      | tail -n +$((KEEP_RELEASES + 1)) \
      | xargs -r rm -rf

    echo "DEPLOYED $SOURCE_SHA -> $release"
    ;;

  *)
    echo "unknown mode: $mode (expected build or publish)" >&2
    exit 2
    ;;
esac
