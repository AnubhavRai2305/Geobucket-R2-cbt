import express from 'express';
import Test from '../models/Test.js';
import ExamAttempt from '../models/ExamAttempt.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get aggregate report summary for a test
// @route   GET /api/reports/tests/:id/summary
// @access  Private (Staff only)
router.get('/tests/:id/summary', protect, requireRole(['admin', 'teacher', 'counsellor']), async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    // Aggregate attempts data
    const attempts = await ExamAttempt.find({ testId, status: 'submitted' });

    const totalAttempts = attempts.length;
    let averageScore = 0;
    let maxScore = 0;
    let minScore = 0;
    let totalViolationsReported = 0;
    let totalTimeTakenSeconds = 0;

    if (totalAttempts > 0) {
      let scoreSum = 0;
      let durationSum = 0;
      
      attempts.forEach((attempt, index) => {
        const score = attempt.evaluation?.finalScore || 0;
        scoreSum += score;
        totalViolationsReported += attempt.securityViolations.length;
        
        const duration = Math.floor((new Date(attempt.evaluation.evaluatedAt) - new Date(attempt.startTime)) / 1000);
        durationSum += duration;

        if (index === 0) {
          maxScore = score;
          minScore = score;
        } else {
          if (score > maxScore) maxScore = score;
          if (score < minScore) minScore = score;
        }
      });

      averageScore = Number((scoreSum / totalAttempts).toFixed(1));
      totalTimeTakenSeconds = Math.floor(durationSum / totalAttempts);
    }

    const allAttempts = await ExamAttempt.find({ testId });
    let totalViolationsAll = 0;
    allAttempts.forEach(attempt => {
      totalViolationsAll += attempt.securityViolations.length;
    });

    const summary = {
      testId,
      title: test.title,
      totalAttempts: allAttempts.length,
      averageScore,
      maxScore,
      minScore,
      averageTimeTakenSeconds: totalTimeTakenSeconds,
      totalViolationsReported: totalViolationsAll
    };

    return res.json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get detailed attempts logs list for a test
// @route   GET /api/reports/tests/:id/attempts
// @access  Private (Staff only)
router.get('/tests/:id/attempts', protect, requireRole(['admin', 'teacher', 'counsellor']), async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    const attempts = await ExamAttempt.find({ testId })
      .populate('studentId', 'name rollNumber')
      .sort({ createdAt: -1 });

    const formattedAttempts = attempts.map(attempt => {
      const studentName = attempt.studentId?.name || 'Unknown Student';
      const studentRollNumber = attempt.studentId?.rollNumber || 'N/A';
      
      let durationSeconds = null;
      if (attempt.status === 'submitted' && attempt.evaluation?.evaluatedAt) {
        durationSeconds = Math.floor((new Date(attempt.evaluation.evaluatedAt) - new Date(attempt.startTime)) / 1000);
      } else if (attempt.status === 'active') {
        durationSeconds = Math.floor((new Date() - new Date(attempt.startTime)) / 1000);
      }

      return {
        attemptId: attempt._id,
        studentName,
        studentRollNumber,
        status: attempt.status,
        startTime: attempt.startTime,
        durationSeconds,
        violationsCount: attempt.securityViolations.length,
        violations: attempt.securityViolations,
        score: attempt.evaluation?.finalScore !== undefined ? attempt.evaluation.finalScore : null
      };
    });

    return res.json({ success: true, attempts: formattedAttempts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
