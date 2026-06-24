require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { checkAndDispatchReminders } = require('./services/reminderScheduler');

async function forceTrigger() {
  await connectDB();
  console.log('Forcing the email scanner to run right now...');
  await checkAndDispatchReminders();
  console.log('Done!');
  process.exit(0);
}

forceTrigger();
