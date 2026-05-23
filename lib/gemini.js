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
          why: { type: 'string' },
        },
        required: ['quote', 'why'],
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
    nextMove: { type: 'string' },
  },
  required: ['summary', 'depthLabel', 'wentDeep',
