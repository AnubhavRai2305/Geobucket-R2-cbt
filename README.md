# GeoBucket CBT Mock Test Platform MVP

A secure, full-stack Computer-Based Test (CBT) Mock Test Platform featuring anti-cheating mechanisms, live proctoring, server-side grading, and automated analytics.

---

## 🌐 Live Production Deployments

* **Candidate/Student Portal (Vercel)**: [https://geobucket-r2-cbt.vercel.app](https://geobucket-r2-cbt.vercel.app)
* **Admin & Proctor Dashboard (Vercel)**: [https://geobucket-r2-cbt-8orv.vercel.app](https://geobucket-r2-cbt-8orv.vercel.app)
* **Backend API & Microservices (Render)**: [https://geobucket-r2-cbt.onrender.com](https://geobucket-r2-cbt.onrender.com)
  * *Liveness & Health Check*: [https://geobucket-r2-cbt.onrender.com/health](https://geobucket-r2-cbt.onrender.com/health)

---

## 1. Monorepo Architecture

* **📁 `server/`**: Node.js + Express API server with MongoDB/Mongoose. Enforces strict role-based access control (RBAC), polymorphic data stripping (prevents question leaks), live session state tracking, and server-side exam evaluation.
* **📁 `admin/`**: React + Vite administrative portal for Teachers, Admins, and Counsellors (Test Builder, Question Editor, Live Proctoring Feed, and Reports).
* **📁 `frontend/`**: React + Vite student testing portal with full anti-cheating enforcement (fullscreen lock, tab-switching tracking, clipboard and shortcut blocking) and instant result sheets.

---

## 2. Platform Authentication & Testing Credentials

The database is pre-seeded on MongoDB Atlas with test accounts:

### Quick Reference Table
| Portal | Role | Username / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | Administrator | `admin@geobucket.com` | `adminpassword` | Full management, create/delete tests, questions & staff |
| **Admin Portal** | Teacher | `teacher@geobucket.com` | `teacherpassword` | Create/edit tests, question authoring, marking schemes |
| **Admin Portal** | Counsellor | `counsellor@geobucket.com` | `counsellorpassword` | Read-only live proctoring & analytics reports |
| **Student Portal** | Student 1 | Roll: `GEO-2026-001` (`jane@geobucket.com`) | `studentpassword` | Assigned to: *React Core Concepts* & *Node.js APIs* |
| **Student Portal** | Student 2 | Roll: `GEO-2026-002` (`john@geobucket.com`) | `studentpassword` | Assigned to: *React Core Concepts* |

### Pre-Seeded Tests
1. **React Core Concepts** (Active): Intermediate mock test covering Hooks, Virtual DOM, and State management (15 mins, MCQ, MSQ, NAT questions).
2. **Node.js & Express APIs** (Draft): Backend mock test for REST routers and MongoDB connections.

---

## 3. Quickstart & Local Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas cloud connection string)

### Step 1: Backend Setup & Database Seeding
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Create or configure `server/.env` (see `server/.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/geobucket-cbt?retryWrites=true&w=majority
   JWT_SECRET=super_secret_jwt_key_geobucket_2026
   NODE_ENV=development
   ```
3. Install dependencies and seed the database:
   ```bash
   npm install
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *Health Check: `http://localhost:5000/health`*

### Step 2: Launch the Admin Dashboard
1. Open a new terminal and navigate to `admin/`:
   ```bash
   cd admin
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173/` in your browser.

### Step 3: Launch the Student Testing Portal
1. Open another terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open the port displayed by Vite (e.g., `http://localhost:5174/`) to take tests as a student.

---

## 4. Production Deployment Topology

### A. Database (MongoDB Atlas)
* Hosted on MongoDB Atlas cluster.
* Initialized and populated using `npm run seed` inside `server/`.

### B. Backend API (Render)
* **Live Service**: `https://geobucket-r2-cbt.onrender.com`
* **Root Directory**: `server`
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Environment Variables**: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`

### C. Frontends (Vercel)
* **Student Portal**: `https://geobucket-r2-cbt.vercel.app`
* **Admin Portal**: `https://geobucket-r2-cbt-8orv.vercel.app`
* Configured with `vercel.json` SPA rewrites and `VITE_API_URL=https://geobucket-r2-cbt.onrender.com`.

---

## 5. Security & Anti-Cheating Architecture

* **Fullscreen Enforcement**: Forces candidate into fullscreen mode on exam start.
* **Tab Switch & Window Blur Detection**: Tracks `visibilitychange` events and logs infractions in real time.
* **Auto-Lockout**: Automatically locks student session upon reaching 3 violations, displaying an unclosable overlay (`LockoutScreen`).
* **Shortcut & Clipboard Blocking**: Intercepts `Ctrl+C`, `Ctrl+V`, `Alt+Tab`, `F12`, and right-click context menu.
* **Polymorphic Question Delivery**: Server strips correct answers for student tokens to prevent client-side inspection.
* **Server-Side Evaluation**: All scores are computed strictly on the backend upon submission against marking schemes (MCQ, MSQ, NAT).