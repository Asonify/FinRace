const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const isConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_USER !== 'your-email@gmail.com' &&
  process.env.SMTP_PASS &&
  process.env.SMTP_PASS !== 'your-gmail-app-password'
);

/**
 * Sends a due date notification email to a borrower.
 * If credentials are not configured, details are printed to stdout.
 */
const sendReminderEmail = async (borrower, loan, type) => {
  const outstanding = loan.remainingBalance;
  const dueDateStr = new Date(loan.dueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  let subject = '';
  let body = '';

  switch (type) {
    case '7_days_before':
      subject = `[FinRace Alert] Payment Reminder: ₹${outstanding.toLocaleString()} due in 7 days`;
      body = `Hi ${borrower.fullName},

This is a friendly reminder that your payment of ₹${outstanding.toLocaleString()} for the loan purpose "${loan.purpose || 'General'}" is due in 7 days on ${dueDateStr}.

Please arrange for the repayment before the due date.

Best regards,
FinRace Wealth Management`;
      break;
    case '3_days_before':
      subject = `[FinRace Alert] Action Required: ₹${outstanding.toLocaleString()} due in 3 days`;
      body = `Hi ${borrower.fullName},

Your payment of ₹${outstanding.toLocaleString()} is due in 3 days on ${dueDateStr}. 

Please proceed with the repayment at your earliest convenience.

Best regards,
FinRace Wealth Management`;
      break;
    case 'on_due_date':
      subject = `[FinRace Alert] Due Today: Payment of ₹${outstanding.toLocaleString()} is due`;
      body = `Hi ${borrower.fullName},

This is to notify you that your payment of ₹${outstanding.toLocaleString()} is due today (${dueDateStr}).

Please settle the dues today to avoid overdue interest or flags.

Best regards,
FinRace Wealth Management`;
      break;
    case 'overdue':
      subject = `[FinRace Warning] OVERDUE: Payment of ₹${outstanding.toLocaleString()} is past due`;
      body = `Dear ${borrower.fullName},

WARNING: Your payment of ₹${outstanding.toLocaleString()} is past due. It was due on ${dueDateStr}.

Please settle the outstanding balance immediately.

Best regards,
FinRace Wealth Management`;
      break;
    default:
      subject = `[FinRace Alert] Loan Notification`;
      body = `Hi ${borrower.fullName}, this is a notification regarding your active loan details.`;
  }

  if (isConfigured && borrower.email) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"FinRace Alerts" <${process.env.SMTP_USER}>`,
        to: borrower.email,
        subject: subject,
        text: body
      });
      console.log(`[EMAIL SENT] Automated ${type} alert successfully dispatched to ${borrower.fullName} <${borrower.email}>.`);
      return true;
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email via SMTP transporter:`, err.message);
      console.log(`[RETRY QUEUED] Email dispatch failed. The reminder remains unsent for retry.`);
      return false; // Return false so it can be retried once credentials/network are resolved
    }
  } else {
    printMockEmail(borrower.fullName, borrower.email, subject, body);
    return true; // Return true for mocks so we do not spam retry triggers
  }
};

function printMockEmail(name, email, subject, body) {
  console.log(`\n======================================================`);
  console.log(`[SMTP MOCK NOTIFICATION] (Configure SMTP env keys in backend/.env for real delivery)`);
  console.log(`To: ${name} <${email || 'no-email-configured@example.com'}>`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log(`======================================================\n`);
}

module.exports = {
  sendReminderEmail
};
