import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import questionRoutes from './routes/question.js';
import attemptRoutes from './routes/attempt.js';
import reportRoutes from './routes/report.js';
import studentRoutes from './routes/student.js';

// Load env variables
dotenv.config();

// Connect database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running.' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
