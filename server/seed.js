import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import Staff from './models/Staff.js';
import Student from './models/Student.js';
import Test from './models/Test.js';
import Question from './models/Question.js';
import ExamAttempt from './models/ExamAttempt.js';

dotenv.config();

// Helper to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing existing database collections...');
    await Staff.deleteMany({});
    await Student.deleteMany({});
    await Test.deleteMany({});
    await Question.deleteMany({});
    await ExamAttempt.deleteMany({});

    console.log('Seeding Staff Accounts...');
    // Seed Staff with explicitly hashed passwords
    const adminPasswordHash = await hashPassword('adminpassword');
    const admin = await Staff.create({
      name: 'Aditya Admin',
      email: 'admin@geobucket.com',
      passwordHash: adminPasswordHash,
      role: 'admin'
    });

    const teacherPasswordHash = await hashPassword('teacherpassword');
    const teacher = await Staff.create({
      name: 'Sarah Teacher',
      email: 'teacher@geobucket.com',
      passwordHash: teacherPasswordHash,
      role: 'teacher'
    });

    const counsellorPasswordHash = await hashPassword('counsellorpassword');
    const counsellor = await Staff.create({
      name: 'Michael Counsellor',
      email: 'counsellor@geobucket.com',
      passwordHash: counsellorPasswordHash,
      role: 'counsellor'
    });

    console.log('Seeding Test Configurations...');
    // Seed Test
    const test1 = await Test.create({
      title: 'React Core Concepts',
      description: 'Intermediate mock evaluation covering Hooks, Virtual DOM, and State management.',
      subject: 'Computer Science',
      topic: 'React',
      language: 'English',
      durationMinutes: 15,
      isActive: true,
      markingScheme: {
        MCQ: { correct: 4, incorrect: -1, unattempted: 0 },
        MSQ: { correct: 4, incorrect: 0, unattempted: 0 },
        NAT: { correct: 4, incorrect: 0, unattempted: 0 }
      },
      createdBy: teacher._id
    });

    const test2 = await Test.create({
      title: 'Node.js & Express APIs',
      description: 'Draft evaluation for REST API routers, middlewares, and MongoDB connections.',
      subject: 'Computer Science',
      topic: 'Backend Development',
      language: 'English',
      durationMinutes: 15,
      isActive: false, // Draft test
      createdBy: teacher._id
    });

    console.log('Seeding Questions...');
    // Seed Questions for Test 1
    const q1 = await Question.create({
      testId: test1._id,
      type: 'MCQ',
      content: '<p>Which Hook is used to cache calculation outputs between renders?</p>',
      options: [
        { id: 'opt_1', text: 'useCallback' },
        { id: 'opt_2', text: 'useMemo' },
        { id: 'opt_3', text: 'useRef' },
        { id: 'opt_4', text: 'useReducer' }
      ],
      correctAnswer: 'opt_2'
    });

    const q2 = await Question.create({
      testId: test1._id,
      type: 'MSQ',
      content: '<p>Select all Hook statements that are valid rules of Hooks in React:</p>',
      options: [
        { id: 'opt_1', text: 'Only call Hooks at the top level' },
        { id: 'opt_2', text: 'Only call Hooks from regular JS functions' },
        { id: 'opt_3', text: 'Only call Hooks from React Function Components' },
        { id: 'opt_4', text: 'Hooks can be called inside conditional statements' }
      ],
      correctAnswer: ['opt_1', 'opt_3']
    });

    const q3 = await Question.create({
      testId: test1._id,
      type: 'NAT',
      content: '<p>Evaluate the output of the array state change: <code>[1, 2, 3].reduce((acc, v) => acc + v, 10)</code></p>',
      options: [],
      correctAnswer: 16
    });

    console.log('Seeding Student Accounts...');
    // Seed Students
    const studentPasswordHash = await hashPassword('studentpassword');
    const student1 = await Student.create({
      name: 'Jane Doe',
      email: 'jane@geobucket.com',
      rollNumber: 'GEO-2026-001',
      passwordHash: studentPasswordHash,
      eligibleTests: [test1._id, test2._id]
    });

    const student2 = await Student.create({
      name: 'John Smith',
      email: 'john@geobucket.com',
      rollNumber: 'GEO-2026-002',
      passwordHash: studentPasswordHash,
      eligibleTests: [test1._id]
    });

    console.log('Seeding Historical Exam Attempts...');
    // Seed a completed attempt for Jane Doe
    const now = new Date();
    await ExamAttempt.create({
      studentId: student1._id,
      testId: test1._id,
      status: 'submitted',
      startTime: new Date(now.getTime() - 25 * 60 * 1000),
      endTime: new Date(now.getTime() - 10 * 60 * 1000),
      answers: [
        { questionId: q1._id, selectedAnswer: 'opt_2', status: 'answered' }, // Correct (+4)
        { questionId: q2._id, selectedAnswer: ['opt_1', 'opt_3'], status: 'answered' }, // Correct (+4)
        { questionId: q3._id, selectedAnswer: 16, status: 'answered' } // Correct (+4)
      ],
      securityViolations: [],
      evaluation: {
        finalScore: 12,
        correctCount: 3,
        incorrectCount: 0,
        skippedCount: 0,
        evaluatedAt: new Date(now.getTime() - 10 * 60 * 1000)
      }
    });

    // Seed a locked attempt for John Smith
    await ExamAttempt.create({
      studentId: student2._id,
      testId: test1._id,
      status: 'locked',
      startTime: new Date(now.getTime() - 15 * 60 * 1000),
      endTime: new Date(now.getTime() + 0 * 60 * 1000),
      answers: [
        { questionId: q1._id, selectedAnswer: 'opt_1', status: 'answered' }, // Incorrect
        { questionId: q2._id, selectedAnswer: null, status: 'not_visited' },
        { questionId: q3._id, selectedAnswer: null, status: 'not_visited' }
      ],
      securityViolations: [
        { type: 'fullscreen_exit', timestamp: new Date(now.getTime() - 12 * 60 * 1000), details: 'Candidate exited fullscreen mode' },
        { type: 'tab_switch', timestamp: new Date(now.getTime() - 10 * 60 * 1000), details: 'Candidate navigated to browser tab' },
        { type: 'tab_switch', timestamp: new Date(now.getTime() - 8 * 60 * 1000), details: 'Candidate navigated to browser tab' }
      ]
    });

    console.log('--- DATABASE SEEDED SUCCESSFULLY ---');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ SEEDING DATABASE FAILED:', error.message);
    process.exit(1);
  }
};

seedDatabase();
