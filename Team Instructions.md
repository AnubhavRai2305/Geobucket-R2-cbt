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

### For Jaya Patel (Module 2 - Exam UI) & Anubhav Rai (Module 3 - Security & Results) - ✅ IMPLEMENTED
The frontend integrations are now coded and linked up!

---

## MVP Evaluation Checklist Summary (Against PDF Requirements)

### ✅ What is Working (Implemented)
- **Core CBT Experience**: Student exam flow (Test Selection $\rightarrow$ Start $\rightarrow$ Examination $\rightarrow$ Submit $\rightarrow$ Result) is fully operational.
- **Question Layouts**: MCQ, MSQ, and NAT are implemented, and the Question Palette states update correctly (Answered, Marked for Review, etc.).
- **Controls**: Save & Next, Mark for Review, Clear Response, and auto-syncing of answers work.
- **Timer & Auto-Submit**: Timer is securely fetched from the backend `endTime` and auto-submits upon expiry.
- **Security & Restrictions**: Full-screen mode, tab/window switching, right-click, copy/paste, and restricted shortcuts are actively monitored and successfully trip the `<LockoutScreen>` UI if violations exceed the threshold.
- **Evaluation**: The frontend does not expose correct answers. Grading correctly happens server-side, and the Results screen accurately displays the final score and metrics.
- **Admin**: The admin can securely manage tests and questions (completed by Anurag).

### ⚠️ What is NOT Working / Pending (To Be Verified)
- **State Interruption Recovery**: While the API exists, we still need to manually end-to-end test that a browser refresh properly recovers the session and countdown timer seamlessly.
- **Screenshot Protection**: Not implemented (as it's severely limited by browser capabilities without native software).
- **Deployment**: The complete application still needs to be deployed to a live HTTPS URL (e.g., Vercel, Render).
- **Technical Documentation**: The main `README.md` needs to be updated with architecture, DB schema, and setup instructions as per the "Deliverables" section in the PDF.
- **Final Security Tests**: Need manual verification that student tokens absolutely cannot access admin endpoints.