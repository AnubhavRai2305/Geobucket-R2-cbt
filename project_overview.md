# CBT Mock Test Platform: Master Specification & Project Overview

This document serves as the master technical specification for the Geobucket Computer-Based Test (CBT) Mock Test Platform MVP. It outlines the monorepo file structure, technology dependencies, database collections, security protocols, question JSON structures, administrative dashboard layouts, and cloud deployment topology.

---

## 🌐 Live Production Deployments

* **Candidate Portal (Vercel)**: [https://geobucket-r2-cbt.vercel.app](https://geobucket-r2-cbt.vercel.app)
* **Admin Dashboard (Vercel)**: [https://geobucket-r2-cbt-8orv.vercel.app](https://geobucket-r2-cbt-8orv.vercel.app)
* **Backend API (Render)**: [https://geobucket-r2-cbt.onrender.com](https://geobucket-r2-cbt.onrender.com)
  * *API Health Probe*: [https://geobucket-r2-cbt.onrender.com/health](https://geobucket-r2-cbt.onrender.com/health)

---

## 1. Monorepo Project Structure

The project code is organized as a monolithic repository split into three top-level directories:

* **📁 `server/`**: Contains the Express Node.js API server, Mongoose models, authentication middleware, and server-side grading logic.
* **📁 `admin/`**: Contains the admin dashboard UI client (React + Vite) used by administrators, teachers, and counsellors.
* **📁 `frontend/`**: Contains the student examination portal client (React + Vite), including anti-cheating state-tracking mechanics and test interface components.

---

## 2. Technology Stack & Dependencies

The platform utilizes the following NPM packages to operate:

### A. Backend Dependencies (`server/package.json`)
* **`express`**: Minimalist web framework for routing requests and compiling middlewares.
* **`mongoose`**: MongoDB object modeling tool providing schema validation and translation.
* **`jsonwebtoken`**: Issues, signs, and decodes secure stateless JWT session tokens.
* **`bcryptjs`**: Cryptographic hashing function for one-way password encryption.
* **`cors`**: Middleware to configure cross-origin resources between the frontend clients and the backend port.
* **`dotenv`**: Loads configuration variables (Database URI, secret keys, port numbers) from local `.env` files.

### B. Frontend Clients Dependencies (`admin/package.json` & `frontend/package.json`)
* **`react`**: Declarative UI rendering library.
* **`react-dom`**: Interfaces and manages updates within browser DOM views.
* **`react-router-dom`**: Client-side routing for student navigation (TestList, ExamWindow, ResultSheet).
* **`vite`**: High-performance compiler and bundler with fast Hot Module Replacement (HMR).

---

## 3. Cloud Architecture & Deployment Topology

```mermaid
graph TD
    ClientStudent["Student Frontend (https://geobucket-r2-cbt.vercel.app)"] -->|HTTPS / API Requests| BackendAPI["Express API Server (https://geobucket-r2-cbt.onrender.com)"]
    ClientAdmin["Admin Dashboard (https://geobucket-r2-cbt-8orv.vercel.app)"] -->|HTTPS / API Requests| BackendAPI
    BackendAPI -->|Mongoose Connection| MongoAtlas["MongoDB Atlas (Cloud Cluster)"]
```

* **Backend Service**: Hosted on Render as a Web Service running Node.js (`server/`).
* **Student Testing App**: Hosted on Vercel (`frontend/`), configured with `vercel.json` SPA rewrites and `VITE_API_URL`.
* **Admin Dashboard**: Hosted on Vercel (`admin/`), configured with `vercel.json` SPA rewrites and `VITE_API_URL`.
* **Database**: Hosted on MongoDB Atlas with automated collection seeding (`npm run seed`).

---

## 4. Database Architecture (MongoDB)

All data is stored in the `geobucket-cbt` database. Relational associations are maintained via references across five primary collections:

```mermaid
erDiagram
    STAFF ||--o{ TEST : "creates"
    TEST ||--|{ QUESTION : "contains"
    STUDENT ||--o{ EXAM-ATTEMPT : "undertakes"
    TEST ||--o{ EXAM-ATTEMPT : "evaluated_against"
```

1. **`Staff`**: User metadata for admin dashboard accounts.
2. **`Student`**: Student metadata, identification indexes, and test permissions.
3. **`Test`**: Test configurations, rules, and marking formats.
4. **`Question`**: Detailed question bank. Linked to `Test` via `testId`. Stores correct options.
5. **`ExamAttempt`**: Logs of student examination sessions (answers, timestamps, and violation history).

---

## 5. Authentication, Encryption, and RBAC

The system enforces strict security layers to protect credentials and restrict route access:

### A. Staff Collection & Dashboard Access Roles
Staff roles restrict access to specific backend endpoints and admin panel views:
* **`admin`**: Full systems management, staff credentials generation, and deletion rights.
* **`teacher`**: Test CRUD configuration and question generation.
* **`counsellor`**: Read-only access to live proctor logs, attempt history, and cohort statistics (cannot make mutations).

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "passwordHash": "String",
  "role": "String" // Enum: "admin", "teacher", "counsellor"
}
```

### B. Student Collection & Exam Portal Entrance
Used strictly for candidates verifying entry on the frontend client. Access is checked using unique roll numbers.

```json
{
  "_id": "ObjectId",
  "rollNumber": "String", // Unique identifier, e.g., "GEO-2026-001"
  "name": "String",
  "email": "String",
  "passwordHash": "String",
  "eligibleTests": ["ObjectId"] // List of authorized Test ObjectIds
}
```

### C. Password Encryption Mechanism (`bcryptjs`)
Plaintext passwords are never saved in the database. During registration or password change events, inputs are salted and hashed:
1. **Work Factor Salting**: Generates a random cryptographic salt (salt factor of 10) for each password.
2. **Comparison Verification**: Login matching performs secure timing-attack-resistant comparisons:
   ```javascript
   schema.methods.matchPassword = async function (enteredPassword) {
     return await bcrypt.compare(enteredPassword, this.passwordHash);
   };
   ```

### D. Session Management & Polymorphic Routing (JWT)
Upon successful verification, the backend generates a signed **JSON Web Token (JWT)** containing the user's database ID and account type scope (`staff` or `student`). Clients send this in the headers of all protected requests:
```http
Authorization: Bearer <token>
```

* **Polymorphic Content Delivery**: Student tokens return question objects with the `correctAnswer` fields stripped. Staff tokens return the complete schema objects with correct answers.
* **Protection Against URL Tampering**: Standard route protection middleware (`protect` and `requireRole`) verifies the cryptographic signature of the token at the API gateway layer before querying MongoDB.

---

## 6. Question Type JSON Schemas

The platform supports three question types:

### A. MCQ (Multiple Choice / Single Correct)
* **Behavior**: Circular radio-button selectors. Only one option can be chosen.
```json
{
  "_id": "ObjectId",
  "testId": "ObjectId",
  "type": "MCQ",
  "content": "<p>Which hook is used to cache calculation outputs between renders?</p>",
  "options": [
    { "id": "opt_1", "text": "useCallback" },
    { "id": "opt_2", "text": "useMemo" }
  ],
  "correctAnswer": "opt_2"
}
```

### B. MSQ (Multiple Select / Multiple Correct)
* **Behavior**: Checkbox selectors. Multiple options can be selected.
```json
{
  "_id": "ObjectId",
  "testId": "ObjectId",
  "type": "MSQ",
  "content": "<p>Select valid React hooks:</p>",
  "options": [
    { "id": "opt_1", "text": "useState" },
    { "id": "opt_2", "text": "useReducer" }
  ],
  "correctAnswer": ["opt_1", "opt_2"]
}
```

### C. NAT (Numerical Answer Type)
* **Behavior**: Plain input text box or virtual keypad. User types an exact number.
```json
{
  "_id": "ObjectId",
  "testId": "ObjectId",
  "type": "NAT",
  "content": "<p>Evaluate the expression: 3 * 4 + 5.</p>",
  "options": [],
  "correctAnswer": 17
}
```

---

## 7. Exam Attempt & Submission History

Exam states are stored dynamically on the server inside the **`ExamAttempt`** collection to prevent timer reset or progress loss on page refresh.

```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId",
  "testId": "ObjectId",
  "status": "String", // Enum: "active", "submitted", "locked"
  "startTime": "ISODate",
  "endTime": "ISODate",
  "answers": [
    {
      "questionId": "ObjectId",
      "selectedAnswer": "Mixed",
      "status": "String" // Enum: "not_visited", "answered", "marked_for_review", etc.
    }
  ],
  "securityViolations": [
    { "type": "fullscreen_exit", "timestamp": "ISODate", "details": "String" }
  ],
  "evaluation": {
    "finalScore": 36,
    "correctCount": 9,
    "incorrectCount": 1,
    "skippedCount": 0,
    "evaluatedAt": "ISODate"
  }
}
```

---

## 8. Administrative Dashboard Layout

The Admin Dashboard provides live monitoring tools and configuration controls:

1. **Overview & Test Builder**: Interface to create/edit tests, configure durations and marking schemes.
2. **Question Editor**: Rich question authoring with MCQ, MSQ, and NAT formats.
3. **Live Proctor Panel**: Monitoring feed tracking student session status (`active`, `submitted`, `locked`) and violation counts.
4. **Reports & Analytics**: Tabular analytics detailing student-by-student scores, durations, and question difficulty metrics.

---

## 9. Test Credentials for Platform Verification

### A. Staff Accounts (Admin Panel)
* **Administrator User**: `admin@geobucket.com` | `adminpassword`
* **Teacher User**: `teacher@geobucket.com` | `teacherpassword`
* **Counsellor User**: `counsellor@geobucket.com` | `counsellorpassword`

### B. Student Accounts (Candidate Portal)
* **Student 1**: Roll Number `GEO-2026-001` | Password `studentpassword`
* **Student 2**: Roll Number `GEO-2026-002` | Password `studentpassword`
