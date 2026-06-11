require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Reminder = require('./models/Reminder');
const { checkAndDispatchReminders } = require('./services/reminderScheduler');

async function run() {
  try {
    await connectDB();
    console.log('Resetting all reminders in database to unsent (notificationSent: false)...');
    
    const result = await Reminder.updateMany({}, { $set: { notificationSent: false } });
    console.log(`Success! Reset ${result.modifiedCount} reminders in MongoDB.`);
    
    console.log('Triggering automated dispatcher to process reminders now...');
    await checkAndDispatchReminders();
    
    console.log('Done.');
  } catch (error) {
    console.error('Error during reset:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

run();
