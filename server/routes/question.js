import express from 'express';
import Question from '../models/Question.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Staff - admin, teacher)
router.put('/:id', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { type, content, options, correctAnswer } = req.body;
    
    const question = await Question.findByIdAndUpdate(req.params.id, {
      type,
      content,
      options,
      correctAnswer
    }, { new: true });
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    
    return res.json({ success: true, message: 'Question updated successfully.', question });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Staff - admin, teacher)
router.delete('/:id', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }
    return res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
