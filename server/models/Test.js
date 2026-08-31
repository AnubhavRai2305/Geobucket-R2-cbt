import mongoose from 'mongoose';

const markingSchemeSchema = new mongoose.Schema({
  correct: { type: Number, required: true, default: 4 },
  incorrect: { type: Number, required: true, default: 0 },
  unattempted: { type: Number, required: true, default: 0 }
}, { _id: false });

const testSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, trim: true },
  language: { type: String, default: 'English' },
  durationMinutes: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  markingScheme: {
    MCQ: { type: markingSchemeSchema, default: () => ({ correct: 4, incorrect: -1, unattempted: 0 }) },
    MSQ: { type: markingSchemeSchema, default: () => ({ correct: 4, incorrect: 0, unattempted: 0 }) },
    NAT: { type: markingSchemeSchema, default: () => ({ correct: 4, incorrect: 0, unattempted: 0 }) }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Test = mongoose.model('Test', testSchema);
export default Test;
