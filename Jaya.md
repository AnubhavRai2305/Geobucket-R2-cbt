# Jaya Patel - Code Journal (Module 2)

## Date: 2026-08-31
- Scaffolded the student examination UI components in `frontend/src/components/`.
- Designed the main layout for the Computer-Based Test (CBT) candidate portal:
  - `TestList.jsx`: Dashboard displaying active tests eligible for the student.
  - `ExamWindow.jsx`: Master exam view containing the top navigation bar, question pane, timer countdown, and palette.
  - `Palette.jsx`: Side navigation grid reflecting real-time question statuses (Answered, Marked for Review, Not Visited).
  - `QuestionPane.jsx`: Interactive question renderer supporting MCQ (radio buttons), MSQ (multi-select checkboxes), and NAT (numerical keypad/input).
  - `ResultSheet.jsx`: Post-exam scorecard displaying graded totals, accuracy percentages, and subject breakdowns.

## Date: 2026-09-01
- Integrated authentication by wrapping `App.jsx` in `<AuthProvider>`, ensuring CBT routes restrict access appropriately and provide candidate token metadata via `useAuth`.
- Integrated `useExamSecurity` into `ExamWindow.jsx`.
- Developed conditional rendering for the `<LockoutScreen />` which gracefully locks the CBT interface when the violation threshold is exceeded.
- Implemented `startSecurityMonitoring()` in a `useEffect` hooked to `attemptData` to safely engage fullscreen and anti-cheating measures directly after test launch.
- Designed a custom **Submission Confirmation Modal** within the CBT layout, replacing native browser alerts for improved UI/UX consistency prior to calling the `submitExam()` endpoint.
- Completed all tasks allocated under Module 2 in `todo.md`.
- Connected the exam interface to backend endpoints:
  - `fetchTests` (`GET /api/tests`) for eligible test listings.
  - `startAttempt` (`POST /api/attempts/start`) to launch an active exam session.
  - `fetchQuestions` (`GET /api/tests/:testId/questions`) to load secure question sets.
  - `saveAnswer` (`PATCH /api/attempts/:attemptId/answers`) to live-sync candidate selections.
  - `submitExam` (`POST /api/attempts/:attemptId/submit`) for auto-submission on timer expiry and manual submission.

## Date: 2026-09-04
- Updated `examService.js` to utilize centralized `API_BASE_URL` with dynamic `VITE_API_URL` environment variable support for Vercel.
- Added `frontend/vercel.json` SPA rewrite rules to ensure seamless React Router client-side routing on Vercel (`/exam/:testId`, `/results`).
- Validated production bundle with `npm run build` (zero errors, clean asset optimization).
