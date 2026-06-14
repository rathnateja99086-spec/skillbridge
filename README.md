# 🌉 Skill Bridge

AI-powered resume analysis, skill gap detection, and career coaching for students.

---

## 🗂 Project Structure

```
skillbridge/
├── backend/        → Node.js + Express API
└── frontend/       → React app
```

---

## ⚙️ Setup Instructions

### Step 1 — Firebase Admin Setup

The backend uses Firebase Admin SDK to verify user tokens and save data to Firestore.

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Open your **Skill Bridge** project
3. Go to **Project Settings → Service Accounts**
4. Click **"Generate new private key"** → download the JSON file
5. Rename it to `serviceAccountKey.json`
6. Place it inside the `backend/` folder

> ⚠️ Never commit this file to GitHub. It's already in `.gitignore`.

---

### Step 2 — Backend Setup

```bash
cd skillbridge/backend
npm install
```

Make sure your `.env` file has:
```
GROQ_API_KEY=gsk_your_groq_key_here
PORT=5000
FIREBASE_PROJECT_ID=skillbuild-45db0
```

Set the Firebase credentials environment variable:

**On Windows (PowerShell):**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\backend\serviceAccountKey.json"
```

**On Mac/Linux:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/full/path/to/backend/serviceAccountKey.json"
```

Start the backend:
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Frontend Setup

```bash
cd skillbridge/frontend
npm install
npm start
```

The React app opens at **http://localhost:3000**

> The frontend proxies all `/api/...` calls to `http://localhost:5000` automatically (configured in `package.json`).

---

### Step 4 — Firebase Console Settings

Make sure these are enabled in your Firebase project:

**Authentication → Sign-in method:**
- ✅ Email/Password
- ✅ Google
- ✅ Phone

**Firestore Database:**
- ✅ Created in test mode

**Authorized domains (Authentication → Settings → Authorized domains):**
- ✅ localhost (already there by default)

---

## 🚀 Running the Full App

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd skillbridge/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd skillbridge/frontend
npm start
```

Then open **http://localhost:3000** in your browser.

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Login with Email, Google, or Phone |
| Dashboard | `/dashboard` | Overview, stats, history |
| Resume Scorer | `/resume-scorer` | Upload PDF → AI score + feedback |
| Skill Gap | `/skill-gap` | Gap analysis + courses + projects |
| ResumeBot | `/chatbot` | AI career coach chatbot |

---

## 🔐 Data Saved per User (Firestore)

```
users/{uid}/
  ├── resumeScores/       → past resume analyses
  ├── skillGapAnalyses/   → past skill gap reports
  └── chatHistory/        → chatbot conversations
```

---

## 🌐 Deploying (Free)

### Frontend → Vercel
```bash
cd frontend
npm run build
# Upload the build/ folder to vercel.com
```

### Backend → Render
1. Push backend to GitHub
2. Go to render.com → New Web Service
3. Add environment variables (GROQ_API_KEY, GOOGLE_APPLICATION_CREDENTIALS content)
4. Deploy

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Chart.js |
| Backend | Node.js, Express |
| Auth | Firebase Authentication |
| Database | Firestore |
| AI | Groq API (LLaMA 3.3 70B) |
| PDF | pdf-parse (server-side) |
| Styling | Custom CSS with Inter font |
