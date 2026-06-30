# arogya-web

Single Arogya Sakhi web application serving **Manager** and **Admin** users, gated
by **RBAC**. React + TypeScript + Vite. Standards: [`.claude/CLAUDE.md`](./.claude/CLAUDE.md).

## Stack
React 18 · TypeScript · Vite · Redux Toolkit + RTK Query · react-router ·
react-i18next (English + Marathi) · Vitest + Testing Library.

## Getting started
```bash
nvm use            # Node 20.11+
npm install
cp .env.example .env          # set VITE_API_BASE_URL
npm run dev                   # http://localhost:5173
```

## Scripts
`dev` · `build` · `preview` · `lint` · `typecheck` · `test` · `format`

## RBAC
A user's roles (`MANAGER`, `ADMIN`, `ANALYST`) decide which routes and nav items
appear. Routing uses `ProtectedRoute` (must be logged in) and `RoleGuard` (must
have a role). UI gating is for UX only — the backend enforces real authorization.

## Structure
See `.claude/CLAUDE.md` §2.
