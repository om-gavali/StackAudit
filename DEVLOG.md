# StackAudit Development Log 📝

A detailed, day-by-day engineering log compiling the construction, testing, and deployment processes of the StackAudit platform.

---

## Day 1 — 2026-05-20
* **Hours worked**: 9.5 hours
* **What I built**:
  - Initialized the Git repository and defined backend folder structures.
  - Setup Express gateway framework, environment configurations, and custom error middleware.
  - Created basic Mongoose models for `Report` and `Lead`.
  - Implemented the core deterministic calculation logic in `server/src/utils/auditEngine.js` matching active tooling bills against pricing alternatives.
* **Problems faced**:
  - Mongoose connection dropped intermittently when starting the Express server inside local WSL environments.
  - Figured out that my local IP wasn't whitelisted on MongoDB Atlas. Added temporary access to allow development.
* **What I learned**:
  - A deterministic calculations rules engine is far more efficient to run synchronously on client payloads before executing heavy AI calls.
* **Blockers**: None.
* **Plan for tomorrow**: Build the multi-step React onboarding form.

---

## Day 2 — 2026-05-21
* **Hours worked**: 8 hours
* **What I built**:
  - Initialized React 19 application via Vite.
  - Configured Tailwind CSS 4 setup and global glassmorphism stylesheet utilities.
  - Built the `MultiStepForm.jsx` audit onboarding flow (Step 1: team size & details; Step 2: interactive tool stack builder).
* **Problems faced**:
  - Framer Motion exit animations caused layout shifts when toggling steps in the multi-step wizard.
  - Resolved this by wrapping steps in `<AnimatePresence mode="wait">` to coordinate entry/exit timelines.
* **What I learned**:
  - React 19's native handling of form actions simplifies input loading cycles, but custom states are still cleaner when coordinating multi-step arrays.
* **Blockers**: Recharts library threw SSR/canvas errors when loading inside flexible grid containers.
* **Plan for tomorrow**: Build the Report Dashboard and integrate the chart layers.

---

## Day 3 — 2026-05-22
* **Hours worked**: 10 hours
* **What I built**:
  - Created `Dashboard.jsx` presenting aggregate monthly/yearly savings and recommendation cards.
  - Integrated Recharts displaying category-wise costs and savings breakdown.
  - Coded client-side PDF generation trigger which prompts the system print preview.
* **Problems faced**:
  - SVG charts from Recharts rendered completely blank in PDF prints.
  - Discovered that print layouts need specific viewport constraints. Added high-contrast `@media print` directives in `index.css` to fix chart sizing during print runs.
* **What I learned**:
  - SVG styling attributes require explicit CSS overrides to print correctly on paper print engines.
* **Blockers**: None.
* **Plan for tomorrow**: Integrate Gemini/OpenAI API backend endpoints.

---

## Day 4 — 2026-05-23
* **Hours worked**: 8.5 hours
* **What I built**:
  - Coded `server/src/utils/aiService.js` connecting backend to Gemini API.
  - Implemented provider-fallback strategy: Gemini 3.5 Flash (primary) → OpenAI (secondary) → Template summaries.
  - Created prompt layouts designed to enforce markdown styling outputs.
* **Problems faced**:
  - Gemini returned truncated summaries with empty sections when using `generationConfig` token limit parameters.
  - Fixed it by removing the custom limit config to let Gemini use its default allocation.
* **What I learned**:
  - Strict token ceilings can disrupt models with internal reasoning chains before they finish generating the final output.
* **Blockers**: None.
* **Plan for tomorrow**: Code the lead capture gating mechanism.

---

## Day 5 — 2026-05-24
* **Hours worked**: 9 hours
* **What I built**:
  - Built the lead capture system modal overlay to gate report dashboards.
  - Created endpoints `/api/report/:id/lead` to link emails/details to specific audits.
  - Integrated Nodemailer sending confirmation emails with active link pathways.
* **Problems faced**:
  - Submitting lead captures triggered CORS errors because our local Vite server (port 5173) was trying to POST to our Express server (port 5000) directly.
  - Setup Vite proxies in `vite.config.js` to route local `/api` queries.
* **What I learned**:
  - Ethereal Email is fantastic for developer sandboxing because it gives a click-to-view preview link instead of needing real SMTP setups.
* **Blockers**: None.
* **Plan for tomorrow**: Build JWT auth and create the Admin Portal.

---

## Day 6 — 2026-05-25
* **Hours worked**: 11 hours
* **What I built**:
  - Built the `AdminLogin.jsx` and `AdminDashboard.jsx` interfaces.
  - Implemented backend JWT issuing with `bcryptjs` password hashing (cost factor 12).
  - Setup secure endpoints for metrics aggregations and report management.
* **Problems faced**:
  - Admin analytics aggregation queries crashed the server when Mongoose collections were empty on startup.
  - Added schema seeding hooks in `app.js` to populate default pricing data and admin credentials if the database is blank.
* **What I learned**:
  - Pre-seeding database schemas is essential to guarantee clean startup states on CI/CD nodes.
* **Blockers**: MongoDB connection errors due to IP whitelist restrictions when trying to connect from a different network location.
* **Plan for tomorrow**: Write tests and prepare deployment pipelines.

---

## Day 7 — 2026-05-26
* **Hours worked**: 10.5 hours
* **What I built**:
  - Wrote Jest unit tests for the audit calculator rules engine.
  - Built the `FileBackedStore` local database fallback to persist records if MongoDB Atlas connections fail.
  - Created a robust `.gitignore` file and pushed the project to GitHub.
  - Deployed the frontend to Vercel and the backend to Render.
* **Problems faced**:
  - Render deployment failed initially with `Missing script: "build"`.
  - Added a dummy `"build": "echo 'No build step required'"` to `server/package.json` to fix it.
  - Vercel frontend threw "Failed to Fetch" because of hardcoded backend calls.
  - Refactored `api.js` to use `VITE_API_URL` environment variable support.
* **What I learned**:
  - Front-end build systems must remain base-URL agnostic during compile stages to support separate cloud environments.
* **Blockers**: None.
* **Plan for tomorrow**: Verify production operation and hand over to user.
