# CBT Mock Test Platform: API Documentation

This document describes the REST API endpoints designed for the CBT Mock Test Platform MVP. The API is divided into administrative operations, student examination actions, and dashboard reporting.

---

## Developer Integration Guidelines (Module Boundaries)

To maintain clean division of labor and ensure platform security, **Jaya Patel (Module 2)** and **Anubhav Rai (Module 3)** must adhere to the following integration instructions when accessing and utilizing the backend:

### 1. Module 2: Student CBT Examination (Jaya Patel)
* **API Access Points**: 
  * `GET /api/tests` to fetch tests assigned to the student.
  * `POST /api/attempts/start` to boot up the test session and retrieve the server-synced countdown parameters.
  * `PATCH /api/attempts/:id/answers` to persist student responses in real time.
  * `POST /api/attempts/:id/submit` to submit the test when completed or when the timer reaches zero.
* **Why & Where to Use**:
  * Use these endpoints to power the examination portal, load the active questions pane, update the status colors of the question palette, and display pre-exam instructions and post-exam result sheets.
* **Where/What you MUST NOT access or do**:
  * ❌ **No Correct Answers in Code**: Do not write code attempting to find, decrypt, or search for correct answers on the client during active exams. The backend strips correct answers automatically; the frontend should remain completely blind to them until post-submission results are generated.
  * ❌ **No Frontend Grading**: Do not calculate scores, marks, or pass/fail grades on the frontend. Grading is performed strictly by the backend database layer on submission to prevent exam manipulation.
  * ❌ **No Server/Admin Edits**: All UI code must stay strictly inside `frontend/` (excluding the `frontend/src/security` folder). Do not modify files in the `server/` or `admin/` root folders.

### 2. Module 3: Security, Evaluation & Analytics (Anubhav Rai)
* **API Access Points**:
  * `POST /api/auth/student/login` to perform user login and obtain student JWT tokens.
  * `POST /api/attempts/:id/violations` to report anti-cheating events (exiting fullscreen, tab-switching, refreshes).
  * `GET /api/auth/me` to authenticate current sessions and verify token validity.
* **Why & Where to Use**:
  * Use these to establish the client-side session authentication wrappers and security monitors within `frontend/src/security/`. You will provide hooks (e.g. `useAuth()`, `useExamSecurity()`) that Jaya's components can reference to block/lock the exam UI if tab switching or interruptions exceed thresholds.
* **Where/What you MUST NOT access or do**:
  * ❌ **No Admin Dashboard Actions**: Do not implement administrative API requests (like staff registration or creating tests/questions) inside student portals. Student tokens will receive `403 Forbidden` if they try to access staff endpoints.
  * ❌ **No Direct Server Mutations**: Keep all security logic and client auth hooks isolated inside **`frontend/src/security/`**. Do not modify any backend controllers in `server/` or staff actions in `admin/` directly.

---

## Base URL
All API requests are prefixed with: `/api`

---

## Authentication & Headers
All protected endpoints require an `Authorization` header containing a Bearer JWT:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Staff Register (Admin Only)
* **Endpoint**: `POST /api/auth/staff/register`
* **Access**: Staff (`admin`)
* **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@geobucket.com",
    "password": "securepassword123",
    "role": "teacher" // Enum: "admin", "teacher", "counsellor"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Staff registered successfully.",
    "staff": {
      "id": "60d5ec49344c21415273e921",
      "name": "Alex Mercer",
      "email": "alex@geobucket.com",
      "role": "teacher"
    }
  }
  ```

### Staff Login
* **Endpoint**: `POST /api/auth/staff/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "alex@geobucket.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "staff": {
      "id": "60d5ec49344c21415273e921",
      "name": "Alex Mercer",
      "email": "alex@geobucket.com",
      "role": "teacher"
    }
  }
  ```

### Student Portal Verification / Login
Students use their registration identifiers (roll numbers) and passwords to access their assigned exams on the frontend.
* **Endpoint**: `POST /api/auth/student/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "rollNumber": "GEO-2026-001",
    "password": "studentpassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "student": {
      "id": "60d5ec49344c21415273e925",
      "rollNumber": "GEO-2026-001",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

---

## 2. Test Management (Admin & Teacher Only)

### Create a Test
* **Endpoint**: `POST /api/tests`
* **Access**: Staff (`admin`, `teacher`)
* **Request Body**:
  ```json
  {
    "title": "React Basics Mock",
    "description": "Introduction mock test for React principles.",
    "subject": "Web Development",
    "topic": "React",
    "language": "English",
    "durationMinutes": 15,
    "markingScheme": {
      "MCQ": { "correct": 4, "incorrect": -1, "unattempted": 0 },
      "MSQ": { "correct": 4, "incorrect": 0, "unattempted": 0 },
      "NAT": { "correct": 4, "incorrect": 0, "unattempted": 0 }
    }
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "testId": "60d5ec49344c21415273e93a",
    "message": "Test template created successfully."
  }
  ```

### Fetch Tests List
* **Endpoint**: `GET /api/tests`
* **Access**: Authenticated Staff or Students
* **Behavior**:
  * **Staff (`admin`, `teacher`, `counsellor`)**: Returns all created tests in the database.
  * **Student**: Returns only published/active tests (`isActive: true`) that the student is eligible to take.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "tests": [
      {
        "id": "60d5ec49344c21415273e93a",
        "title": "React Basics Mock",
        "subject": "Web Development",
        "topic": "React",
        "language": "English",
        "durationMinutes": 15,
        "isActive": true
      }
    ]
  }
  ```

### Toggle Test Active State
* **Endpoint**: `PATCH /api/tests/:id/toggle`
* **Access**: Staff (`admin`, `teacher`)
* **Request Body**:
  ```json
  {
    "isActive": true
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "isActive": true,
    "message": "Test state updated."
  }
  ```

### Delete Test
* **Endpoint**: `DELETE /api/tests/:id`
* **Access**: Staff (`admin` only)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Test and all associated questions deleted."
  }
  ```

---

## 3. Question Management (Admin & Teacher Only)

### Add Question
* **Endpoint**: `POST /api/tests/:id/questions`
* **Access**: Staff (`admin`, `teacher`)
* **Request Body**:
  ```json
  {
    "type": "MCQ", // Enum: "MCQ", "MSQ", "NAT"
    "content": "<p>What hook is used to handle side effects in React?</p>",
    "options": [
      { "id": "opt_1", "text": "useState" },
      { "id": "opt_2", "text": "useEffect" },
      { "id": "opt_3", "text": "useContext" },
      { "id": "opt_4", "text": "useReducer" }
    ],
    "correctAnswer": "opt_2" // Mixed (e.g., ["opt_1", "opt_2"] for MSQ, or 42 for NAT)
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "questionId": "60d5ec49344c21415273e94f",
    "message": "Question added to test."
  }
  ```

### Fetch Questions
* **Endpoint**: `GET /api/tests/:id/questions`
* **Access**: Authenticated Staff or Students
* **Behavior**:
  * **Staff**: Returns all fields including `correctAnswer`.
  * **Student**: **CRITICAL** Strips the `correctAnswer` key from all returned questions.
* **Response (200 OK - Student Perspective)**:
  ```json
  {
    "success": true,
    "questions": [
      {
        "id": "60d5ec49344c21415273e94f",
        "type": "MCQ",
        "content": "<p>What hook is used to handle side effects in React?</p>",
        "options": [
          { "id": "opt_1", "text": "useState" },
          { "id": "opt_2", "text": "useEffect" },
          { "id": "opt_3", "text": "useContext" },
          { "id": "opt_4", "text": "useReducer" }
        ]
      }
    ]
  }
  ```

### Edit Question
* **Endpoint**: `PUT /api/questions/:questionId`
* **Access**: Staff (`admin`, `teacher`)
* **Request Body**: Similar to Add Question.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Question updated."
  }
  ```

### Delete Question
* **Endpoint**: `DELETE /api/questions/:questionId`
* **Access**: Staff (`admin`, `teacher`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Question removed from test."
  }
  ```

---

## 4. Student Examination & State APIs

### Start Exam Attempt
* **Endpoint**: `POST /api/attempts/start`
* **Access**: Student
* **Request Body**:
  ```json
  {
    "testId": "60d5ec49344c21415273e93a"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "attemptId": "60d5ec49344c21415273e99b",
    "startTime": "2026-08-30T10:00:00.000Z",
    "endTime": "2026-08-30T10:15:00.000Z", // Server-computed end time
    "durationMinutes": 15,
    "status": "active"
  }
  ```

### Live Answer Auto-Save
As students answer or mark questions for review, the client syncs choices in real-time.
* **Endpoint**: `PATCH /api/attempts/:id/answers`
* **Access**: Student
* **Request Body**:
  ```json
  {
    "questionId": "60d5ec49344c21415273e94f",
    "selectedAnswer": "opt_2", // MCQ option id, MSQ array, or NAT input
    "status": "answered" // Enum: "not_visited", "answered", "not_answered", "marked_for_review", "answered_marked_for_review"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Answer state updated."
  }
  ```

### Record Interruption (Violation)
Triggered when the client detects tab switching, exiting full-screen, or restricted keypresses.
* **Endpoint**: `POST /api/attempts/:id/violations`
* **Access**: Student
* **Request Body**:
  ```json
  {
    "type": "fullscreen_exit", // Enum: "fullscreen_exit", "tab_switch", "page_refresh", "restricted_shortcut"
    "details": "User minimized window or changed active tab."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "violationsCount": 2,
    "isLocked": false // Backend returns true if violation limit is exceeded, locking the attempt
  }
  ```

### Submit Exam
* **Endpoint**: `POST /api/attempts/:id/submit`
* **Access**: Student
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Exam submitted and evaluated successfully.",
    "evaluation": {
      "finalScore": 36,
      "correctCount": 9,
      "incorrectCount": 1,
      "skippedCount": 0,
      "evaluatedAt": "2026-08-30T10:14:32.000Z"
    }
  }
  ```

---

## 5. Dashboard Reports & Analytics

### Global Test Performance Overview
* **Endpoint**: `GET /api/reports/tests/:id/summary`
* **Access**: Staff (`admin`, `teacher`, `counsellor`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "summary": {
      "testId": "60d5ec49344c21415273e93a",
      "title": "React Basics Mock",
      "totalAttempts": 142,
      "averageScore": 24.5,
      "maxScore": 40,
      "minScore": -8,
      "averageTimeTakenSeconds": 782, // ~13 mins
      "totalViolationsReported": 34
    }
  }
  ```

### List of Attempt Metrics for Test
* **Endpoint**: `GET /api/reports/tests/:id/attempts`
* **Access**: Staff (`admin`, `teacher`, `counsellor`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "attempts": [
      {
        "attemptId": "60d5ec49344c21415273e99b",
        "studentName": "Jane Doe",
        "studentRollNumber": "GEO-2026-001",
        "status": "submitted",
        "startTime": "2026-08-30T10:00:00.000Z",
        "durationSeconds": 810,
        "score": 36,
        "violationsCount": 1
      },
      {
        "attemptId": "60d5ec49344c21415273e9ac",
        "studentName": "John Smith",
        "studentRollNumber": "GEO-2026-002",
        "status": "locked",
        "startTime": "2026-08-30T10:05:00.000Z",
        "durationSeconds": null,
        "score": null,
        "violationsCount": 4
      }
    ]
  }
  ```
