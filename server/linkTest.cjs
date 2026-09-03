const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/geobucket-cbt').then(async () => {
  const db = mongoose.connection.db;
  const tests = await db.collection('tests').find({}).toArray();
  const students = await db.collection('students').find({}).toArray();
  
  console.log('Tests found:', tests.length);
  console.log('Students found:', students.length);
  
  if (tests.length > 0 && students.length > 0) {
    const testId = tests[0]._id;
    const studentId = students[0]._id;
    
    // Check if test is active
    if (!tests[0].isActive) {
        console.log('Test is NOT active! Activating it...');
        await db.collection('tests').updateOne({ _id: testId }, { $set: { isActive: true } });
    }

    await db.collection('students').updateOne(
      { _id: studentId },
      { $addToSet: { eligibleTests: testId } }
    );
    console.log('Successfully linked test to the student!');
  }
  
  mongoose.disconnect();
});
