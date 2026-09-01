# Backend API Todo List (For Module 1 - Anurag)

All backend endpoints are fully implemented, enhanced, and validated against MongoDB:

### 1. Exam Attempts & Security
- [x] `POST /api/attempts/:id/violations`: Handles all violation types (`fullscreen_exit`, `tab_switch`, `page_refresh`, `restricted_shortcut`, `clipboard_action`), auto-locks at 3 infractions, and returns `{ success, violationsCount, isLocked }`.
- [x] `GET /api/attempts/:id`: Allows interruption/recovery resumption and polling of attempt status.
- [x] `POST /api/attempts/start`: Initiates student exam sessions, returning `attemptId` and countdown timer parameters.
- [x] `PATCH /api/attempts/:id/answers`: Live-syncs student responses across MCQ, MSQ, and NAT formats.
- [x] `POST /api/attempts/:id/submit`: Evaluates submissions server-side against marking schemes and grades results.
- [x] `POST /api/attempts/:id/unlock`: Staff endpoint to clear infractions and unlock student sessions.

### 2. Tests & Questions
- [x] `GET /api/tests`: Polymorphic listing (Staff: all tests; Student: active and assigned tests).
- [x] `GET /api/tests/:id/questions`: Secure question retrieval (strips `correctAnswer` for students; full schema for staff).
- [x] `POST /api/tests` & `PATCH /api/tests/:id/toggle`: Admin/Teacher test creation and publishing toggles.
- [x] `DELETE /api/tests/:id`: Admin test deletion with cascading question bank cleanup.
- [x] `POST /api/tests/:id/questions`: Admin/Teacher question creation endpoint.
- [x] `PUT /api/questions/:id` & `DELETE /api/questions/:id`: Admin/Teacher question update and deletion.

### 3. Analytics & Reporting
- [x] `GET /api/reports/tests/:id/summary`: Aggregate analytics (average score, durations, total infractions).
- [x] `GET /api/reports/tests/:id/attempts`: Candidate attempt records with timestamps and violation history.

---

# Frontend Integration Task List (For Module 2 & 3)

The backend Express server has been fully implemented, seeded, and tested. The following actions are required from the frontend teams to connect their interfaces to the APIs:

## Module 3 - Security, Anti-Cheating & Results (Anubhav Rai)

### Security

- [x] **Fullscreen Entry**: Ensure the exam strictly enters fullscreen mode when the user clicks start, utilizing the Fullscreen API.
- [x] **Fullscreen Exit Detection**: Monitor `fullscreenchange` events to detect if the student minimizes or exits fullscreen during the exam.
- [x] **Tab/Window Switching Detection**: Monitor `visibilitychange` events to detect if the student opens another tab or window.
- [x] **Send Violations to Backend**: Immediately report detected cheating events to the server to track violation counts and potential lockouts.
  * Route: `POST /api/attempts/:id/violations`
  * Body: `{ "type": "fullscreen_exit", "details": "Context..." }`
- [x] **Auth Token Binding**: Automatically append the student's JWT to all API requests to ensure secure and authorized access.
- [x] **Lockout Handler**: Monitor backend responses from violation posts and flip the `isLocked` state if the limit is exceeded.
- [x] **Freeze Exam UI**: Render an unclosable lockout overlay over the exam interface when the `isLocked` state triggers (Built `LockoutScreen`).
- [x] **Block Keyboard When Locked**: Disable all keyboard event listeners when the student is locked out to prevent further interaction.
- [x] **Keyboard Restrictions**: Block restricted keyboard shortcuts (e.g., Alt+Tab, Ctrl+C) during the active exam session.
- [x] **Copy/Cut/Paste Restrictions**: Disable clipboard events (`copy`, `cut`, `paste`) on the document body to prevent plagiarism.
- [x] **Right-Click Restriction**: Block the context menu from opening by preventing default behavior on the `contextmenu` event.
- [x] **Refresh Handling**: Implement mechanisms (e.g., beforeunload warnings) to prevent accidental page refreshes that could interrupt the exam.
- [x] **Interruption/Resume Behavior**: Fetch the active attempt state on mount to seamlessly resume an exam if the page was accidentally refreshed.
- [x] **Listener Cleanup**: Properly remove all event listeners (`useEffect` cleanup) when the exam component unmounts to prevent memory leaks.
- [x] **Violation API Failure Handling**: Gracefully handle network failures when sending violations to ensure the exam isn't blocked by a lost connection.
- [x] **Security Lifecycle Testing**: Verify that the entire sequence of cheating triggers, network calls, and UI lockouts works flawlessly together.

### Submission & Results

- [ ] **Before-Submission Confirmation Screen**: Show a warning modal prompting the user to confirm they are ready to submit their answers.
- [ ] **Submit API Integration**: Trigger the final exam submission to the backend to officially grade the attempt.
  * Route: `POST /api/attempts/:id/submit`
- [ ] **Student Result Screen**: Render a clean UI component to display the final score, correct answers count, and detailed breakdown.
- [ ] **Result API Integration**: Fetch the graded evaluation payload from the backend after submission.
- [ ] **Verify backend-generated score is displayed**: Ensure the frontend only displays the score provided by the backend evaluation, without calculating it locally.
- [ ] **Verify correct answers are not exposed before submission**: Audit the frontend state to guarantee correct answers are completely hidden during the exam.

### Integration

- [ ] **Integrate security hook with Jaya's CBT**: Provide the `useExamSecurity` hook variables directly to Jaya's main exam layout.
- [ ] **Integrate lock state with CBT UI**: Connect the `isLocked` boolean to Jaya's conditional rendering logic for the exam.
- [ ] **Integrate authentication with CBT**: Wrap Jaya's routes in the `AuthProvider` and use `user` state to gate access.
- [ ] **Test refresh → attempt recovery**: Simulate a page reload during an active exam and verify the timer and answers are restored.
- [ ] **Test security events → MongoDB**: Trigger violations and verify they are correctly appended to the `ExamAttempt` document in MongoDB.
- [ ] **Test submission → evaluation → result**: Perform an end-to-end flow from starting an exam, answering questions, and viewing the graded result.

### Final

- [ ] **End-to-end testing**: Manually test the entire Module 3 workflow.
- [ ] **Security/authorization testing**: Verify students cannot access staff endpoints and forged tokens are rejected.
- [ ] **Browser restriction testing**: Test fullscreen and tab-switch detection across Chrome, Firefox, and Edge.
- [ ] **README/documentation**: Add a section in the main README explaining the security features and how to run them.
- [ ] **Update Anubhav.md**: Log all final changes and code architecture decisions in the personal journal.
- [ ] **Clean commits / push branch**: Ensure code is linted and pushed with descriptive commit messages.

## Module 2 - CBT Mock Test Interface (Jaya Patel)
- [ ] **Fetch Eligible Tests**: Query the server to render active tests assigned to the logged-in candidate:
  * Route: `GET /api/tests`
- [ ] **Start Exam Session**: Call the start route on test launch:
  * Route: `POST /api/attempts/start` with body `{ "testId": "ObjectId" }`
  * Store the returned `attemptId` and compute the countdown duration using the `endTime` ISO timestamp.
- [ ] **Security Lockout Integration**: Use Anubhav's `useExamSecurity` hook to get `isLocked` and conditionally render `<LockoutScreen violationsCount={violationsCount} />` over the exam interface if triggered.
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
