import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private (Staff gets all, Student gets eligible & active)
router.get('/', protect, async (req, res) => {
  try {
    if (req.userType === 'staff') {
      const tests = await Test.find().populate('createdBy', 'name email');
      return res.json({ success: true, tests });
    } else {
      // Student: only return tests that are active and included in their eligibleTests list
      const student = req.user;
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }
      
      const tests = await Test.find({
        _id: { $in: student.eligibleTests },
        isActive: true
      });
      return res.json({ success: true, tests });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new test module
// @route   POST /api/tests
// @access  Private (Staff - admin, teacher)
router.post('/', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, description, subject, topic, language, durationMinutes, markingScheme } = req.body;
    
    const test = await Test.create({
      title,
      description,
      subject,
      topic,
      language,
      durationMinutes,
      markingScheme,
      createdBy: req.user.id
    });
    
    return res.status(201).json({ success: true, message: 'Test created successfully.', test });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle test active status
// @route   PATCH /api/tests/:id/toggle
// @access  Private (Staff - admin, teacher)
router.patch('/:id/toggle', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }
    
    test.isActive = !test.isActive;
    await test.save();
    
    return res.json({ success: true, message: `Test status toggled to ${test.isActive ? 'Active' : 'Inactive'}.`, test });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get questions for a test
// @route   GET /api/tests/:id/questions
// @access  Private (Student & Staff)
router.get('/:id/questions', protect, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found.' });
    }

    let questions;
    if (req.userType === 'student') {
      // Strips correctAnswer for students to maintain exam security
      questions = await Question.find({ testId: req.params.id }).select('-correctAnswer');
    } else {
      questions = await Question.find({ testId: req.params.id });
    }

    return res.json({ success: true, questions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add a question to a test
// @route   POST /api/tests/:id/questions
// @access  Private (Staff - admin, teacher)
router.post('/:id/questions', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { type, content, options, correctAnswer } = req.body;
    
    const question = await Question.create({
      testId: req.params.id,
      type,
      content,
      options,
      correctAnswer
    });
    
    return res.status(201).json({ success: true, message: 'Question added successfully.', question });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
