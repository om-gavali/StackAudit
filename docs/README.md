# StackAudit 📊

StackAudit is a production-grade, self-serve SaaS platform engineered for startups and scale-ups to audit, manage, and optimize their cumulative artificial intelligence spending. By integrating direct subscription configurations, API usage evaluations, and historical seat utilization, StackAudit isolates instances of subscription overlap, under-utilized capacity, and cost-inefficient model routing to deliver immediate actionable savings.

---

## 🚀 Key Features

* **AI Spend Audit Engine**: Evaluates active seat structures, subscription tiers, and API patterns to establish an organization-wide spend baseline.
* **Pricing Optimization Core**: Rules engine matching current configurations against optimal alternatives (e.g., transitioning off-plan seats to cheaper, high-performance API models or consolidated accounts).
* **Gemini/Claude Executive Summaries**: Context-aware NLP summaries outlining structural waste, immediate cost reductions, and strategic tooling consolidation plans.
* **Gate-Unlocked Public Reports**: Virality-focused reports generated dynamically, securely scrubbed of PII (Emails, Names, and Domain Identifiers) for public peer-to-peer sharing.
* **Lead Capture & Conversion Loop**: Dynamic lock-overlay system gated by business details (Work Email, Company Size, Stage) to capture high-intent enterprise leads before unlocking advanced charts.
* **Admin Dashboard & Analytics Hub**: Internal portal presenting system telemetry, customer acquisition costs (CAC), conversion metrics, and interactive charts displaying aggregated platform-wide savings.
* **Print-Engine Optimization**: Tailored CSS compilation leveraging `@media print` directives for professional, high-fidelity PDF reports.
* **Zero-Dependency Persistent Fallback**: A local file-backed JSON database abstraction layer (`reports-db.json`) that takes over automatically if MongoDB Atlas experiences network timeouts or connection drops.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **React 19 & Vite 8**: Fast HMR runtime deploying optimized production chunks.
- **Tailwind CSS 4**: Modern styling utility with dynamic glassmorphism and responsiveness.
- **Framer Motion**: Micro-animations and page transitions to elevate UI premium feel.
- **Recharts**: Responsive SVGs displaying tool category allocations and cost differentials.
- **React Router**: Single-page Client-Side Routing with Route Guarding for Admin access.

### Backend Infrastructure
- **Node.js & Express**: High-performance RESTful API architecture.
- **Mongoose / MongoDB Atlas**: Flexible document schemas mapping reports, leads, and pricing configurations.
- **Gemini API & OpenAI API Integration**: Secure server-side LLM wrappers utilizing Native Fetch to run prompt pipelines without front-end leakage.
- **Nodemailer**: Transactional email integration using secure SMTP with automatic Ethereal test inbox sandbox fallback for development.
- **Security & Middleware**: Rate-limiting, Helmet headers, Joi schema validation, and Express custom error handling.

---

## 📁 Repository Structure

```
StackAudit/
├── public/                 # Static assets (favicon, icons)
├── src/                    # Frontend React Application
│   ├── components/         # Reusable presentation and layout components
│   ├── services/           # Service layer and API abstractions
│   ├── App.jsx             # Root layout and client routes
│   └── index.css           # Global CSS and custom media print styles
├── server/                 # Backend Node.js Server
│   ├── src/
│   │   ├── config/         # Database and third-party API configurations
│   │   ├── controllers/    # Route handler controllers (Audit, Auth, Leads)
│   │   ├── middleware/     # Security and validation rules
│   │   ├── models/         # Mongoose schema definitions
│   │   ├── routes/         # REST API route files
│   │   └── utils/          # AI Prompt Pipelines, Audit Engines, Email templates
│   └── server.js           # Server application entry point
```

---

## ⚙️ Environment Configuration

Copy the template from `server/.env.example` to `server/.env` and configure your environment:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stackaudit
JWT_SECRET=your_jwt_secret_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_secure_password
CLIENT_URL=http://localhost:5173

# Primary AI Provider
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.5-flash

# Secondary AI Provider (Optional)
OPENAI_API_KEY=sk-proj-...

# SMTP Configuration (Optional: Leaves empty to auto-enable Ethereal Sandbox Mode)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
```

---

## 📦 Installation & Local Development

### 1. Install Dependencies
```bash
# Clone the repository
git clone https://github.com/om-gavali/StackAudit.git
cd StackAudit

# Install frontend packages
npm install

# Install backend packages
cd server
npm install
cd ..
```

### 2. Run the Application
You will need two terminal sessions:

**Terminal 1 (Backend):**
```bash
cd server
node server.js
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

The frontend will run on **`http://localhost:5173`** and proxy requests starting with `/api` directly to the backend at **`http://localhost:5000`**.

---

## 📡 API Overview

### Public API
- `POST /api/audit` - Receives user configuration, calculates optimization savings, generates the Gemini AI summary, and stores a new audit report.
- `GET /api/report/:id` - Retrieves an audit report. Automatically scrubs private information (PII) if the requester lacks active admin cookies/tokens.
- `POST /api/report/:id/lead` - Captures business details, locks them to the report, and sends confirmation emails.
- `POST /api/generate-summary` - Re-evaluates pricing structures and updates AI summary blocks.

### Admin Dashboard (JWT Guarded)
- `POST /api/admin/login` - Authenticates and issues JWT cookies.
- `GET /api/admin/stats` - Pulls business analytics (aggregations, conversion ratios, stage configurations).
- `GET /api/admin/reports` - Lists all audits.
- `GET /api/admin/leads` - Returns list of leads.
- `DELETE /api/admin/reports/:id` - Deletes specific audit report.

---

## 🚢 Deployment

### Frontend (Vercel)
Set the environment variable `VITE_API_URL` to point to your live backend (e.g., `https://api.stackaudit.com`). During build, Vite will compile this URL into your api client service.

### Backend (Render)
1. Set the root directory configuration to `server`.
2. Configure environment variables in Render including `MONGODB_URI`, `GEMINI_API_KEY`, and `CLIENT_URL`.
3. Add `0.0.0.0/0` to your MongoDB Atlas IP Access List so Render's cloud servers can write data.

---

## ⚖️ Technical Tradeoffs & Architectural Decisions

### 1. MongoDB Atlas with Local JSON Persistent Fallback
* **Context**: For local setups or serverless platforms where database access can sometimes drop, we wanted a resilient system.
* **Tradeoff**: Instead of crashing the server when MongoDB is unreachable, we created a file-backed local `reports-db.json` database. While local file systems can't scale horizontally in a multi-instance production environment, it ensures developers and small teams can run the application seamlessly in closed networks or during database maintenance.

### 2. Gemini 3.5 Flash as Primary AI Model
* **Context**: We transitioned from OpenAI to Google Gemini.
* **Tradeoff**: Gemini 3.5 Flash offers low latency and high context windows. While GPT-4o provides marginally higher accuracy on multi-step reasoning, Flash's free tier quotas and fast inference times represent a massive cost saving. We implemented a provider fallback mechanism in `aiService.js` to ensure the system drops back to OpenAI or static template rendering if Gemini hits rate limits.

---

## ⚡ Performance & Lighthouse Optimization
- **Asset Bundle Splitting**: Native Vite bundling splits large packages (e.g. Recharts, Framer Motion) into distinct asynchronous bundles to achieve a First Contentful Paint (FCP) of under 0.8s.
- **Dynamic Render Control**: Suspended loads on heavy admin tables and canvas charts to ensure instant page interactive speeds.
- **High-Contrast Print CSS**: `@media print` compiled dynamically, optimizing dark theme elements into paper-friendly grids, ensuring pages cut off cleanly without orphaned table items.

---

## 🗺️ Roadmap & Future Improvements
1. **SSO Integration**: SAML/OAuth integration for large enterprise team logins.
2. **Real-time API Billing Sync**: Direct integrations via API Keys with OpenAI, Anthropic, and LangSmith to automatically pull real-time usage data.
3. **Automated Multi-Currency Conversion**: Dynamic conversions leveraging ECB exchange rate endpoints.
