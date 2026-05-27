/**
 * AI Spend Audit - Audit Engine Logic
 */

const runAudit = (tools, companyDetails) => {
  let totalCurrentMonthlySpend = 0;
  let recommendations = [];
  let optimizedStack = [];

  const teamSize = Number(companyDetails.teamSize) || 1;
  const hasCoding = companyDetails.primaryUseCase === 'coding' || companyDetails.primaryUseCase === 'mixed';

  let hasCopilot = false;
  let hasChatGPT = false;
  let hasClaude = false;
  let hasCursor = false;
  let hasWindsurf = false;

  tools.forEach(t => {
    const cost = Number(t.spend) || 0;
    const seats = Number(t.seats) || 1;
    totalCurrentMonthlySpend += cost * seats;

    if (t.name === 'GitHub Copilot') hasCopilot = true;
    if (t.name === 'ChatGPT') hasChatGPT = true;
    if (t.name === 'Claude') hasClaude = true;
    if (t.name === 'Cursor') hasCursor = true;
    if (t.name === 'Windsurf') hasWindsurf = true;
  });

  let consolidatedIDE = false;

  // Rule 1: Consolidate IDE and Chat
  if ((hasCopilot || hasCursor || hasWindsurf) && (hasChatGPT || hasClaude) && hasCoding) {
    const chatSpend = tools
      .filter(t => ['ChatGPT', 'Claude'].includes(t.name))
      .reduce((a, b) => a + (Number(b.spend) * Number(b.seats)), 0);
    const ideSpend = tools
      .filter(t => ['GitHub Copilot', 'Cursor', 'Windsurf'].includes(t.name))
      .reduce((a, b) => a + (Number(b.spend) * Number(b.seats)), 0);

    const suggestedTool = "Cursor Pro / Windsurf Pro";
    const optimizedCost = 20 * teamSize;

    if (chatSpend + ideSpend > optimizedCost) {
      recommendations.push({
        title: "Consolidate to a Unified AI IDE",
        description: `You are paying separately for code autocomplete ($${ideSpend}/mo) and premium chat models ($${chatSpend}/mo). Consolidating into Cursor Pro or Windsurf Pro ($20/user) gives your engineering team both in-editor chat (powered by Claude 3.5 Sonnet / GPT-4o) and inline code completion.`,
        savings: (chatSpend + ideSpend) - optimizedCost,
        type: "consolidation"
      });
      optimizedStack.push({ name: suggestedTool, cost: 20, seats: teamSize });
      consolidatedIDE = true;
    }
  }

  // Rule 2 & 3 & 4: Tool-specific audits
  tools.forEach(t => {
    // Skip if consolidated into unified IDE
    if (consolidatedIDE && ['GitHub Copilot', 'ChatGPT', 'Claude', 'Cursor', 'Windsurf'].includes(t.name)) {
      return;
    }

    const tSpend = Number(t.spend);
    const tSeats = Number(t.seats) || 1;

    // Rule 2: Small team using Team plan instead of Pro/Individual
    if (t.plan && t.plan.toLowerCase().includes('team') && teamSize <= 2) {
      const individualCost = 20; // Standard individual price
      if (tSpend > individualCost) {
        const potentialSavings = (tSpend - individualCost) * tSeats;
        recommendations.push({
          title: `Downgrade ${t.name} to Pro/Individual`,
          description: `You have a team size of ${teamSize} but are paying for a Team/Enterprise plan for ${t.name}. Downgrading to the Individual/Pro plan offers identical core model access for less.`,
          savings: potentialSavings,
          type: "plan_optimization"
        });
        optimizedStack.push({ name: `${t.name} (Pro)`, cost: individualCost, seats: tSeats });
        return;
      }
    }

    // Rule 3: API Pricing optimization (Recommend gateway / discounted credits)
    if (t.name.includes('API')) {
      const potentialSavings = Math.round((tSpend * tSeats) * 0.4); // 40% savings target
      recommendations.push({
        title: `Optimize ${t.name} with LLM Gateway & Discounted Credits`,
        description: `You are currently paying retail rates for ${t.name}. By routing lightweight developer tasks to cheaper models (e.g. GPT-4o-mini / Gemini Flash) via an LLM Gateway, and purchasing discounted prepaid credits, you can reduce inference bills by ~40%.`,
        savings: potentialSavings,
        type: "api_optimization"
      });
      optimizedStack.push({ name: `${t.name} (Optimized)`, cost: Math.round(tSpend * 0.6), seats: tSeats });
      return;
    }

    // Rule 4: Gemini / other tool alternatives
    if (t.name === 'Gemini' && tSpend > 15) {
      // Suggest utilizing cheaper models or developer accounts
      recommendations.push({
        title: `Downgrade Gemini Plan or Switch to API`,
        description: `For lightweight or secondary search tasks, use the Gemini API (which includes a generous free tier for Google AI Studio) instead of paying flat monthly seats.`,
        savings: (tSpend - 5) * tSeats,
        type: "plan_optimization"
      });
      optimizedStack.push({ name: `${t.name} (API Free/Pay-as-you-go)`, cost: 5, seats: tSeats });
      return;
    }

    // Default: No optimization found
    optimizedStack.push({ name: t.name, cost: tSpend, seats: tSeats });
  });

  const totalOptimizedMonthlySpend = optimizedStack.reduce((a, b) => a + (b.cost * (b.seats || 1)), 0);
  let monthlySavings = totalCurrentMonthlySpend - totalOptimizedMonthlySpend;
  
  if (monthlySavings < 0) {
    monthlySavings = 0;
  }
  
  const yearlySavings = monthlySavings * 12;

  return {
    totalCurrentMonthlySpend,
    totalOptimizedMonthlySpend: Math.min(totalOptimizedMonthlySpend, totalCurrentMonthlySpend),
    monthlySavings,
    yearlySavings,
    recommendations,
    optimizedStack
  };
};

module.exports = { runAudit };
