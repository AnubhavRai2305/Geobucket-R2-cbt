# Anubhav's Code Journal (Module 3)

### Date: 2026-08-31
- Scaffolded the Authentication Wrappers in `frontend/src/security/`.
- Created `authService.js` to handle `/api/auth/student/login` and `/api/auth/me` endpoints for fetching and validating JWT session tokens.
- Created `AuthContext.jsx` to manage the global authentication state (user, token, loading) for the frontend application. It automatically checks for an existing session token on mount.
- Created `useAuth.js` which provides a custom React hook `useAuth()` that module 2 components can use to check the authentication state and execute login/logout actions.
- Created `useExamSecurity.js` hook to handle anti-cheating mechanisms. It attaches listeners for `visibilitychange` (tab switching), `fullscreenchange` (exiting fullscreen), and `contextmenu` events. Violations are instantly sent to the backend (`POST /api/attempts/:id/violations`), returning live `violationsCount` and `isLocked` states for Jaya's frontend components to utilize.

### Date: 2026-09-01
- Tested the backend API endpoints against a native system-wide MongoDB instance. Verified successful auth flows, but discovered missing `/api/attempts/` routes.
- Completely fleshed out the **Module 3: Security checklist** inside `todo.md`.
- Expanded the `useExamSecurity.js` hook to include comprehensive anti-cheating logic:
  - Added restrictions for clipboard actions (`copy`, `cut`, `paste`).
  - Added global keyboard blocking logic that intercepts restricted shortcuts (`Alt`, `Meta`, `F12`, `PrtScn`, `Ctrl+C/V/X/P`).
  - Implemented `beforeunload` warnings to handle page refreshes.
  - Engineered an **Interruption/Resume system** that fetches the current attempt status on mount to seamlessly restore lock states if the student forces a reload.
  - Implemented a **Violation API Failure Handler** that queues failed POST requests locally and recursively flushes them when the network reconnects.
- Designed and built `LockoutScreen.jsx` & `LockoutScreen.css`, a premium glassmorphism UI overlay that conditionally renders when the backend locks the student's exam.

### Date: 2026-09-04
- Updated `authService.js` and `useExamSecurity.js` to dynamically route API requests through `API_BASE_URL` (supporting `VITE_API_URL` for Vercel deployment pointing to Render).
- Verified production build compatibility for all security components (`npm run build`).
