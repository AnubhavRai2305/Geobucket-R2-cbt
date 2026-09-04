# Tech Stack
- React + Node.js
- Express.js
- MongoDB (Atlas Cloud Cluster / Local MongoDB)
- Vercel (Frontends) & Render (Backend API)

---

## 🌐 Live Production Deployments
- **Student Exam Portal**: https://geobucket-r2-cbt.vercel.app/login (or https://geobucket-r2-cbt.vercel.app)
- **Admin & Proctor Portal**: https://geobucket-r2-cbt-8orv.vercel.app/
- **Backend API (Render)**: https://geobucket-r2-cbt.onrender.com (Health: https://geobucket-r2-cbt.onrender.com/health)

---

## Folder Structure and Architecture:
- This is a monolithic repository containing the entire Computer-Based Test (CBT) Mock Test Platform.
- **`./admin/`** and **`./server/`**: Maintained by Anurag Shre (Module 1).
  - The admin dashboard frontend resides in `./admin/` (React + Vite).
  - The backend Express/Node.js server and REST APIs reside in `./server/`.
- **`./frontend/`**: Maintained for Modules 2 & 3.
  - `./frontend/src/security/`: Maintained by Anubhav Rai (Module 3) - includes student authentication wrappers, anti-cheating monitoring (`useExamSecurity`), and session lockout overlays (`LockoutScreen`).
  - Rest of `./frontend/`: Maintained by Jaya Patel (Module 2) - includes the student test interface, question palette, answer synchronization, countdown timer, and result analytics.
- **Journals**: `Anurag.md`, `Anubhav.md`, and `Jaya.md` in the project root are individual development journals.
- **`agents.md`**: Dedicated instructions and guardrails for AI coding assistants.

> **Note**: All files in root should be maintained by Anurag Shre unless specifically designated.

---

## Project Status & Milestones

### 1. Module 1: Backend & Admin Dashboard (Anurag Shre) - ✅ COMPLETED
- REST API endpoints for authentication, test management, question authoring, live exam attempt syncing, proctoring feeds, and report aggregations are implemented and tested.
- Admin dashboard React portal is built with tabs for Test Builder, Question Editor, Proctoring Monitor, and Reports.
- Connected and seeded MongoDB Atlas cloud database (`geobucket-cbt`).

### 2. Module 2: CBT Examination Portal (Jaya Patel) - ✅ COMPLETED
- Built test selection, instructions, question panes (MCQ, MSQ, NAT), live status palette, timer countdown, and post-exam result sheets in `frontend/`.

### 3. Module 3: Security & Anti-Cheating System (Anubhav Rai) - ✅ COMPLETED
- Built `useExamSecurity.js` hook enforcing fullscreen lock, tab-switching detection, clipboard/shortcut blocking, offline violation buffering, and glassmorphism lockout overlays (`LockoutScreen`).

### 4. Cloud Deployment & Seeding - ✅ COMPLETED
- **MongoDB Atlas**: Seeded with default staff, tests, questions, and students.
- **Render**: Backend API live at `https://geobucket-r2-cbt.onrender.com`.
- **Vercel**: `admin/` (live at `https://geobucket-r2-cbt-8orv.vercel.app`) and `frontend/` (live at `https://geobucket-r2-cbt.vercel.app`) configured with `vercel.json` SPA rewrite rules and `VITE_API_URL`.

---

## MVP Evaluation Summary (Against PDF Requirements)

### ✅ What is Working (Implemented & Verified)
- **Core CBT Experience**: Student exam flow (Test Selection $\rightarrow$ Start $\rightarrow$ Examination $\rightarrow$ Submit $\rightarrow$ Result) is fully operational.
- **Question Layouts**: MCQ, MSQ, and NAT are implemented, and the Question Palette states update correctly (Answered, Marked for Review, etc.).
- **Controls**: Save & Next, Mark for Review, Clear Response, and auto-syncing of answers work.
- **Timer & Auto-Submit**: Timer is securely fetched from backend `endTime` and auto-submits upon expiry.
- **Security & Restrictions**: Full-screen mode, tab/window switching, right-click, copy/paste, and restricted shortcuts are actively monitored and trigger `<LockoutScreen>` UI if violations exceed the threshold.
- **Evaluation**: The frontend does not expose correct answers. Grading occurs server-side, and the Results screen accurately displays final scores.
- **Admin**: Staff can securely manage tests, questions, and monitor proctoring feeds.
- **Cloud Deployment**: Complete system deployed live on Render, Vercel, and MongoDB Atlas.
