import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  type: { type: String, required: true, enum: ['MCQ', 'MSQ', 'NAT'] },
  content: { type: String, required: true },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
