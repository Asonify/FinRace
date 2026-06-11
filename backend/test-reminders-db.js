require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Borrower = require('./models/Borrower');
const Loan = require('./models/Loan');
const Reminder = require('./models/Reminder');

async function run() {
  await connectDB();
  console.log('\n======================================');
  console.log('       MONGODB DIAGNOSTICS');
  console.log('======================================');
  
  const borrowers = await Borrower.find({});
  console.log(`\n[Borrowers Ledger] Total Count: ${borrowers.length}`);
  borrowers.forEach(b => {
    console.log(`- Name: ${b.fullName} | Phone: ${b.phone} | Email: ${b.email || 'N/A'} | ID: ${b._id}`);
  });

  const loans = await Loan.find({});
  console.log(`\n[Loans] Total Count: ${loans.length}`);
  loans.forEach(l => {
    console.log(`- Borrower ID: ${l.borrowerId} | Principal: ₹${l.amountGiven} | Remaining: ₹${l.remainingBalance} | Due: ${l.dueDate.toISOString()} | Status: ${l.status}`);
  });

  const reminders = await Reminder.find({});
  console.log(`\n[Reminders] Total Count: ${reminders.length}`);
  reminders.forEach(r => {
    console.log(`- Borrower ID: ${r.borrowerId} | Milestone: ${r.reminderType} | Date: ${r.reminderDate.toISOString()} | Sent: ${r.notificationSent}`);
  });
  console.log('======================================\n');
  
  mongoose.connection.close();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
