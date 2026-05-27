<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="StackAudit Logo" />
</p>

<h1 align="center">StackAudit</h1>

<p align="center">
  <strong>Stop Overspending on AI Tools</strong><br/>
  Audit your AI stack and discover instant monthly savings.<br/>
  Analyzes API usage and subscriptions to eliminate waste.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini_AI-3.5_Flash-4285F4?logo=google&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **AI Stack Audit** | Input your current AI tools, plans, seats & spend — get an instant optimization report |
| 🤖 **AI Executive Summary** | Gemini 3.5 Flash generates a professional, context-aware savings summary |
| 📊 **Interactive Dashboard** | Pie charts, KPI cards, savings meter & action plan powered by Recharts |
| 🔒 **Lead Capture Gate** | Gated dashboard with blur overlay — unlocks after user submits business details |
| 📧 **Email Confirmation** | Nodemailer sends a branded HTML confirmation email with a report link |
| 🖨️ **PDF Export** | Print-optimized CSS for clean, professional "Save as PDF" downloads |
| 🛡️ **Admin Panel** | JWT-authenticated dashboard to view all audits, leads, and analytics |
| 🔗 **Shareable Reports** | Public share URLs with PII scrubbing for safe social sharing |
| 🐦 **Twitter/X Sharing** | One-click share to X with pre-filled savings stats |


---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite 8
- **Tailwind CSS 4** with glassmorphism utilities
- **Framer Motion** for animations
- **Recharts** for interactive charts
- **React Router** for SPA routing
- **React Hot Toast** for notifications

### Backend
- **Express 5** REST API
- **MongoDB Atlas** with Mongoose ODM (+ local JSON fallback)
- **Google Gemini 3.5 Flash** for AI-powered summaries
- **Nodemailer** for transactional emails
- **Helmet + CORS + Rate Limiting** for security
- **JWT** authentication for admin routes
- **bcrypt** password hashing (cost factor 12)

---

## 📁 Project Structure

```
StackAudit/
├── public/                     # Static assets (favicon, icons)
├── src/                        # React frontend
│   ├── components/
│   │   ├── AdminDashboard.jsx  # Admin analytics panel
│   │   ├── AdminLogin.jsx      # Admin authentication
│   │   ├── Dashboard.jsx       # Audit report dashboard
│   │   ├── MultiStepForm.jsx   # 2-step audit wizard
│   │   ├── Header.jsx          # Navigation header
│   │   └── Footer.jsx          # Site footer
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Router & landing page
│   ├── index.css               # Global styles + print CSS
│   └── main.jsx                # Entry point
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── auditController.js
│   │   │   ├── authController.js
│   │   │   └── leadController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification
│   │   │   ├── errorHandler.js # Global error handler
│   │   │   ├── rateLimiters.js # Rate limiting
│   │   │   └── validate.js     # Input validation
│   │   ├── models/
│   │   │   ├── Lead.js
│   │   │   ├── PricingData.js
│   │   │   ├── Report.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── auditRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── leadRoutes.js
│   │   ├── utils/
│   │   │   ├── aiService.js    # Gemini / OpenAI integration
│   │   │   ├── auditEngine.js  # Core audit calculation logic
│   │   │   └── emailService.js # Nodemailer email sender
│   │   └── app.js              # Express app configuration
│   ├── server.js               # Server entry point
│   ├── .env.example            # Environment template
│   └── package.json
├── .gitignore
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **MongoDB** (Atlas cloud or local instance)
- **Gemini API Key** ([get one free](https://aistudio.google.com/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/om-gavali/StackAudit.git
cd StackAudit
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
CLIENT_URL=http://localhost:5173

# AI Provider (at least one recommended)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash

# Email (optional — leave blank for test sandbox)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 4. Run the Application

Open **two terminal windows**:

```bash
# Terminal 1 — Start the backend server
cd server
node server.js
# → Server running on port 5000
```

```bash
# Terminal 2 — Start the frontend dev server
npm run dev
# → VITE ready at http://localhost:5173/
```

### 5. Open in Browser

Navigate to **http://localhost:5173/** and start auditing!

---

## 📡 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/audit` | Create a new spend audit report |
| `GET` | `/api/report/:id` | Get report by ID (PII scrubbed for public) |
| `POST` | `/api/report/:id/lead` | Submit lead capture form |
| `POST` | `/api/generate-summary` | Generate AI executive summary |

### Admin Routes (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin authentication |
| `GET` | `/api/admin/stats` | Dashboard analytics |
| `GET` | `/api/admin/reports` | List all audit reports |
| `GET` | `/api/admin/leads` | List all captured leads |
| `DELETE` | `/api/admin/reports/:id` | Delete a report |

---

## 🤖 AI Summary Engine

StackAudit uses a **multi-provider fallback** strategy for generating executive summaries:

```
Priority: Gemini 3.5 Flash → OpenAI GPT → Template Fallback
```

- **Gemini 3.5 Flash** (primary) — Free tier, fast, reasoning-enabled
- **OpenAI** (secondary) — Requires paid API key
- **Template** (fallback) — Static template if no AI keys are configured

---

## 📧 Email System

| Mode | Config | Behavior |
|------|--------|----------|
| **Production** | Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Sends real emails via your SMTP server |
| **Development** | Leave SMTP fields blank | Auto-creates [Ethereal](https://ethereal.email/) sandbox inbox with clickable preview links |

---

## 🔐 Security Features

- 🔑 **JWT authentication** for admin routes
- 🔒 **bcrypt** password hashing (cost factor 12)
- 🛡️ **Helmet** HTTP security headers
- 🚫 **CORS** origin whitelisting
- ⏱️ **Rate limiting** on authentication endpoints
- 🧹 **Input sanitization** (HTML escape for XSS prevention)
- ✅ **UUID validation** on all parameterized routes
- 🙈 **PII scrubbing** on public share links

---

## 🖨️ PDF Export

Click **"Download PDF"** on any report dashboard. The app opens the browser print dialog with optimized print styles:

- Clean white background with professional typography
- Grid layouts preserved (KPI cards, charts, action plans)
- Page-break avoidance on cards and sections
- High-contrast colors optimized for printing

---

## 👤 Admin Panel

Access the admin dashboard at `/admin/login` with your configured credentials.

**Features:**
- Total audits, leads & conversion rate
- Monthly/yearly savings aggregation
- Company stage & use case breakdown charts
- Individual report management (view / delete)
- Full lead capture details

---

## 🗄️ Data Persistence

| Storage | When Used |
|---------|-----------|
| **MongoDB Atlas** | Primary — when connected |
| **Local JSON file** (`reports-db.json`) | Automatic fallback when MongoDB is unavailable. Data persists across server restarts. |

---

## 📜 Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---------|-------------|
| `node server.js` | Start Express server |


---

<p align="center">
  Built with ❤️ by <a href="https://github.com/om-gavali">Om Gavali</a>
</p>
