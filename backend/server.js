require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const billScanRoutes = require("./routes/billScanRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const udhaarRoutes = require("./routes/udhaarRoutes");

// Initialize automated cron scheduler services
require('./services/reminderScheduler');

const app = express();

/**
 * CORS Setup:
 * Configures which frontends can talk to this API.
 * Includes local dev environments and the production Vercel deployment.
 */
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://finrace.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      const normalizedAllowed = allowed.toLowerCase().replace(/\/$/, "");
      const normalizedOrigin = origin.toLowerCase().replace(/\/$/, "");
      return normalizedAllowed === normalizedOrigin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/**
 * Performance:
 * Enables Gzip compression to reduce payload size for faster network transfers.
 */
const compression = require('compression');
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6
}));

/**
 * Security:
 * Standard headers to prevent common web vulnerabilities (XSS, Sniffing, Clickjacking).
 */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Stripe webhook raw handler
const { handleWebhook } = require('./controllers/stripeController');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json({ limit: '10mb', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Database Initialization
connectDB();

/**
 * API Routing Table:
 * Maps business modules to their respective route handlers.
 */
const stripeRoutes = require("./routes/stripeRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

app.use("/api/stripe", stripeRoutes);
app.use("/api/subscription", subscriptionRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/bill", billScanRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/udhaar", udhaarRoutes);

const PORT = process.env.PORT || 5000;

// Health check endpoint for monitoring/deployment heartbeat
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running successfully" });
});

// Entry point for local development
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

/**
 * Fallback error handler:
 * Catches all unhandled errors and returns a sanitized JSON response.
 */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;