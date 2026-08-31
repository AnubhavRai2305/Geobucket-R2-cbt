# Backend API Todo List (For Module 1 - Anurag)

The `/api/auth` endpoints are fully implemented and tested. However, the following core exam endpoints have not yet been built on the Node server and are returning 404 errors. They must be completed so the frontend modules can function properly:

### 1. Exam Attempts & Security
- [x] `POST /api/attempts/:id/violations`: Required for Module 3 (Anubhav) to report tab-switching and fullscreen exits.
- [x] `POST /api/attempts/start`: Required for Module 2 (Jaya) to initiate a student exam session and receive the `attemptId` and countdown timer.
- [x] `PATCH /api/attempts/:id/answers`: Required for Module 2 (Jaya) to live-sync student answer choices.
- [x] `POST /api/attempts/:id/submit`: Required for Module 2 (Jaya) to submit the exam for backend grading.

### 2. Tests & Questions
- [x] `GET /api/tests`: Required to pull the list of eligible/active tests for a logged-in student.
- [x] `GET /api/tests/:id/questions`: Required to pull the questions for a specific test (Remember: The backend MUST strip out `correctAnswer` for students!).
- [x] `POST /api/tests` & `PATCH /api/tests/:id/toggle`: Admin/Teacher routes to create tests.
- [x] `POST /api/tests/:id/questions`: Admin/Teacher routes to add questions to tests.

### 3. Analytics (Optional / Later)
- [x] `GET /api/reports/tests/:id/summary`
- [x] `GET /api/reports/tests/:id/attempts`

---

# Frontend Integration Task List (For Module 2 & 3)

The backend Express server has been fully implemented, seeded, and tested. The following actions are required from the frontend teams to connect their interfaces to the APIs:

## Module 3 - Security & Anti-Cheating (Anubhav Rai)
- [ ] **State Security Sync**: Intercept student session interactions (fullscreen exits, tab switching) and push them in real-time to the database:
  * Route: `POST /api/attempts/:id/violations`
  * Body: `{ "type": "fullscreen_exit" | "tab_switch", "details": "Context details..." }`
- [ ] **Lockout Handler**: Check the response of the violation post. If the returned attempt status is `'locked'`, immediately freeze the student's exam interface screen and block keyboard inputs.
- [ ] **Auth Token Binding**: Mount student session JWTs in the request headers on all security calls:
  ```http
  Authorization: Bearer <student-jwt-token>
  ```

## Module 2 - CBT Mock Test Interface (Jaya Patel)
- [ ] **Fetch Eligible Tests**: Query the server to render active tests assigned to the logged-in candidate:
  * Route: `GET /api/tests`
- [ ] **Start Exam Session**: Call the start route on test launch:
  * Route: `POST /api/attempts/start` with body `{ "testId": "ObjectId" }`
  * Store the returned `attemptId` and compute the countdown duration using the `endTime` ISO timestamp.
- [ ] **Fetch Secure Questions**: Load questions using:
  * Route: `GET /api/tests/:testId/questions`
  * *Notice*: The correct answers are omitted on this route. Do not perform any client-side grading.
- [ ] **Render Interactive Layouts**: Build input components based on question `type`:
  * `MCQ` $\rightarrow$ Standard Radio options (single correct option ID).
  * `MSQ` $\rightarrow$ Checkbox buttons (multiple option IDs as an array).
  * `NAT` $\rightarrow$ Virtual number pad or numeric input field.
- [ ] **Auto-Save Answers**: Live-sync candidates' options changes immediately as they browse questions:
  * Route: `PATCH /api/attempts/:attemptId/answers`
  * Body: `{ "questionId": "ObjectId", "selectedAnswer": "opt_id" | ["opt_1", "opt_2"] | 15.5, "status": "answered" | "marked_for_review" | "answered_and_marked" }`
- [ ] **Auto-Submit on Timer Expiry**: When the countdown timer reaches zero, automatically call:
  * Route: `POST /api/attempts/:attemptId/submit`
  * Fetch and render the final score from the graded `evaluation` response block.
