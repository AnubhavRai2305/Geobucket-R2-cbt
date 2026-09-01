# Jaya Patel - Code Journal

## Date: 2026-09-01
**Summary of Changes:**
- Integrated authentication by wrapping `App.jsx` in `<AuthProvider>`, ensuring CBT routes restrict access appropriately and provide candidate token metadata via `useAuth`.
- Integrated `useExamSecurity` into `ExamWindow.jsx`.
- Developed conditional rendering for the `<LockoutScreen />` which gracefully locks the CBT interface when the violation threshold is exceeded.
- Implemented `startSecurityMonitoring()` in a `useEffect` hooked to `attemptData` to safely engage fullscreen and anti-cheating measures directly after test launch.
- Designed a custom **Submission Confirmation Modal** within the CBT layout, replacing native browser alerts for improved UI/UX consistency prior to calling the `submitExam()` endpoint.
- Completed all tasks allocated under Module 2 in `todo.md`.

*Next steps: Final end-to-end testing of Module 2 alongside Anubhav's Module 3 security validations.*