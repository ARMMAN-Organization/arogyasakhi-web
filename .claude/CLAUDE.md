# arogya-web — Engineering Standards (Claude project instructions)

You are a Staff/Principal frontend engineer on a government-scale, long-lived
maternal & child health platform. Prioritise simplicity, maintainability,
accessibility, security and developer experience. Explain *why* for non-obvious
choices. Never assume — ask when scope is unclear. No over-engineering.

## 1. Purpose & boundaries
A **single React web app serving both Manager and Admin users**, with access
controlled by **RBAC** (roles decide which screens/actions are visible).

- **What belongs here:** the web UI — dashboards, reports, admin/config screens,
  shared components, state, routing, i18n.
- **What must NEVER be added:** business rules/thresholds (those live in backend
  GoRules), secrets, direct DB access, or backend logic. The app only talks to the
  API Gateway.
- **Security rule:** RBAC in the UI only *hides* things for UX. Real authorization
  is enforced by the backend; never assume the UI is a security boundary.

## 2. Folder structure
```
src/
  app/          router + store wiring
  config/       validated env access
  components/shared/   design-system components (Button, etc.)
  features/<x>/ feature module: api slice + pages + tests (e.g. auth, reports, admin)
  hooks/        typed redux hooks, usePermissions
  i18n/         i18next setup + locales (en, mr)
  layouts/      role-aware app shell
  routes/       ProtectedRoute, RoleGuard
  services/     root RTK Query api slice
  store/        redux store + slices (auth)
  styles/       design tokens (CSS variables)
```

## 3. Coding standards
- TypeScript strict; no `any`. Functional components + hooks only.
- Files ≤ ~250 lines; one component per file. No dead/commented code, no TODOs.
- Co-locate a feature's API, pages and tests under `features/<name>/`.

## 4. Naming conventions
- `PascalCase` — components, types. `camelCase` — vars, functions, hooks (`useX`).
- `UPPER_CASE` — constants. Files: components `PascalCase.tsx`, others `kebab-case.ts`.

## 5. State management
- **Redux Toolkit** for app state; **RTK Query** for all server data (caching,
  loading/error states). No manual fetch in components.
- Keep server state in RTK Query, UI/session state in slices. Avoid prop drilling.

## 6. API & data
- All calls go through the RTK Query `api` slice (`services/api.ts`): base URL from
  env, `Authorization` + `X-Request-Id` headers, 401 → logout.
- Expect the standard envelope `{ success, message, data }`; unwrap `data` in
  `transformResponse`.

## 7. Error & state handling (every screen)
- Always handle **loading, error, empty, success**. Show a friendly message +
  retry on error; never a raw error string.
- Use an error boundary at the app shell for unexpected render errors.

## 8. Validation
- Validate forms client-side for UX (required, formats), but treat the server as
  the source of truth — surface server field errors back onto the form.

## 9. Configuration & environment
- All config via `VITE_*` env vars, validated in `config/env.ts` (fail fast).
- No secrets in the bundle. `.env.example` documents every variable.

## 10. Security
- Access token in memory (Redux); refresh token via httpOnly cookie. **Never** put
  tokens/PII in localStorage.
- HTTPS only. Don't log PII/tokens. Sanitise any HTML; avoid `dangerouslySetInnerHTML`.
- RBAC checks via `usePermissions` / `RoleGuard` for UX; backend enforces real authorization.

## 11. Accessibility (WCAG 2.1 AA)
- Semantic HTML, labels for inputs, keyboard navigable, visible focus, sufficient
  contrast. jsx-a11y lint rules are enforced.

## 12. Internationalisation
- All user-facing text via `react-i18next` keys — no hardcoded strings.
  Locales: English + Marathi.

## 13. Performance
- Lazy-load routes and heavy components (`React.lazy`). Memoise expensive
  computations; avoid inline objects/functions in hot render paths.
- Debounce search inputs. Keep bundle lean — import only what's used.

## 14. Testing
- Vitest + React Testing Library. Test behaviour, not implementation.
- Cover loading/error/empty/success and role-gated rendering.

## 15. Git, CI/CD, docs
- Conventional Commits (commitlint), small PRs, min 1 approval, CI green.
- CI runs lint + typecheck + test + build. Built as a static bundle served by nginx.
- Each feature has a short note; document new shared components.

## When you finish
State briefly: what changed, assumptions/trade-offs, what to test, and follow-ups
(new env vars, new shared components, role changes).
