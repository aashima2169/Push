// lib/gemini.js
import { SYSTEM_PROMPT } from './prompt.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    depthLabel: { type: 'string', enum: ['Surface', 'Probing', 'Going deeper'] },
    wentDeep: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          tag: { type: 'string' },
        },
        required: ['quote', 'tag'],
      },
    },
    stayedShallow: {
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
    biases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          evidence: { type: 'string' },
          why: { type: 'string' },
          interrogation: { type: 'string' },
        },
        required: ['name', 'evidence', 'why', 'interrogation'],
      },
    },
    nextMoves: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          framing: { type: 'string' },
        },
        required: ['prompt', 'framing'],
      },
    },
  },
  required: ['summary', 'depthLabel', 'wentDeep', 'stayedShallow', 'biases', 'nextMoves'],
};

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (e1) {
    const lastBrace = raw.lastIndexOf('}');
    if (lastBrace > 0) {
      try {
        return JSON.parse(raw.substring(0, lastBrace + 1));
      } catch (e2) {
        throw new Error(`JSON parse failed even after recovery. Raw start: ${raw.substring(0, 200)}`);
      }
    }
    throw e1;
  }
}

export async function callPush({ prompt, text }) {
  const userMsg = `Topic/prompt they're thinking about: ${prompt || '(unspecified)'}\n\nTheir writing:\n${text}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

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
        maxOutputTokens: 3000,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOut) throw new Error('Gemini returned no text');

  return safeJsonParse(textOut);
}
