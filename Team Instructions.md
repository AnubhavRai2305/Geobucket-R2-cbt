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

## Action Items based on Anubhav's Progress (As of 2026-09-01)

### For Anurag Shre (Module 1 - Backend)
Anubhav has fully implemented the frontend security wrappers and anti-cheating hook (`useExamSecurity.js`), which now actively attempts to sync with the backend. 
**Required Actions:**
- **Implement `POST /api/attempts/:id/violations`**: The frontend is now rigorously reporting tab-switches, fullscreen exits, clipboard actions, and restricted keystrokes to this endpoint. You must build this route to track the `violationsCount` and return `isLocked: true` if the cheating threshold is exceeded.
- **Implement Core Exam Routes**: The frontend is returning 404s for the remaining exam endpoints (`/api/tests`, `/api/attempts/start`, etc.). Please reference `todo.md` for the exact list of missing routes that must be completed so Anubhav and Jaya can integrate.

### For Jaya Patel (Module 2 - Exam UI)
Anubhav has completely built the `useExamSecurity` hook and the premium `LockoutScreen` overlay.
**Required Actions:**
- **Integrate the Security Hook**: In your main exam layout component, invoke `const { violationsCount, isLocked, startSecurityMonitoring } = useExamSecurity(attemptId);`.
- **Start Monitoring**: Ensure you call `startSecurityMonitoring()` when the student officially begins the exam countdown.
- **Render the Lockout UI**: You must conditionally render Anubhav's `LockoutScreen` component on top of your exam interface if `isLocked` evaluates to `true`. This will physically freeze the student's exam until an invigilator intervenes.