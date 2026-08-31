# Anubhav's Code Journal (Module 3)

### Date: 2026-08-31
- Scaffolded the Authentication Wrappers in `frontend/src/security/`.
- Created `authService.js` to handle `/api/auth/student/login` and `/api/auth/me` endpoints for fetching and validating JWT session tokens.
- Created `AuthContext.jsx` to manage the global authentication state (user, token, loading) for the frontend application. It automatically checks for an existing session token on mount.
- Created `useAuth.js` which provides a custom React hook `useAuth()` that module 2 components can use to check the authentication state and execute login/logout actions.
- Created `useExamSecurity.js` hook to handle anti-cheating mechanisms. It attaches listeners for `visibilitychange` (tab switching), `fullscreenchange` (exiting fullscreen), and `contextmenu` events. Violations are instantly sent to the backend (`POST /api/attempts/:id/violations`), returning live `violationsCount` and `isLocked` states for Jaya's frontend components to utilize.
