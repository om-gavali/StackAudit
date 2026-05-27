# User Research & Founder Interviews 👥

This log documents user interviews conducted with early-stage CTOs, founders, and finance leaders that shaped StackAudit's features.

---

## Interview 1: Fractional CTO & Procurement Advisor
* **Subject**: A.K.
* **Role**: Fractional CTO for 4 Portfolio Startups (Pre-seed to Seed)
* **Company Stage**: Seed

### Direct Quotes
1. *"I don't have time to log into 15 different customer dashboards just to see if a dev is leaving a GPU cluster running on a personal account."*
2. *"My biggest headache isn't the $20/month Cursor subscription; it's the engineer who writes an unoptimized fetch query that loops a GPT-4o API call 50,000 times overnight."*
3. *"Startups want to cut costs, but they won't do it if it means switching back to outdated IDEs. It has to be friction-free."*

### Key Pain Points
- Lack of centralized billing across disparate developer tools.
- Sudden API cost spikes due to buggy scripts running in loops.
- Over-allocation of premium developer seats (e.g., buying Cursor Business for a designer who only needs a basic editor).

### Surprising Insight
Fractional CTOs act as secondary distribution channels. If we build features allowing them to manage multiple client audit dashboards from one admin account, they will onboard all of their portfolio startups to StackAudit.

### Product Changes Inspired by this Interview
* **Action**: We added a dedicated "Admin Portal" that aggregates generated audits. This allows CTOs to review and delete client reports easily from a central location.

---

## Interview 2: Seed-Stage Startup Founder
* **Subject**: S.M.
* **Role**: CEO & Co-founder
* **Company Stage**: Late Seed (18 employees)

### Direct Quotes
1. *"Every single developer expense sheet that crosses my desk has a personal Claude Pro or ChatGPT Plus line item. Half the time, the company is already paying for GitHub Copilot."*
2. *"We signed up for a ChatGPT Team tier to satisfy corporate data requirements, but only 4 out of our 12 employees actually use it. We're wasting hundreds of dollars every single month."*
3. *"I need a report that I can export and paste directly into our board meeting slides to show we are actively managing our operating burn rate."*

### Key Pain Points
- Shadow AI spend on personal employee credit cards.
- Redundant subscriptions across teams (e.g., product teams using ChatGPT while developers use Claude).
- Difficulty preparing cost-audit slides for monthly board meetings.

### Surprising Insight
Founders want to brag to their board and investors that they are operating with extreme cost efficiency. 

### Product Changes Inspired by this Interview
* **Action**: We optimized the `@media print` layout so the printable PDF report formats perfectly on A4 pages. This allows founders to save the audit directly as a clean PDF and drop it straight into their board decks.

---

## Interview 3: Solo Bootstrapper & Indie Hacker
* **Subject**: T.V.
* **Role**: Solo Founder
* **Company Stage**: Pre-revenue / Bootstrapped

### Direct Quotes
1. *"As a solo developer, every $20 subscription counts. I'm constantly shuffling between Claude Pro and ChatGPT Plus based on which model is currently better."*
2. *"I love the idea of audits, but I won't sign up for another SaaS tool just to see if I'm overspending. I want to try it first, zero friction."*
3. *"API key management is scary. I'd never paste my live OpenAI API keys into a new web app just to check how much I spent last month."*

### Key Pain Points
- High sensitivity to recurring SaaS subscription costs.
- Skeptical of security risks when pasting active API keys into third-party tools.
- High onboarding drop-off if sign-up is required immediately.

### Surprising Insight
Solo developers are highly suspicious of pasting active API tokens. They prefer manual input sliders over automatic integrations during their initial usage.

### Product Changes Inspired by this Interview
* **Action**: We structured the onboarding form to be **completely anonymous**. Users manually select plans and seat counts via drag-and-drop tools. We do not require account creation or live API keys to run the initial audit engine.
