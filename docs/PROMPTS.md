# Prompt Engineering & AI Core Documentation 🧠

This document details the prompt engineering patterns, template configuration files, and mitigation systems designed to produce structural audit summaries.

---

## 🧭 Why AI is Only Used for Summaries

During initial prototyping, we experimented with sending the user's raw configuration (e.g. tools, plan names, seat count, and budget allocations) directly to an LLM to let it calculate costs and recommendations.

### The Failures
1. **Mathematical Inconsistencies**: The LLM frequently miscalculated percentages, rounded numbers arbitrarily (e.g., changing $480/yr savings to $500/yr), or failed to multiply seat costs correctly.
2. **Context Drifts**: If the user input was complex, the LLM occasionally forgot to process specific tools, dropping them from the recommendation list.

### The Decoupled Pattern
We resolved this by separating **Calculations** from **Analysis**:
1. **Deterministic Rules Engine (`auditEngine.js`)**: Calculates every single financial number (current spend, optimized spend, savings differentials) using absolute javascript rules.
2. **Generative Summarization (`aiService.js`)**: The calculated JSON payload is passed as structured context to the LLM. The LLM's only job is to write a readable executive summary explaining *why* the rules engine made those decisions.

---

## 📝 The Production System Prompt

Below is the active production prompt template used inside `server/src/utils/aiService.js`:

```
You are a highly experienced SaaS procurement officer, financial auditor, and developer tool specialist.
Analyze the following tool spend audit results for a startup and write a concise, professional executive summary.

---
AUDIT DATA:
- Team Size: {teamSize}
- Current Monthly Spend: ${currentSpend}
- Optimized Monthly Spend: ${optimizedSpend}
- Projected Monthly Savings: ${monthlySavings}
- Projected Yearly Savings: ${yearlySavings}

RECOMMENDATIONS MADE BY RULES ENGINE:
{recommendationDetails}
---

Your response MUST follow these strict guidelines:
1. Focus on the most impactful savings recommendations first.
2. Be direct, authoritative, and professional. Avoid marketing fluff or introductory pleasantries. Start immediately with the analysis.
3. Reference the specific tool names and savings.
4. Keep the summary under 3-4 concise paragraphs.
5. Use markdown formatting (bolding, bullet points) for readability.
6. Do NOT invent any numbers. Only use the numbers provided in the audit data above.
```

---

## 🚫 Hallucination Prevention Methods

To ensure the AI never invents pricing plans or savings totals, we implemented three defense layers:

### 1. Temperature Constraint
In `aiService.js`, the request payload sets:
- `temperature: 0.1` (or equivalent low variance)
This forces the model to be highly deterministic and follow system rules strictly rather than generating creative alternative metrics.

### 2. Context Isolation
The LLM is completely isolated from the pricing reference database. By only providing it with the *calculated output* of the rules engine, we prevent the model from searching its own parameters for outdated or incorrect plan pricing.

### 3. Structural Validation Fallback
If the LLM fails to return a response or returns empty blocks, the backend catches the error and falls back to a clean string template:
```javascript
const generateStaticFallback = (data) => {
  return `Based on your audit, StackAudit identified a potential saving of $${data.monthlySavings}/mo ($${data.yearlySavings}/yr). The primary savings come from consolidating your development tools and removing unused seat licenses.`;
};
```
This guarantees that even if external APIs are completely offline, the client dashboard still displays a valid audit report.

---

## ❌ Failed Prompts (Iterative History)

### Failed Iteration 1: "Analyze this raw stack"
```
Here is my team size: 5. We use Cursor Business (2 seats) and ChatGPT Plus (5 seats). How can we save money?
```
* **Failure Case**: The model suggested migrating to Claude Pro but quoted the price of Claude Pro as $15/user/mo (it is $20) and hallucinated that Cursor Business offers a free tier for 5 users.

### Failed Iteration 2: "Calculate and summarize"
```
Analyze this stack and calculate the current spend and optimized spend. Write a summary.
Tools: Cursor Business (2 seats, $80), ChatGPT Plus (5 seats, $100).
```
* **Failure Case**: The model returned: *"Your current monthly spend is $180. By switching to Cursor Pro, you save $40. Your new spend is $130."* (Simple math error: 180 - 40 is 140, not 130).
