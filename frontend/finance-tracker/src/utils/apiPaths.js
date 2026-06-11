export const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

//utils/apiPaths.js
export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/getUser",
        UPDATE_USER: "/api/v1/auth/update-user",
    },
    DASHBOARD: {
        GET_DATA: "/api/v1/dashboard",
    },
    INCOME: {
        ADD_INCOME: "/api/v1/income/add",
        GET_INCOME: "/api/v1/income/get",
        GET_ALL_INCOME: "/api/v1/income/get",
        DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
        DOWNLOAD_INCOME: '/api/v1/income/downloadexcel',
        BULK_UPLOAD: '/api/v1/income/bulk-upload',
    },
    EXPENSE: {
        ADD_EXPENSE: "/api/v1/expense/add",
        GET_ALL_EXPENSE: "/api/v1/expense/get",
        DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
        DOWNLOAD_EXPENSE: '/api/v1/expense/downloadexcel',
        BULK_UPLOAD: '/api/v1/expense/bulk-upload',
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/v1/auth/upload-image",
    },
    AI: {
        ANALYZE: "/api/v1/ai/analyze",
        CACHED_ANALYSIS: "/api/v1/ai/cached-analysis",
        PREDICT_EXPENSES: "/api/v1/ai/predict-expenses",
        ANALYZE_SPENDING: "/api/v1/ai/analyze-spending",
        HEALTH_SCORE: "/api/v1/ai/health-score",
        USAGE_STATS: "/api/v1/ai/usage-stats",
    },
    BILL: {
        SCAN: "/api/v1/bill/scan",
    },
    TRANSACTION: {
        BULK_UPLOAD: "/api/v1/transaction/bulk-upload",
    },
    UDHAAR: {
        GET_ALL: "/api/v1/udhaar",
        GET_BY_ID: (id) => `/api/v1/udhaar/${id}`,
        ADD: "/api/v1/udhaar/add",
        UPDATE: (id) => `/api/v1/udhaar/${id}`,
        DELETE: (id) => `/api/v1/udhaar/${id}`,
        ADD_PAYMENT: "/api/v1/udhaar/payments",
        EDIT_PAYMENT: (paymentId) => `/api/v1/udhaar/payments/${paymentId}`,
        DELETE_PAYMENT: (paymentId) => `/api/v1/udhaar/payments/${paymentId}`,
        GET_REMINDERS: "/api/v1/udhaar/reminders",
        UPDATE_REMINDER: (reminderId) => `/api/v1/udhaar/reminders/${reminderId}`,
        DELETE_REMINDER: (reminderId) => `/api/v1/udhaar/reminders/${reminderId}`,
        EXPORT_EXCEL: "/api/v1/udhaar/export/excel",
        EXPORT_CSV: "/api/v1/udhaar/export/csv",
        BACKUP: "/api/v1/udhaar/backup",
        RESTORE: "/api/v1/udhaar/restore",
    },
    STRIPE: {
        CHECKOUT: "/api/stripe/create-checkout-session",
        PORTAL: "/api/stripe/create-portal-session",
        MOCK_SUCCESS: "/api/stripe/mock-success",
    },
    SUBSCRIPTION: {
        GET_PLAN: "/api/subscription/current-plan",
    },
};