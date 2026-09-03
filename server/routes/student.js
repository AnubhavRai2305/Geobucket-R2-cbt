import express from 'express';
import Student from '../models/Student.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Staff - admin, teacher)
router.get('/', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const students = await Student.find().select('-passwordHash').populate('eligibleTests', 'title subject');
    return res.json({ success: true, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a student's eligible tests
// @route   PATCH /api/students/:id/eligibility
// @access  Private (Staff - admin, teacher)
router.patch('/:id/eligibility', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { eligibleTests } = req.body;
    
    if (!Array.isArray(eligibleTests)) {
      return res.status(400).json({ success: false, message: 'eligibleTests must be an array' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    
    student.eligibleTests = eligibleTests;
    await student.save();
    
    // Populate the newly updated tests to return
    await student.populate('eligibleTests', 'title subject');
    
    return res.json({ success: true, message: 'Student eligibility updated.', student });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
