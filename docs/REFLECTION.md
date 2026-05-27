# StackAudit Project Reflection 🧠

This document outlines key technical challenges, reversed decisions, and product strategies identified during the development of StackAudit.

---

## 1. The Hardest Bug & Debugging Process

### The Bug
During Day 3, we noticed that when users exported reports to PDF via the browser's print dialog, the Recharts SVG charts rendered completely blank, and recommendation cards were cut in half across page breaks.

### The Debugging Process
1. **Inspected CSS rules**: Inspected the DOM inside print emulation mode using Chrome DevTools (`rendering -> emulate CSS media type: print`). Discovered that Recharts calculates its SVG sizes dynamically based on the width of its parent container.
2. **Identified the cause**: Because the flexbox grid container started with `width: 100%`, during print generation the browser's layout engine collapses container sizes to process page columns, resulting in Recharts rendering charts at a width of 0.
3. **The Fix**: Added `@media print` directives in `src/index.css`. 
   - Enforced fixed pixel widths and heights (e.g. `width: 600px !important`, `height: 300px !important`) specifically for chart wrappers during print media events.
   - Used `break-inside: avoid` on all recommendation and KPI cards to prevent the browser from splitting cards across pages.
   - Enforced high-contrast text color overrides (black on white) to bypass dark-theme backgrounds that make printed ink unreadable.

---

## 2. Decision Reversed Mid-Week

### Relying solely on MongoDB Atlas vs. Building a Local File Fallback
* **Initial Decision**: Build a clean MongoDB database model and assume the connection is 100% stable. If the connection fails, return a standard database connection error to the user.
* **Why it was Reversed**: During local testing and environment shifts, Atlas would frequently reject connections due to IP whitelisting limits. Returning a database error to a user who just ran an audit is a critical point of failure in their customer journey.
* **The New Path**: We replaced the in-memory fallback store with a custom `FileBackedStore` class inside `auditController.js`. It mimics a Javascript `Map` but writes changes synchronously to `reports-db.json`. If MongoDB drops, StackAudit saves and loads reports from local storage. The user experience is unaffected, and data persists across restarts.

---

## 3. What We Would Build in Week 2

1. **Active Billing Integration API**:
   Build direct integrations with OpenAI and Anthropic accounts. Users input their API keys, and we pull real-time billing metrics automatically rather than relying on manual copy-pasting.
2. **Multi-Currency Pricing Converter**:
   Integrate with open exchange rate APIs to support automatic conversion of non-USD software licenses.
3. **Interactive Optimization Sandbox**:
   Allow users to toggle recommendations (e.g., "What if we don't migrate Cursor?") and watch the charts and savings totals update dynamically in real time.

---

## 4. How AI Tools Were Used

We deliberately restricted LLM usage to **generating executive summaries**. All financial metrics, recommendations, and pricing calculations are evaluated using a **deterministic rules engine** (`auditEngine.js`).

### Why?
1. **Zero Hallucination Tolerance**: Financial calculations must be 100% mathematically correct. LLMs cannot guarantee consistent mathematical results on complex multi-step rules.
2. **Predictable Latency**: Deterministic rules run in under 2ms. Relying on LLMs for calculations introduces latency and API overhead.
3. **Context Optimization**: By calculating metrics deterministically first, we pass structured results (current spend, optimized spend, specific saving recommendations) to Gemini, allowing the model to focus purely on formatting and editorial analysis.

---

## 5. Developer Self-Rating

| Dimension | Rating | Rationale |
|---|---|---|
| **Discipline** | 9/10 | Maintained structured dev logs, committed clean diffs, and systematically checked off requirements on schedule. |
| **Code Quality** | 8.5/10 | Centralized all API calls under services, isolated business logic from routes, and pre-seeded database structures. |
| **Design Sense** | 8/10 | Applied a modern dark glassmorphism theme, but Recharts tooltips require additional styling to match premium looks. |
| **Problem Solving**| 9/10 | Designed a seamless local JSON database fallback when Atlas IP blocking threatened to block testing. |
| **Entrepreneurial Thinking** | 9.5/10 | Gated reports behind high-value lead capture forms to maximize conversions. |
