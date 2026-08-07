# arogyasakhi-web — Standard Development Workflow

This file complements `.claude/CLAUDE.md` (architecture & code standards). The workflow below
is MANDATORY for every develop/modify/refactor request. Never skip a step. Never start coding
before Steps 2 AND 3 are explicitly approved by the user.

> **Parity note (brand color):** `supervisor-mobile-app` was rebranded to teal/green
> (`Primary` #014342 / `Secondary` #77E7B7) per explicit request. This app (`arogyasakhi-web`)
> has NOT been updated — `--color-primary` in `src/styles/tokens.css` is still `#7c4dff`
> (the original lavender). This is an intentional, temporary mismatch, not a bug — don't
> "fix" it without an explicit rebrand request for this app.

## Step 1 — Understand the requirement

- Read the full request carefully; be sure the objective is fully understood.
- If anything is unclear or ambiguous, ask simple, direct clarification questions.
- Do not make assumptions.

## Step 2 — Implementation plan (STOP: wait for approval)

Once the requirement is clear, provide a detailed plan covering:

- Objective of the change
- Overall approach
- Files to be created, modified, or removed
- Components, API slices, routes, or shared state affected
- Edge cases and risks (incl. RBAC visibility, responsiveness)
- Expected output after implementation

Wait for explicit confirmation before proceeding.

## Step 3 — Test cases (STOP: wait for approval)

After the plan is approved, write all functional test cases before any implementation:

- Positive, negative, and edge-case scenarios
- Validation and error-handling tests (empty/loading/error/success UI states)

Wait for explicit approval of the test cases before coding.

## Step 4 — Development

Only after test cases are approved:

- Implement the feature following the existing project architecture and coding standards
  (see `.claude/CLAUDE.md`).
- Keep code modular, reusable, and maintainable.
- Avoid any changes outside the agreed scope unless explicitly instructed.

## Design tokens (MANDATORY — the single source of truth for pixels & colors)

Every color, size, spacing and font in this app MUST come from `src/styles/tokens.css`
(root CSS variables). Inline hex values or px/rem literals in components or CSS files
are forbidden. If a design needs a value that has no token, CREATE the token first, then
use it — and keep the table below updated. Reject/flag any diff in code review that adds
a raw hex/px value where a token applies.

| Token                                                | Value                                     | Use                                                                                             |
| ---------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--color-primary`                                    | `#7c4dff`                                 | brand lavender: buttons, links, focus rings (see parity note above)                             |
| `--color-background`                                 | `#f1edf9`                                 | screen background behind cards                                                                  |
| `--risk-high`                                        | `#d32f2f`                                 | high risk, error states                                                                         |
| `--risk-moderate`                                    | `#f57c00`                                 | moderate risk                                                                                   |
| `--risk-mild`                                        | `#fbc02d`                                 | mild risk                                                                                       |
| `--risk-none`                                        | `#2e7d32`                                 | low/no risk                                                                                     |
| `--status-info`                                      | `#1d79e5`                                 | info banners                                                                                    |
| `--status-success`                                   | `#2e7d32`                                 | success states                                                                                  |
| `--status-error`                                     | `#d32f2f`                                 | error states, invalid fields                                                                    |
| `--status-warning`                                   | `#fbc02d`                                 | warning states                                                                                  |
| `--g10`…`--g500`                                     | `#f7f9fc`…`#000`                          | neutral scale: surfaces (g10) → borders (g50/g75) → text (g200/g400/g500)                       |
| `--font-sans`                                        | Cabin                                     | UI text                                                                                         |
| `--font-serif`                                       | Libre Baskerville                         | select titles only                                                                              |
| `--space-xs`…`--space-xl`                            | 4/12/16/20/24px                           | spacing scale (base-4-ish; note no 8px step today — add one if a design needs it)               |
| `--space-2xl`                                        | 32px                                      | large section gaps (dashboard stat grid, panel rows)                                            |
| `--radius-sm` / `--radius-md`                        | 8px / 16px                                | corner radii                                                                                    |
| `--chart-1`…`--chart-5`                              | `#d32f2f #1d79e5 #2e7d32 #fbc02d #7c4dff` | reuses risk/status/primary hues as a 5-slot categorical palette for stat tiles and chart series |
| `--shadow-card`                                      | soft dual shadow                          | elevation for card/panel surfaces (dashboard tiles, panels)                                     |
| `--sidebar-bg` / `--sidebar-ink` / `--sidebar-muted` | `#211b2e` / `#d9d4e6` / `#8f88a6`         | dark neutral (deep brand-tinted) sidebar surface, primary and secondary text                    |
| `--sidebar-active-bg` / `--sidebar-active-ink`       | `#34294f` / `#ffffff`                     | active nav item highlight in the sidebar                                                        |

## UI verification loop (MANDATORY for every screen built from a design)

1. **Measure, never eyeball** — derive font sizes, paddings, radii, heights from a
   high-resolution (150dpi+) render of the design; create named tokens (CSS variables /
   theme tokens) for measured values. Mapping to the nearest existing token is forbidden.
2. **Ask for Figma Dev Mode specs** (typography, spacing, effects) at Step 1 when the
   user can provide them — exact specs eliminate measurement error.
3. **Distrust framework defaults** — component-library shadows, heights and fonts rarely
   match the design system; set them explicitly from measured values.
4. **One batched visual QA round** — after delivery, request ONE browser screenshot,
   collect ALL visual deltas, fix them in a single batch. Never iterate one fix at a time.
5. **Replicate alignment intent** — match the design's alignment axis per row/group and
   note it in a code comment.

### Design-fidelity self-diff checklist (run before every handoff)

Before delivering any UI, compare the implementation against the design export
element-by-element. "Roughly similar" is not done.

1. **Container hierarchy** — reproduce surfaces exactly: background color shows only
   where the design shows it; content sits on the correct card/sheet with the right
   radius and elevation.
2. **Row grouping & alignment** — elements the design puts on one row stay on one row,
   with the same alignment axis. Never let layout convenience change the design's grouping.
3. **Typography per element** — correct font family AND size AND weight per element;
   measure from the design export instead of guessing from existing tokens.
4. **Spacing & proportions** — paddings, heights, corner radii measured from the design,
   added to `tokens.css` — never inline.
5. **Self-diff before delivery** — walk the rendered screen top-to-bottom against the
   design crop, list every visual difference, and fix them BEFORE handing over. Known
   intentional deviations (e.g. placeholder icons/assets) must be listed explicitly in
   the final summary.

## Step 5 — Final summary

After development is complete, provide:

- List of files changed
- Summary of the implementation
- Any assumptions made
- Commands required to run or test the changes (`npm run lint && npm run test`)
- Follow-up improvements or known limitations
