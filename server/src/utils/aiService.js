const { OpenAI } = require('openai');

const generateAuditSummary = async (tools, companyDetails, currentSpend, optimizedSpend, savings, optimizedTools) => {
  const teamSize = companyDetails.teamSize || 1;
  const primaryUseCase = companyDetails.primaryUseCase || 'mixed';
  const yearlySavings = savings * 12;

  const systemInstruction = "You are a professional SaaS finance consultant and AI tools optimizer. Write a concise, personalized 100-word executive summary of the user's AI spend audit. Focus on overspending areas, consolidation options, and the total ROI. Address the user directly, be authoritative yet encouraging, and do not exceed 100 words.";

  const promptContext = `
    Team Size: ${teamSize}
    Primary Use Case: ${primaryUseCase}
    Current Spend: $${currentSpend}/month
    Optimized Spend: $${optimizedSpend}/month
    Monthly Savings: $${savings}/month
    Yearly Savings: $${yearlySavings}/year
    Current Tools: ${tools.map(t => `${t.name} (${t.plan || 'Pro'}, ${t.seats || 1} seats)`).join(', ')}
    Optimized Stack: ${optimizedTools.map(t => `${t.name} (${t.seats || 1} seats)`).join(', ')}
  `;
  const userPrompt = `Analyze this AI tool spend data and write the summary:\n${promptContext}`;


  if (process.env.GEMINI_API_KEY) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Data to Analyze:\n${userPrompt}` }]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text.trim();
        }
      } else {
        const errText = await response.text();
        console.warn(`Gemini API call failed with status ${response.status}:`, errText);
      }
    } catch (error) {
      console.warn("Gemini API call encountered an error, falling back:", error.message);
    }
  }


  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.warn("OpenAI API call failed, trying next provider. Error:", error.message);
    }
  }

  // Fallback to Template-based Summary
  const toolList = tools.map(t => t.name).join(', ');
  const optimizedList = optimizedTools.map(t => t.name).join(', ');

  return `Based on our audit, your team of ${teamSize} is currently overspending on AI tools. By auditing your stack (including ${toolList}), we found redundant subscriptions and sub-optimal API pricing. Switching to our optimized plan—which focuses on ${optimizedList}—reduces monthly costs from $${currentSpend} to $${optimizedSpend}. This unlocks an instant savings of $${savings} per month ($${yearlySavings} annually) without sacrificing team productivity. Consolidate your IDEs and move developer API calls to gateways for immediate impact.`;
};

module.exports = { generateAuditSummary };
