# Code Review Checklist — arogya-web

- [ ] Handles loading / error / empty / success states
- [ ] Server data via RTK Query (no ad-hoc fetch); 401 handled
- [ ] RBAC gating via RoleGuard/usePermissions (UX only; backend enforces authz)
- [ ] All user-facing text via i18n keys (en + mr)
- [ ] Accessible: labels, keyboard, focus, contrast (jsx-a11y clean)
- [ ] No secrets/PII/tokens in code, logs, or localStorage
- [ ] Routes/heavy components lazy-loaded; no needless re-renders
- [ ] Types strict (no `any`); files ≤ ~250 lines; names per convention
- [ ] Tests added (behaviour + role-gated rendering)
- [ ] Conventional commit; PR small and scoped
