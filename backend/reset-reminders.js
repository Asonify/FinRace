require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Reminder = require('./models/Reminder');
const { checkAndDispatchReminders } = require('./services/reminderScheduler');

async function resetAndTrigger() {
  await connectDB();
  console.log('Resetting all reminders to unsent...');
  
  const result = await Reminder.updateMany({}, { $set: { notificationSent: false } });
  console.log(`Reset ${result.modifiedCount} reminders.`);
  
  console.log('Running the email scanner now...');
  await checkAndDispatchReminders();
  
  console.log('Finished!');
  process.exit(0);
}

resetAndTrigger();
