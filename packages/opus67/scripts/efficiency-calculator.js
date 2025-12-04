#!/usr/bin/env node
/**
 * OPUS 67 Efficiency Calculator
 * Calculate savings across different AI coding tools
 */

const TOOLS = {
  // Subscriptions
  'claude-pro': { name: 'Claude Pro', cost: 20, type: 'subscription', multiplier: 2.5 },
  'claude-max': { name: 'Claude Max', cost: 100, type: 'subscription', multiplier: 2.5 },
  'cursor': { name: 'Cursor Pro', cost: 20, type: 'subscription', multiplier: 2.5 },
  'windsurf': { name: 'Windsurf Pro', cost: 15, type: 'subscription', multiplier: 2.5 },
  'copilot': { name: 'GitHub Copilot', cost: 10, type: 'subscription', multiplier: 2.0 },
  'copilot-biz': { name: 'GitHub Copilot Business', cost: 19, type: 'subscription', multiplier: 2.0 },
  'lovable': { name: 'Lovable Starter', cost: 25, type: 'subscription', multiplier: 2.4 },
  'bolt': { name: 'Bolt Basic', cost: 20, type: 'subscription', multiplier: 2.25 },
  'base44': { name: 'Base44 Builder', cost: 40, type: 'subscription', multiplier: 2.25 },
  'replit': { name: 'Replit Core', cost: 20, type: 'subscription', multiplier: 2.25 },
  'tabnine': { name: 'Tabnine Dev', cost: 9, type: 'subscription', multiplier: 2.0 },
  'codeium': { name: 'Codeium Pro', cost: 15, type: 'subscription', multiplier: 2.0 },
  'q-developer': { name: 'Amazon Q Developer', cost: 19, type: 'subscription', multiplier: 2.0 },

  // API (per $100 spend)
  'claude-api': { name: 'Claude API', cost: 100, type: 'api', savingsRate: 0.56 },
  'openai-api': { name: 'OpenAI API', cost: 100, type: 'api', savingsRate: 0.56 },
  'gemini-api': { name: 'Gemini API', cost: 100, type: 'api', savingsRate: 0.56 },
  'deepseek-api': { name: 'DeepSeek API', cost: 100, type: 'api', savingsRate: 0.56 },
};

const LLM_MODELS = {
  'claude-opus-4.5': { name: 'Claude Opus 4.5', input: 15, output: 75, swebench: 80.9 },
  'claude-sonnet-4.5': { name: 'Claude Sonnet 4.5', input: 3, output: 15, swebench: 77.2 },
  'claude-sonnet-4': { name: 'Claude Sonnet 4', input: 3, output: 15, swebench: 72.7 },
  'claude-haiku-4': { name: 'Claude Haiku 4', input: 0.8, output: 4, swebench: 55 },
  'gpt-5.1': { name: 'GPT-5.1', input: 15, output: 60, swebench: 77.9 },
  'gpt-4o': { name: 'GPT-4o', input: 2.5, output: 10, swebench: 72 },
  'gpt-4o-mini': { name: 'GPT-4o-mini', input: 0.15, output: 0.6, swebench: 45 },
  'o1-preview': { name: 'o1-preview', input: 15, output: 60, swebench: 78 },
  'gemini-3-pro': { name: 'Gemini 3 Pro', input: 3.5, output: 14, swebench: 76.2 },
  'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', input: 0.075, output: 0.3, swebench: 65 },
  'deepseek-v3': { name: 'DeepSeek V3', input: 0.27, output: 1.1, swebench: 71 },
};

function calculateSubscriptionValue(toolKey, monthlySpend = null) {
  const tool = TOOLS[toolKey];
  if (!tool || tool.type !== 'subscription') return null;

  const cost = monthlySpend || tool.cost;
  const effectiveValue = cost * tool.multiplier;
  const annualGain = (effectiveValue - cost) * 12;

  return {
    tool: tool.name,
    monthlyCost: cost,
    effectiveValue: effectiveValue.toFixed(2),
    multiplier: tool.multiplier,
    annualValueGain: annualGain.toFixed(2),
  };
}

function calculateAPISavings(monthlySpend, model = 'claude-sonnet-4.5') {
  const savingsRate = 0.56; // 56% token reduction
  const modelInfo = LLM_MODELS[model] || LLM_MODELS['claude-sonnet-4.5'];

  const withoutOpus = monthlySpend;
  const withOpus = monthlySpend * (1 - savingsRate);
  const monthlySavings = withoutOpus - withOpus;
  const annualSavings = monthlySavings * 12;

  // Calculate tasks per dollar
  const avgInputTokens = 500;
  const avgOutputTokens = 200;
  const costPerTask = (avgInputTokens / 1000000 * modelInfo.input) + (avgOutputTokens / 1000000 * modelInfo.output);
  const tasksWithout = Math.floor(monthlySpend / costPerTask);
  const tasksWithOpus = Math.floor(monthlySpend / (costPerTask * (1 - savingsRate)));

  return {
    model: modelInfo.name,
    monthlySpend: withoutOpus.toFixed(2),
    withOpus67: withOpus.toFixed(2),
    monthlySavings: monthlySavings.toFixed(2),
    annualSavings: annualSavings.toFixed(2),
    savingsPercent: (savingsRate * 100).toFixed(0) + '%',
    tasksWithoutOpus: tasksWithout,
    tasksWithOpus: tasksWithOpus,
    taskIncrease: ((tasksWithOpus - tasksWithout) / tasksWithout * 100).toFixed(0) + '%',
  };
}

function calculateTeamSavings(teamSize, toolKey, monthlyPerUser = null) {
  const tool = TOOLS[toolKey];
  if (!tool) return null;

  const perUserCost = monthlyPerUser || tool.cost;
  const totalMonthlyCost = perUserCost * teamSize;

  if (tool.type === 'subscription') {
    const effectiveValue = totalMonthlyCost * tool.multiplier;
    const annualValueGain = (effectiveValue - totalMonthlyCost) * 12;

    return {
      tool: tool.name,
      teamSize,
      monthlyTeamCost: totalMonthlyCost.toFixed(2),
      effectiveValue: effectiveValue.toFixed(2),
      multiplier: tool.multiplier,
      annualValueGain: annualValueGain.toFixed(2),
    };
  } else {
    const savings = calculateAPISavings(totalMonthlyCost);
    return {
      tool: tool.name,
      teamSize,
      monthlyTeamCost: totalMonthlyCost.toFixed(2),
      ...savings,
    };
  }
}

function printAllToolsComparison() {
  console.log('');
  console.log('================================================================================');
  console.log('              OPUS 67 EFFICIENCY CALCULATOR - ALL TOOLS');
  console.log('================================================================================');
  console.log('');

  console.log('SUBSCRIPTIONS (Value Multiplier)');
  console.log('--------------------------------------------------------------------------------');
  console.log('TOOL                    | COST    | EFFECTIVE | MULTIPLIER | ANNUAL GAIN');
  console.log('--------------------------------------------------------------------------------');

  Object.keys(TOOLS).forEach(key => {
    const tool = TOOLS[key];
    if (tool.type === 'subscription') {
      const result = calculateSubscriptionValue(key);
      console.log(
        result.tool.padEnd(23) + ' | ' +
        ('$' + result.monthlyCost).padEnd(7) + ' | ' +
        ('$' + result.effectiveValue).padEnd(9) + ' | ' +
        (result.multiplier + 'x').padEnd(10) + ' | ' +
        '+$' + result.annualValueGain
      );
    }
  });

  console.log('');
  console.log('API MODELS (Cost Savings)');
  console.log('--------------------------------------------------------------------------------');
  console.log('MODEL                   | INPUT $/M | OUTPUT $/M | SWE-bench | SAVINGS');
  console.log('--------------------------------------------------------------------------------');

  Object.keys(LLM_MODELS).forEach(key => {
    const model = LLM_MODELS[key];
    const savings = calculateAPISavings(100, key);
    console.log(
      model.name.padEnd(23) + ' | ' +
      ('$' + model.input.toFixed(2)).padEnd(9) + ' | ' +
      ('$' + model.output.toFixed(2)).padEnd(10) + ' | ' +
      (model.swebench + '%').padEnd(9) + ' | ' +
      savings.savingsPercent
    );
  });

  console.log('');
}

function printScenarios() {
  console.log('');
  console.log('================================================================================');
  console.log('                    COMMON SCENARIOS');
  console.log('================================================================================');
  console.log('');

  // Individual Developer
  console.log('INDIVIDUAL DEVELOPER');
  console.log('--------------------------------------------------------------------------------');
  const scenarios = [
    { desc: 'Hobbyist (Cursor)', tool: 'cursor', spend: 20 },
    { desc: 'Professional (Cursor + API)', tool: 'cursor', apiSpend: 50 },
    { desc: 'Power User (Claude Max)', tool: 'claude-max', spend: 100 },
    { desc: 'API Heavy User', apiSpend: 200 },
  ];

  scenarios.forEach(s => {
    if (s.tool) {
      const sub = calculateSubscriptionValue(s.tool, s.spend);
      const api = s.apiSpend ? calculateAPISavings(s.apiSpend) : null;
      const totalSavings = parseFloat(sub.annualValueGain) + (api ? parseFloat(api.annualSavings) : 0);
      console.log(`${s.desc.padEnd(30)} | Annual benefit: +$${totalSavings.toFixed(0)}`);
    } else if (s.apiSpend) {
      const api = calculateAPISavings(s.apiSpend);
      console.log(`${s.desc.padEnd(30)} | Annual savings: $${api.annualSavings}`);
    }
  });

  console.log('');

  // Teams
  console.log('TEAM (10 Developers)');
  console.log('--------------------------------------------------------------------------------');
  const teamScenarios = [
    { desc: 'Cursor Team', tool: 'cursor', size: 10 },
    { desc: 'Windsurf Team', tool: 'windsurf', size: 10 },
    { desc: 'API Budget ($500/mo)', apiSpend: 500 },
  ];

  teamScenarios.forEach(s => {
    if (s.tool) {
      const team = calculateTeamSavings(s.size, s.tool);
      console.log(`${s.desc.padEnd(30)} | Annual value: +$${team.annualValueGain}`);
    } else if (s.apiSpend) {
      const api = calculateAPISavings(s.apiSpend);
      console.log(`${s.desc.padEnd(30)} | Annual savings: $${api.annualSavings}`);
    }
  });

  console.log('');

  // Enterprise
  console.log('ENTERPRISE (50 Developers)');
  console.log('--------------------------------------------------------------------------------');
  const enterpriseScenarios = [
    { desc: '50 devs × Cursor', tool: 'cursor', size: 50 },
    { desc: 'API Budget ($5K/mo)', apiSpend: 5000 },
    { desc: 'API Budget ($10K/mo)', apiSpend: 10000 },
  ];

  enterpriseScenarios.forEach(s => {
    if (s.tool) {
      const team = calculateTeamSavings(s.size, s.tool);
      console.log(`${s.desc.padEnd(30)} | Annual value: +$${team.annualValueGain}`);
    } else if (s.apiSpend) {
      const api = calculateAPISavings(s.apiSpend);
      console.log(`${s.desc.padEnd(30)} | Annual savings: $${api.annualSavings}`);
    }
  });

  console.log('');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
OPUS 67 Efficiency Calculator

Usage:
  node efficiency-calculator.js [command] [options]

Commands:
  all                    Show all tools comparison
  subscription <tool>    Calculate subscription value (e.g., cursor, lovable)
  api <spend> [model]    Calculate API savings (e.g., 100 claude-sonnet-4.5)
  team <size> <tool>     Calculate team savings (e.g., 10 cursor)
  scenarios              Show common scenarios

Examples:
  node efficiency-calculator.js all
  node efficiency-calculator.js subscription cursor
  node efficiency-calculator.js api 200 claude-opus-4.5
  node efficiency-calculator.js team 10 cursor
  node efficiency-calculator.js scenarios

Available tools: ${Object.keys(TOOLS).join(', ')}
Available models: ${Object.keys(LLM_MODELS).join(', ')}
`);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'all':
      printAllToolsComparison();
      break;

    case 'subscription':
      if (!args[1]) {
        console.log('Usage: node efficiency-calculator.js subscription <tool>');
        return;
      }
      const subResult = calculateSubscriptionValue(args[1]);
      if (subResult) {
        console.log('\nSubscription Value Analysis:');
        console.log(JSON.stringify(subResult, null, 2));
      } else {
        console.log('Tool not found. Available: ' + Object.keys(TOOLS).filter(k => TOOLS[k].type === 'subscription').join(', '));
      }
      break;

    case 'api':
      if (!args[1]) {
        console.log('Usage: node efficiency-calculator.js api <monthly_spend> [model]');
        return;
      }
      const apiResult = calculateAPISavings(parseFloat(args[1]), args[2]);
      console.log('\nAPI Savings Analysis:');
      console.log(JSON.stringify(apiResult, null, 2));
      break;

    case 'team':
      if (!args[1] || !args[2]) {
        console.log('Usage: node efficiency-calculator.js team <size> <tool>');
        return;
      }
      const teamResult = calculateTeamSavings(parseInt(args[1]), args[2]);
      if (teamResult) {
        console.log('\nTeam Savings Analysis:');
        console.log(JSON.stringify(teamResult, null, 2));
      } else {
        console.log('Tool not found. Available: ' + Object.keys(TOOLS).join(', '));
      }
      break;

    case 'scenarios':
      printScenarios();
      break;

    default:
      console.log('Unknown command. Use --help for usage.');
  }
}

main();
