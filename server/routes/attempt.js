import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import ExamAttempt from '../models/ExamAttempt.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to evaluate MSQ array match (ignoring order)
const matchMSQ = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
};

// @desc    Get attempt details by ID (for resumption and security check)
// @route   GET /api/attempts/:id
// @access  Private (Student who owns the attempt or Staff)
router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt record not found.' });
    }

    if (req.userType === 'student' && attempt.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const attemptData = attempt.toObject();
    attemptData.violationsCount = attempt.securityViolations.length;

    return res.json({ success: true, attempt: attemptData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Start a test attempt
// @route   POST /api/attempts/start
// @access  Private (Student only)
router.post('/start', protect, async (req, res) => {
  try {
    if (req.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can start exam attempts.' });
    }

    const { testId } = req.body;
    if (!testId) {
      return res.status(400).json({ success: false, message: 'Test ID is required.' });
    }

    // Verify test exists and student is eligible
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }
    if (!test.isActive) {
      return res.status(400).json({ success: false, message: 'Test is not active.' });
    }

    const student = req.user;
    if (!student.eligibleTests.includes(testId)) {
      return res.status(403).json({ success: false, message: 'You are not eligible to take this test.' });
    }

    // Check for existing active/locked attempt
    let attempt = await ExamAttempt.findOne({
      studentId: student.id,
      testId,
      status: { $in: ['active', 'locked'] }
    });

    if (attempt) {
      // Resume attempt if not expired
      if (new Date() < new Date(attempt.endTime) && attempt.status !== 'locked') {
        return res.json({
          success: true,
          message: 'Resuming active exam session.',
          attemptId: attempt._id,
          startTime: attempt.startTime,
          endTime: attempt.endTime,
          durationMinutes: test.durationMinutes,
          status: attempt.status,
          attempt
        });
      }
      
      // Auto-lock if time exceeded but status was left active
      if (new Date() >= new Date(attempt.endTime)) {
        attempt.status = 'submitted';
        // Run grading fallback
        await attempt.save();
      }
    }

    // Fetch questions to initialize answers mapping
    const questions = await Question.find({ testId });
    const initialAnswers = questions.map(q => ({
      questionId: q._id,
      selectedAnswer: null,
      status: 'not_visited'
    }));

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + test.durationMinutes * 60 * 1000);

    attempt = await ExamAttempt.create({
      studentId: student.id,
      testId,
      status: 'active',
      startTime,
      endTime,
      answers: initialAnswers,
      securityViolations: []
    });

    return res.status(201).json({
      success: true,
      message: 'Exam session started.',
      attemptId: attempt._id,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      durationMinutes: test.durationMinutes,
      status: attempt.status,
      attempt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Sync / patch student answer selection live
// @route   PATCH /api/attempts/:id/answers
// @access  Private (Student only)
router.patch('/:id/answers', protect, async (req, res) => {
  try {
    const { questionId, selectedAnswer, status } = req.body;
    
    const attempt = await ExamAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt record not found.' });
    }

    if (attempt.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (attempt.status !== 'active') {
      return res.status(400).json({ success: false, message: `Exam is already ${attempt.status}.` });
    }

    if (new Date() > new Date(attempt.endTime)) {
      return res.status(400).json({ success: false, message: 'Exam time has expired.' });
    }

    // Find and update the specific answer index
    const ansIdx = attempt.answers.findIndex(ans => ans.questionId.toString() === questionId);
    if (ansIdx === -1) {
      return res.status(400).json({ success: false, message: 'Question ID does not belong to this test.' });
    }

    attempt.answers[ansIdx].selectedAnswer = selectedAnswer;
    if (status) {
      attempt.answers[ansIdx].status = status;
    }

    await attempt.save();
    return res.json({ success: true, message: 'Answer synced successfully.', attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Report fullscreen exits / tab switching / restrictions
// @route   POST /api/attempts/:id/violations
// @access  Private (Student only)
router.post('/:id/violations', protect, async (req, res) => {
  try {
    const { type, details } = req.body;
    const validViolationTypes = [
      'fullscreen_exit',
      'tab_switch',
      'page_refresh',
      'restricted_shortcut',
      'clipboard_action'
    ];

    if (!type || !validViolationTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid violation type.' });
    }

    const attempt = await ExamAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt record not found.' });
    }

    if (attempt.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (attempt.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Exam session is not active.' });
    }

    // Add violation
    attempt.securityViolations.push({
      type,
      timestamp: new Date(),
      details: details || `Infraction of type: ${type}`
    });

    // Auto lock if violations >= 3
    if (attempt.securityViolations.length >= 3) {
      attempt.status = 'locked';
    }

    await attempt.save();
    return res.json({
      success: true,
      message: 'Infraction logged successfully.',
      violationsCount: attempt.securityViolations.length,
      isLocked: attempt.status === 'locked',
      attempt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit exam and grade results
// @route   POST /api/attempts/:id/submit
// @access  Private (Student only)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt record not found.' });
    }

    if (attempt.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (attempt.status === 'submitted') {
      return res.status(400).json({ success: false, message: 'Exam is already submitted.' });
    }

    const test = await Test.findById(attempt.testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test parameters not found.' });
    }

    const questions = await Question.find({ testId: test._id });
    
    let finalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    // Process evaluation matching correct answer keys
    questions.forEach(q => {
      const studentAns = attempt.answers.find(ans => ans.questionId.toString() === q._id.toString());
      const selected = studentAns?.selectedAnswer;

      const isSkipped = selected === undefined || selected === null || 
                        (Array.isArray(selected) && selected.length === 0) || 
                        (typeof selected === 'string' && selected.trim() === '');

      if (isSkipped) {
        finalScore += test.markingScheme[q.type].unattempted;
        skippedCount++;
      } else {
        let isCorrect = false;

        if (q.type === 'MCQ') {
          isCorrect = String(selected) === String(q.correctAnswer);
        } else if (q.type === 'MSQ') {
          isCorrect = matchMSQ(selected, q.correctAnswer);
        } else if (q.type === 'NAT') {
          isCorrect = Number(selected) === Number(q.correctAnswer);
        }

        if (isCorrect) {
          finalScore += test.markingScheme[q.type].correct;
          correctCount++;
        } else {
          finalScore += test.markingScheme[q.type].incorrect;
          incorrectCount++;
        }
      }
    });

    attempt.status = 'submitted';
    attempt.evaluation = {
      finalScore,
      correctCount,
      incorrectCount,
      skippedCount,
      evaluatedAt: new Date()
    };

    await attempt.save();
    return res.json({
      success: true,
      message: 'Exam submitted and evaluated successfully.',
      evaluation: attempt.evaluation,
      attempt
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Unlock a locked student exam session
// @route   POST /api/attempts/:id/unlock
// @access  Private (Staff only)
router.post('/:id/unlock', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const attempt = await ExamAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt record not found.' });
    }

    if (attempt.status !== 'locked') {
      return res.status(400).json({ success: false, message: 'Exam session is not locked.' });
    }

    // Reset violations and set status back to active
    attempt.securityViolations = [];
    attempt.status = 'active';
    
    // Give 5 minutes extension to complete the exam or restore original if time left
    const now = new Date();
    if (now >= new Date(attempt.endTime)) {
      attempt.endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 mins grace period
    }

    await attempt.save();
    return res.json({ success: true, message: 'Exam session unlocked successfully.', attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
