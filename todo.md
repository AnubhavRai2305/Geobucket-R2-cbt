# Backend API Todo List (For Module 1 - Anurag)

The `/api/auth` endpoints are fully implemented and tested. However, the following core exam endpoints have not yet been built on the Node server and are returning 404 errors. They must be completed so the frontend modules can function properly:

### 1. Exam Attempts & Security
- [ ] `POST /api/attempts/:id/violations`: Required for Module 3 (Anubhav) to report tab-switching and fullscreen exits.
- [ ] `POST /api/attempts/start`: Required for Module 2 (Jaya) to initiate a student exam session and receive the `attemptId` and countdown timer.
- [ ] `PATCH /api/attempts/:id/answers`: Required for Module 2 (Jaya) to live-sync student answer choices.
- [ ] `POST /api/attempts/:id/submit`: Required for Module 2 (Jaya) to submit the exam for backend grading.

### 2. Tests & Questions
- [ ] `GET /api/tests`: Required to pull the list of eligible/active tests for a logged-in student.
- [ ] `GET /api/tests/:id/questions`: Required to pull the questions for a specific test (Remember: The backend MUST strip out `correctAnswer` for students!).
- [ ] `POST /api/tests` & `PATCH /api/tests/:id/toggle`: Admin/Teacher routes to create tests.
- [ ] `POST /api/tests/:id/questions`: Admin/Teacher routes to add questions to tests.

### 3. Analytics (Optional / Later)
- [ ] `GET /api/reports/tests/:id/summary`
- [ ] `GET /api/reports/tests/:id/attempts`
