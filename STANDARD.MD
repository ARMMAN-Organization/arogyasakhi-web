# Development Standards

Engineering standards for the project — quality gates, security requirements, and architectural conventions.

## Table of contents

- [Quality](#quality)
- [Security](#security)
- [Architecture, UX & Conventions](#architecture-ux--conventions)

---

## Quality

- **TypeScript strict, no `any`** — functional components + hooks only.
- **Small files** — ≤ ~250 lines, one component per file; no dead/commented code or TODOs.
- **Testing** — Vitest + React Testing Library; test behaviour; cover loading/error/empty/success + role-gated rendering; `*.test.tsx` beside the feature.
- **Quality gates** — ESLint 9 (typed rules, hooks, jsx-a11y, import-order, no-explicit-any), Prettier, `tsc --noEmit`, Vitest; run before push (husky + lint-staged on commit).
- **Every screen handles 4 states** — loading / error / empty / success (friendly error + retry, never raw error).
- **Git / CI** — Conventional Commits, small PRs, min 1 approval, CI green (lint + typecheck + test + build).
- **Approval-gated workflow** — clarify → plan → test cases → code → summary.

## Security

- **Token handling** — access token in memory, refresh token in httpOnly cookie; never tokens/PII in localStorage.
- **HTTPS only** — don't log PII/tokens.
- **XSS protection** — sanitize HTML, avoid `dangerouslySetInnerHTML`.
- **RBAC** — UI only hides for UX (`usePermissions`/`RoleGuard`); backend enforces real authorization.
- **Config** — all via `VITE_*` env vars validated in `config/env.ts` (fail fast); no secrets in bundle.
- **Validation** — client-side for UX, server is source of truth; surface server field errors on the form.

## Architecture, UX & Conventions

- **Naming** — PascalCase components/types, camelCase vars/hooks, UPPER_CASE constants; component files `PascalCase.tsx`, others `kebab-case.ts`.
- **Feature-based structure** — API + pages + tests co-located under `features/<name>/`.
- **State** — Redux Toolkit for app state, RTK Query for all server data; no manual fetch in components.
- **API** — all calls via the RTK Query api slice; standard `{ success, message, data }` envelope, 401 → logout.
- **Accessibility (WCAG 2.1 AA)** — semantic HTML, input labels, keyboard nav, visible focus, contrast; jsx-a11y enforced.
- **i18n** — all text via react-i18next keys, no hardcoded strings; English + Marathi.
- **Performance** — lazy-load routes/heavy components, memoize, debounce search, lean bundle.
