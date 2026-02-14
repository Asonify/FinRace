# FinRace 🐛💰

The ultimate AI-powered finance tracking solution.

## 🚢 Main Deployment

- **Frontend**: [https://finrace.vercel.app](https://finrace.vercel.app)
- **Backend API**: [https://fin-bug.vercel.app](https://fin-bug.vercel.app)

## ✨ Features

- 📊 Track income and expenses with beautiful charts
- 🤖 AI-powered financial insights using Google Gemini
- 📸 Bill scanning with AI text extraction
- 📈 Interactive analytics and spending patterns
- 📱 Progressive Web App (PWA) - works offline
- 📥 CSV bulk upload/download
- 🔐 Secure JWT authentication
- ⚡ Optimized for fast loading (90+ Lighthouse score)

## 🛠️ Tech Stack

**Frontend**: React 19, Vite, TailwindCSS, Recharts, PWA  
**Backend**: Node.js, Express, MongoDB, JWT  
**AI**: Google Gemini API  
**Deployment**: Vercel (Frontend & Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/Surya-Bytes/FinRace.git
cd FinRace
```

**2. Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
```

Start backend:
```bash
npm start
```

**3. Setup Frontend**
```bash
cd frontend/finance-tracker
npm install
```

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📦 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory: `frontend/finance-tracker`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://fin-bug.vercel.app`

### Backend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory: `backend`
3. Add environment variables (MONGO_URI, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL)

## 📄 Documentation

- **Performance Optimization**: See `PERFORMANCE_OPTIMIZATION.md`
- **API Documentation**: Available in backend route files

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for learning or personal use.

---

**Built with ❤️ by Surya**
