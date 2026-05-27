# StackAudit Product Metrics & Analytics Strategy 📊

This document outlines the KPIs, instrumentation layout, tracking scripts, and business thresholds that guide StackAudit's development decisions.

---

## 🌟 The North Star Metric

Our North Star metric is **Total Cumulative Identified Savings (TCIS)**.
* **Definition**: The total dollar amount of annual savings calculated by our deterministic engine across all completed audits.
* **Why**: It is the direct representation of the value our product delivers. If TCIS is growing, it means users are finding waste, sharing reports, and engaging with the platform.

---

## 📊 Analytics Framework

We break our operational metrics down into three distinct tracking tiers:

### 1. Acquisition & Input Metrics
* **Monthly Active Visitors (MAV)**: Total unique sessions landing on the audit homepage.
* **Form Completion Rate**: The percentage of visitors who complete the multi-step audit form (Target: > 15%).
* **Average Tool Count**: The average number of AI tools added per audit run. If this is < 2, it indicates users are not entering their full stack.

### 2. Activation & Conversion Metrics
* **Lead Unlock Rate**: The percentage of completed audits that submit their business details to unlock the dashboard (Target: > 25%).
* **Report Share Rate**: The percentage of unlocked dashboards where the user clicks the "Share Audit" button to generate a public link.
* **PDF Download Rate**: The percentage of unlocked dashboards where the user prints/saves the PDF report.

### 3. Retention & Pro Monetization Metrics
* **Return Visitor Rate (RVR)**: The percentage of users who return to update their audit stack within 60 days.
* **Pro Upgrade Rate**: The percentage of lead captures that upgrade to the paid API Monitoring tier (Target: > 5%).
* **Churn Rate**: The percentage of Pro subscribers who cancel their subscription month-over-month (Target: < 4%).

---

## 🛠️ Analytics Instrumentation

We use a simple, privacy-friendly event tracking schema (e.g. using Plausible or Mixpanel) to measure funnel steps without collecting PII:

```javascript
// Track initial landing page visit
analytics.track('Viewed Landing Page');

// Track step transitions in MultiStepForm.jsx
analytics.track('Completed Audit Step', {
  step: 1,
  teamSize: formData.companyDetails.teamSize
});

// Track successful audit creation
analytics.track('Generated Audit Report', {
  totalTools: report.originalTools.length,
  calculatedSavings: report.monthlySavings
});

// Track lead unlock form submit
analytics.track('Lead Form Submitted', {
  companyStage: lead.companyStage,
  role: lead.role
});

// Track print/PDF exports
analytics.track('Exported Report PDF');
```

---

## ⚖️ Pivot Thresholds & Decision Guardrails

To prevent spending time on features that do not move our metrics, we establish clear thresholds:

| Metric Observed | Current Value | Target Value | Action if Target is Not Met |
|---|---|---|---|
| **Visitor-to-Audit Rate** | 8% | 15% | **Simplification**: Reduce onboarding form fields. Remove initial company details questions and move them to the end of the flow. |
| **Audit-to-Lead Rate** | 12% | 25% | **Value Buffering**: Show a blurred preview of the charts in the background behind the lead modal to increase unlock intent. |
| **Paid Upgrade Rate** | 0.8% | 5% | **Value Proposition Pivot**: If users run audits once but do not upgrade to automated API tracking, pivot to offering a one-off "Expert Human Audit" consultation for $99. |
