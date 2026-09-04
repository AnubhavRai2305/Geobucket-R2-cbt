# 30th August, 2026.
- Defined repository rules and planned about the communication strategy between backend and frontend.
- Designed polymorphic REST API endpoints (saved in `api.md`) and MongoDB schemas separating student test-takers from administrative staff (admin, teacher, counsellor roles).
- Created and launched the Express API server (in root `server/` directory) with Mongoose, incorporating standard `bcryptjs` password hashing and signed JWT authentication middleware.
- Built the React Admin Dashboard (in `admin/` directory) using state-based navigation routing, React.lazy code splitting, and a mature slate-pastel visual theme.
- Booted a local standalone MongoDB instance on port 27017 and verified all authentication API routes.

# 31st August, 2026.
- Read `todo.md` to identify missing core exam backend routes.
- Created Mongoose models for `Test.js`, `Question.js`, and `ExamAttempt.js` in `/server/models/`.
- Implemented and mounted the rest of the backend routes for:
  - Tests creation, question lists, and toggles (`server/routes/test.js`).
  - Questions updates and deletions (`server/routes/question.js`).
  - Active exam session setups, live answer syncing, warning logs triggers, auto-lock mechanisms, and scoring evaluations (`server/routes/attempt.js`).
  - Proctoring live summaries and timelines aggregates (`server/routes/report.js`).
- Refactored student registration endpoint in `/api/auth/student/register` to support assigning `eligibleTests` array.
- Wrote and executed an end-to-end API integration script to verify all core exam endpoints, validating the stripping of correct answers for students, lockouts on 3+ fullscreen exit infractions, and graded submission totals.

# 1st September, 2026.
- Audited all project documentation, specifications, and frontend integration requirements for Module 1.
- Updated `ExamAttempt.js` Mongoose schema to support expanded violation types (`fullscreen_exit`, `tab_switch`, `page_refresh`, `restricted_shortcut`, `clipboard_action`) and answer statuses.
- Added `GET /api/attempts/:id` endpoint for attempt state recovery and security status checks (`violationsCount`, `isLocked`).
- Enhanced `POST /api/attempts/:id/violations` to accept all violation types and return `{ success, violationsCount, isLocked, attempt }` matching Anubhav's `useExamSecurity.js` hook requirements.
- Implemented `DELETE /api/tests/:id` in `server/routes/test.js` to support cascading test and question deletions for administrators.
- Standardized response payloads across `POST /api/attempts/start`, `POST /api/attempts/:id/submit`, `POST /api/tests`, and `POST /api/tests/:id/questions`.
- Configured ESLint and resolved component lint issues in the Admin Dashboard (`admin/`), confirming clean production build (`npm run build`).
- Wrote and executed an end-to-end automated test suite verifying all 28 API assertions (auth, polymorphic question retrieval with stripped answers for students, security violation auto-lockouts, staff unlocking, grading evaluations, and reporting aggregations).

# 4th September, 2026.
- Configured MongoDB Atlas cloud database cluster (`geobucket-cbt`).
- Connected backend Mongoose ODM to MongoDB Atlas and executed `npm run seed` to populate staff, students, tests, questions, and sample historical exam attempt logs.
- Added production environment variable support (`VITE_API_URL`) to both the Admin Portal (`admin/src/utils/api.js`) and Student Testing Frontend (`frontend/src/api/apiConfig.js`).
- Added `vercel.json` SPA rewrite rules to both `admin/` and `frontend/` to support React Router client-side routing on Vercel without 404s.
- Created `render.yaml` Blueprint specification for deploying the backend API as a Node.js Web Service on Render.
- Executed production builds (`npm run build`) on both frontends to verify zero bundle errors.
- Updated all project documentation (`README.md`, `project_overview.md`, `todo.md`, `Team Instructions.md`, `api.md`).