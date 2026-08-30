# GeoBucket CBT Mock Test Platform MVP

This is a monolithic repository for the secure Computer-Based Test (CBT) Mock Test Platform MVP.

---

## 1. Monorepo Structure

* **`/server`**: Node.js/Express API server. Enforces role-based session control and strips correct answers for students.
* **`/admin`**: React + Vite frontend client for the Admin Dashboard. Used by administrators, teachers, and counsellors.
* **`/frontend`**: React + Vite frontend client for candidate mock testing portal and proctor safety triggers.

---

## 2. Platform Authentication & Testing Roles

For local evaluation, the following pre-registered testing accounts are available:

### A. Admin Dashboard Access (http://localhost:5173/)
* **Administrator**:
  * **Email**: `admin@geobucket.com` | **Password**: `adminpassword`
* **Teacher**:
  * **Email**: `teacher@geobucket.com` | **Password**: `teacherpassword`
* **Counsellor**:
  * **Email**: `counsellor@geobucket.com` | **Password**: `counsellorpassword`

### B. Student Candidate Access
* **Student 1**:
  * **Roll Number**: `GEO-2026-001` | **Password**: `studentpassword`
* **Student 2**:
  * **Roll Number**: `GEO-2026-002` | **Password**: `studentpassword`

---

## 3. How to Run the Project Locally

### Prerequisites
1. **Node.js** (v18+ recommended)
2. **MongoDB** (Running locally on default port `27017` or configured via `.env` connection string)

### Step 1: Start the Database & Backend Server
1. Navigate to the root **`server/`** directory.
2. Edit **`server/.env`** to configure your database connection and secrets:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/geobucket-cbt
   JWT_SECRET=super_secret_jwt_key_123_xyz
   ```
3. Run package installations and launch:
   ```bash
   npm install
   npm run start
   ```

### Step 2: Start the Admin Dashboard Portal
1. Navigate to the **`admin/`** directory.
2. Install packages and launch:
   ```bash
   npm install
   npm run dev
   ```
3. Access the panel in your browser at `http://localhost:5173/`.