# CBT Mock Test Platform: Development & Deployment Checklist

---

## 1. Backend API (Module 1 - Anurag) - ✅ COMPLETED

All backend endpoints are fully implemented, enhanced, and validated against MongoDB Atlas:

### Exam Attempts & Security
- [x] `POST /api/attempts/:id/violations`: Handles all violation types (`fullscreen_exit`, `tab_switch`, `page_refresh`, `restricted_shortcut`, `clipboard_action`), auto-locks at 3 infractions, and returns `{ success, violationsCount, isLocked }`.
- [x] `GET /api/attempts/:id`: Allows interruption/recovery resumption and polling of attempt status.
- [x] `POST /api/attempts/start`: Initiates student exam sessions, returning `attemptId` and countdown timer parameters.
- [x] `PATCH /api/attempts/:id/answers`: Live-syncs student responses across MCQ, MSQ, and NAT formats.
- [x] `POST /api/attempts/:id/submit`: Evaluates submissions server-side against marking schemes and grades results.
- [x] `POST /api/attempts/:id/unlock`: Staff endpoint to clear infractions and unlock student sessions.

### Tests & Questions
- [x] `GET /api/tests`: Polymorphic listing (Staff: all tests; Student: active and assigned tests).
- [x] `GET /api/tests/:id/questions`: Secure question retrieval (strips `correctAnswer` for students; full schema for staff).
- [x] `POST /api/tests` & `PATCH /api/tests/:id/toggle`: Admin/Teacher test creation and publishing toggles.
- [x] `DELETE /api/tests/:id`: Admin test deletion with cascading question bank cleanup.
- [x] `POST /api/tests/:id/questions`: Admin/Teacher question creation endpoint.
- [x] `PUT /api/questions/:id` & `DELETE /api/questions/:id`: Admin/Teacher question update and deletion.

### Analytics & Reporting
- [x] `GET /api/reports/tests/:id/summary`: Aggregate analytics (average score, durations, total infractions).
- [x] `GET /api/reports/tests/:id/attempts`: Candidate attempt records with timestamps and violation history.
- [x] `GET /health`: Health check endpoint for zero-downtime monitoring on Render.

---

## 2. CBT Mock Test Interface (Module 2 - Jaya Patel) - ✅ COMPLETED

- [x] **Fetch Eligible Tests**: Query server to render active tests assigned to candidate (`GET /api/tests`).
- [x] **Start Exam Session**: Call start route (`POST /api/attempts/start`), store `attemptId`, compute countdown duration.
- [x] **Security Lockout Integration**: Connect `useExamSecurity` hook to conditionally render `<LockoutScreen />` if locked.
- [x] **Fetch Secure Questions**: Load questions using `GET /api/tests/:testId/questions` (correct answers stripped by backend).
- [x] **Interactive Layouts**: Render MCQ radio buttons, MSQ multi-select checkboxes, and NAT numerical inputs.
- [x] **Auto-Save Answers**: Live-sync candidate responses via `PATCH /api/attempts/:attemptId/answers`.
- [x] **Question Palette & Navigation**: Interactive palette tracking `answered`, `marked_for_review`, and `not_visited`.
- [x] **Before-Submission Confirmation Screen**: Modal prompting the user to confirm before final submit.
- [x] **Auto-Submit on Timer Expiry**: Automatically trigger `POST /api/attempts/:attemptId/submit` when time runs out.
- [x] **Result Sheet Screen**: Render post-submission scorecards showing total score, accuracy, and performance breakdown.

---

## 3. Security, Anti-Cheating & Results (Module 3 - Anubhav Rai) - ✅ COMPLETED

### Anti-Cheating Mechanics
- [x] **Fullscreen Enforcement**: Auto-enter fullscreen mode on exam start via Fullscreen API.
- [x] **Fullscreen Exit Detection**: Listen to `fullscreenchange` and dispatch violations.
- [x] **Tab/Window Switch Detection**: Listen to `visibilitychange` (`document.hidden`) and dispatch violations.
- [x] **Restricted Key Interception**: Block `F12`, `Alt+Tab`, `PrintScreen`, and `Ctrl+C/V/X/P`.
- [x] **Clipboard Protection**: Disable `copy`, `cut`, `paste` events on document body.
- [x] **Context Menu Blocking**: Prevent right-click context menu.
- [x] **Refresh & Interruption Handling**: Prompt on `beforeunload` and resume existing attempt state seamlessly on mount.
- [x] **Lockout Overlay**: Display unclosable glassmorphism `<LockoutScreen />` and disable all keyboard events when locked.
- [x] **Violation Queueing**: Locally buffer and re-attempt violation dispatches upon network interruptions.

### Authentication & Auth Wrappers
- [x] **Auth Context & Hook**: Built `AuthContext.jsx` and `useAuth.js` to manage session persistence across routes.
- [x] **Auth Service**: Integrated `POST /api/auth/student/login` and `GET /api/auth/me`.
- [x] **Dynamic Base URL**: Integrated `API_BASE_URL` reading `VITE_API_URL` for cloud environments.

---

## 4. Production Deployment & Database Seeding - ✅ COMPLETED

- [x] **MongoDB Atlas Setup**: Configured cloud cluster connection in `server/.env`.
- [x] **Remote Database Seeding**: Executed `npm run seed` to populate staff, students, mock tests, questions, and sample attempts in MongoDB Atlas.
- [x] **Render Web Service Configuration**: Created `render.yaml` blueprint with root directory `server`, build command `npm install`, start command `npm start`, and required environment variables.
- [x] **Vercel Frontend Configuration**: Added `admin/vercel.json` and `frontend/vercel.json` SPA rewrite rules.
- [x] **Production Build Validation**: Ran `npm run build` across `admin/` and `frontend/`, verifying zero build errors and optimized bundle sizes.
- [x] **Documentation & Guides**: Updated `README.md`, `project_overview.md`, `Team Instructions.md`, and code journals with end-to-end instructions.
