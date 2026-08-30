import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Staff from '../models/Staff.js';
import Student from '../models/Student.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new staff member
// @route   POST /api/auth/staff/register
// @access  Admin Only (or Public if no Staff exist yet)
router.post('/staff/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const staffCount = await Staff.countDocuments({});

    // If at least one staff exists, require admin token
    if (staffCount > 0) {
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const requester = await Staff.findById(decoded.id);

          if (!requester || requester.role !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: Only administrators can register new staff.',
            });
          }
        } catch (err) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized: Invalid admin token.',
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: Staff registration requires administrator authentication.',
        });
      }
    }

    // Check if staff already exists
    const staffExists = await Staff.findOne({ email });
    if (staffExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create staff
    const newStaff = await Staff.create({
      name,
      email,
      passwordHash,
      role: staffCount === 0 ? 'admin' : role, // Force 'admin' for the first user
    });

    res.status(201).json({
      success: true,
      message: 'Staff registered successfully.',
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Staff login
// @route   POST /api/auth/staff/login
// @access  Public
router.post('/staff/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const staff = await Staff.findOne({ email });

    if (staff && (await staff.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(staff._id, 'staff'),
        staff: {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Register a student (For testing / admin setup)
// @route   POST /api/auth/student/register
// @access  Staff Only (Admin, Teacher)
router.post('/student/register', protect, requireRole(['admin', 'teacher']), async (req, res) => {
  const { name, email, rollNumber, password } = req.body;

  try {
    const studentExists = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (studentExists) {
      return res.status(400).json({ success: false, message: 'Student with this email or roll number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newStudent = await Student.create({
      name,
      email,
      rollNumber,
      passwordHash,
      eligibleTests: [],
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      student: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        rollNumber: newStudent.rollNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Student login
// @route   POST /api/auth/student/login
// @access  Public
router.post('/student/login', async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    const student = await Student.findOne({ rollNumber });

    if (student && (await student.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(student._id, 'student'),
        student: {
          id: student._id,
          rollNumber: student.rollNumber,
          name: student.name,
          email: student.email,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid roll number or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get currently authenticated user details
// @route   GET /api/auth/me
// @access  Private (Both Staff and Student)
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    userType: req.userType,
    user: req.user,
  });
});

export default router;
