const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/geobucket-cbt').then(async () => {
  const db = mongoose.connection.db;
  
  const student = await db.collection('students').findOne({ email: 'anubhav@geobucket.com' });
  const staff = await db.collection('staffs').findOne({});
  
  if (!student) {
    console.log("Could not find student");
    mongoose.disconnect();
    return;
  }
  
  if (!staff) {
    console.log("Could not find staff");
    mongoose.disconnect();
    return;
  }

  // Create Test
  const testId = new mongoose.Types.ObjectId();
  await db.collection('tests').insertOne({
    _id: testId,
    title: "Mock Test - Geomorphology",
    description: "A quick 4-question mock test to evaluate geomorphology fundamentals.",
    subject: "Geography",
    topic: "Geomorphology",
    language: "English",
    durationMinutes: 15,
    isActive: true,
    createdBy: staff._id,
    markingScheme: {
      MCQ: { correct: 4, incorrect: -1, unattempted: 0 },
      MSQ: { correct: 4, incorrect: 0, unattempted: 0 },
      NAT: { correct: 4, incorrect: 0, unattempted: 0 }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Create 4 Questions
  const questions = [
    {
      testId: testId,
      type: 'MCQ',
      content: 'Which of the following is an exogenic force?',
      options: [
        { id: 'opt_1', text: 'Volcanism' },
        { id: 'opt_2', text: 'Erosion' },
        { id: 'opt_3', text: 'Earthquakes' },
        { id: 'opt_4', text: 'Faulting' }
      ],
      correctAnswer: 'opt_2',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      testId: testId,
      type: 'MSQ',
      content: 'Select all features formed by glacial erosion:',
      options: [
        { id: 'opt_1', text: 'U-shaped valleys' },
        { id: 'opt_2', text: 'Moraines' },
        { id: 'opt_3', text: 'Cirques' },
        { id: 'opt_4', text: 'V-shaped valleys' }
      ],
      correctAnswer: ['opt_1', 'opt_3'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      testId: testId,
      type: 'MCQ',
      content: 'What is the primary agent of wind erosion?',
      options: [
        { id: 'opt_1', text: 'Water' },
        { id: 'opt_2', text: 'Ice' },
        { id: 'opt_3', text: 'Aeolian processes' },
        { id: 'opt_4', text: 'Gravity' }
      ],
      correctAnswer: 'opt_3',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      testId: testId,
      type: 'NAT',
      content: 'What is the approximate age of the Earth in billions of years? (Enter a number to one decimal place)',
      options: [],
      correctAnswer: 4.5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('questions').insertMany(questions);

  // Assign test to student
  await db.collection('students').updateOne(
    { _id: student._id },
    { $addToSet: { eligibleTests: testId } }
  );

  console.log(`Successfully created Mock Test "${testId}" with 4 questions and assigned to student ${student.email}`);
  
  mongoose.disconnect();
});
