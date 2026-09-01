import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
  status: {
    type: String,
    enum: ['not_visited', 'not_answered', 'answered', 'marked_for_review', 'answered_and_marked', 'answered_marked_for_review'],
    default: 'not_visited'
  }
}, { _id: false });

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['fullscreen_exit', 'tab_switch', 'page_refresh', 'restricted_shortcut', 'clipboard_action']
  },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  finalScore: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  incorrectCount: { type: Number, required: true },
  skippedCount: { type: Number, required: true },
  evaluatedAt: { type: Date, default: Date.now }
}, { _id: false });

const examAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  status: { type: String, enum: ['active', 'submitted', 'locked'], default: 'active' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, required: true },
  answers: [answerSchema],
  securityViolations: [violationSchema],
  evaluation: evaluationSchema
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);
export default ExamAttempt;
