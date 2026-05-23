// evals/run-evals.js
// Run with: npm run evals
// Loads .env.local automatically. Outputs a markdown report to evals/results/.

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config({ path: '.env.local' });
config(); // fallback to .env if .env.local missing

import { TEST_ENTRIES } from './test-entries.js';
import { runChecks } from './eval-checks.js';
import { SYSTEM_PROMPT, PROMPT_VERSION } from '../lib/prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY. Set it in .env.local or your shell.');
  process.exit(1);
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    depthLabel: { type: 'string', enum: ['Surface', 'Probing', 'Going deeper'] },
    challenges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            enum: ['Borrowed thought', 'One-sided', 'Abstract', 'Unexamined premise', 'Restating'],
          },
          targetPhrase: { type: 'string' },
          challenge: { type: 'string' },
        },
        required: ['pattern', 'targetPhrase', 'challenge'],
      },
    },
  },
  required: ['summary', 'depthLabel', 'challenges'],
};

async function callGemini(prompt, text) {
  const userMsg = `Topic/prompt they're thinking about: ${prompt}\n\nTheir writing:\n${text}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(textOut);
}

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};

async function main() {
  console.log(`\n${c.bold}Push evals${c.reset} — prompt ${PROMPT_VERSION} — model ${MODEL}\n`);

  const results = [];
  let totalFailures = 0;

  for (const entry of TEST_ENTRIES) {
    process.stdout.write(`${c.dim}Running${c.reset} ${entry.name}...`);
    try {
      const response = await callGemini(entry.prompt, entry.text);
      const checks = runChecks(response, entry.text);
      const depthMatch = response.depthLabel === entry.expected.depth;
      const status = checks.pass && depthMatch ? `${c.green}✓ PASS${c.reset}` : `${c.red}✗ FAIL${c.reset}`;
      console.log(`\r${status} ${entry.name}${' '.repeat(20)}`);

      console.log(`  Depth: ${response.depthLabel} ${depthMatch ? '' : `(expected ${entry.expected.depth})`}`);
      console.log(`  Quote accuracy: ${checks.quoteAccuracy.exact}/${checks.quoteAccuracy.total} exact (${checks.quoteAccuracy.pct}%)`);
      console.log(`  Question form: ${checks.questionForm}/${checks.challengeCount} (${checks.questionFormPct}%)`);
      console.log(`  Validation hits: ${checks.validationHits === 0 ? c.green : c.red}${checks.validationHits}${c.reset}`);
      console.log(`  Answer-giving hits: ${checks.answeringHits === 0 ? c.green : c.red}${checks.answeringHits}${c.reset}`);
      console.log(`  Template/generic flags: ${checks.templateHits + checks.lowOverlapCount}`);

      if (checks.failures.length) {
        console.log(`  ${c.yellow}Issues:${c.reset}`);
        checks.failures.slice(0, 5).forEach((f) => console.log(`    • ${f}`));
        if (checks.failures.length > 5) console.log(`    • ...and ${checks.failures.length - 5} more`);
        totalFailures += checks.failures.length;
      }
      console.log('');

      results.push({ entry: entry.name, response, checks, depthMatch });
    } catch (err) {
      console.log(`\r${c.red}✗ ERROR${c.reset} ${entry.name}: ${err.message}\n`);
      results.push({ entry: entry.name, error: err.message });
    }
  }

  const resultsDir = path.join(__dirname, 'results');
  fs.mkdirSync(resultsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(resultsDir, `${timestamp}_${PROMPT_VERSION}.md`);

  let md = `# Push eval run\n\n- Prompt version: \`${PROMPT_VERSION}\`\n- Model: \`${MODEL}\`\n- Date: ${new Date().toISOString()}\n- Total failures across runs: ${totalFailures}\n\n---\n\n`;
  for (const r of results) {
    md += `## ${r.entry}\n\n`;
    if (r.error) { md += `**ERROR**: ${r.error}\n\n`; continue; }
    md += `**Depth**: ${r.response.depthLabel} ${r.depthMatch ? '✓' : '(mismatch)'}\n\n`;
    md += `**Summary**: ${r.response.summary}\n\n`;
    md += `**Challenges (${r.response.challenges.length})**:\n\n`;
    r.response.challenges.forEach((ch, i) => {
      md += `${i + 1}. *${ch.pattern}* — "${ch.targetPhrase}"\n   ${ch.challenge}\n\n`;
    });
    md += `**Checks**:\n- Quote accuracy: ${r.checks.quoteAccuracy.exact}/${r.checks.quoteAccuracy.total}\n- Question form: ${r.checks.questionForm}/${r.checks.challengeCount}\n- Validation hits: ${r.checks.validationHits}\n- Failures: ${r.checks.failures.length}\n\n`;
    if (r.checks.failures.length) md += r.checks.failures.map((f) => `  - ${f}`).join('\n') + '\n\n';
    md += `---\n\n`;
  }
  fs.writeFileSync(reportPath, md);
  console.log(`${c.cyan}Report written to ${reportPath}${c.reset}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
