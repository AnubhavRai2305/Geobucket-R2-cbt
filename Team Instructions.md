# Tech Stack
- React + node.js
- express.js
- MongoDB for database


## Folder structure and intuition:
- This is a monolithic repo in which all the code for this assessment will be written
- ./admin/ and ./server/ are the two folders for Module 1 chosen by Anurag Shre. The admin dashboard frontend resides in `./admin/` and the backend Express/Node server and APIs reside in `./server/`.
- ./frontend/ is for module 2 & 3 ./frontend/src/security will be for module 3 maintained by Anubhav Rai which includes backend auth, anti cheating mechanics and sending results back to backend, while the entire ./frontend/ would be maintained by Jaya Patel(module 2) where the frontend, ui/ux, cbt features, navigation, pulling the data from backend (using the auth code written by Anubhav in the security/) and display.

- other than this there are Anurag.md, Anubhav.md and Jaya.md in the project root which must be treated as code journals and summary of each changes must be logged with date and journals should be summarized by the respective person not AI agents on this file

- agents.md must be used by AI agents

### Note: all files that exist in root should be maintained by Anurag Shre other than the named files

---

## Action Items & Integration Status (As of 2026-09-01)

### Status for Anurag Shre (Module 1 - Backend & Admin) - ✅ COMPLETED
All required APIs and backend mechanics are fully implemented, enhanced, seeded, and tested:
- **Violation Sync & Auto-Lock**: `POST /api/attempts/:id/violations` handles `tab_switch`, `fullscreen_exit`, `page_refresh`, `restricted_shortcut`, and `clipboard_action`, incrementing infraction counts and auto-locking when violations $\ge 3$.
- **Session Recovery**: `GET /api/attempts/:id` is live for candidate attempt resumption and lock state synchronization.
- **Exam Lifecycle**: `POST /api/attempts/start`, `PATCH /api/attempts/:id/answers`, and `POST /api/attempts/:id/submit` are tested and active.
- **Polymorphic Question Delivery**: `GET /api/tests/:id/questions` strips `correctAnswer` for student tokens while returning full data for staff.
- **Admin Dashboard**: React + Vite admin dashboard in `./admin/` is linted and built.

### For Jaya Patel (Module 2 - Exam UI) & Anubhav Rai (Module 3 - Security & Results)
The backend is completely operational and ready for your frontend integrations:
1. **Connect Security**: In your main CBT layout, invoke `const { violationsCount, isLocked, startSecurityMonitoring } = useExamSecurity(attemptId);`.
2. **Handle Lockout**: Conditionally render `<LockoutScreen violationsCount={violationsCount} />` when `isLocked === true`.
3. **Question Display & Syncing**: Use `GET /api/tests/:id/questions` to render questions and `PATCH /api/attempts/:id/answers` to auto-save candidate selections.
4. **Auto-Submit & Grading**: On timer expiry or candidate submission, call `POST /api/attempts/:id/submit` and render the backend-evaluated score breakdown.