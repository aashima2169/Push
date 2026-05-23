// evals/eval-checks.js
// Programmatic checks for the three failure modes:
//   1. Quote hallucination — does targetPhrase actually appear in the entry?
//   2. Sycophancy / validation — does the response slip in agreement language?
//   3. Genericness — could the challenge work for ANY entry, or is it tied to this one?
// Also checks: question form (challenges should be questions, not statements).

const VALIDATION_KEYWORDS = [
  'great point', 'good point', 'valid point', 'fair point', 'solid point',
  'interesting', 'insightful', 'thoughtful', 'well thought', 'well put', 'well said',
  'good observation', 'good question', 'you make a good', 'thats a great',
  'that is a great', "you're right", 'you are right', 'i agree', 'i can see',
  'i appreciate', 'it is admirable', "it's admirable",
];

const ANSWER_GIVING = [
  'perhaps because', 'this is because', 'the answer is', 'the reason is',
  'the truth is', 'in fact,', 'actually,', 'it could be that', 'maybe because',
];

const GENERIC_PHRASES = [
  'have you considered the opposite',
  'what is the other side',
  'what about the other perspective',
  'is this really true',
  'why do you think this',
];

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function checkQuoteAccuracy(targetPhrase, entryText) {
  const normEntry = normalize(entryText);
  const normPhrase = normalize(targetPhrase);
  if (!normPhrase) return { exact: false, fuzzy: 0 };
  if (normEntry.includes(normPhrase)) return { exact: true, fuzzy: 1.0 };
  const phraseWords = normPhrase.split(' ').filter((w) => w.length > 2);
  if (phraseWords.length === 0) return { exact: false, fuzzy: 0 };
  const matched = phraseWords.filter((w) => normEntry.includes(w)).length;
  return { exact: false, fuzzy: matched / phraseWords.length };
}

function checkValidation(text) {
  const lower = normalize(text);
  return VALIDATION_KEYWORDS.filter((k) => lower.includes(k));
}

function checkAnswering(text) {
  const lower = (text || '').toLowerCase();
  return ANSWER_GIVING.filter((k) => lower.includes(k));
}

function isQuestion(text) {
  const trimmed = (text || '').trim();
  if (trimmed.endsWith('?')) return true;
  if (/\?[^?]*$/.test(trimmed)) return true;
  return /^(why|how|what|where|when|who|name|give|point|walk|do you|did you|would you|could you|is there|are you)/i.test(trimmed);
}

function checkGeneric(challenge, entryText) {
  const lower = normalize(challenge);
  const isTemplate = GENERIC_PHRASES.some((g) => lower.includes(g));
  const entryWords = new Set(
    normalize(entryText).split(' ').filter((w) => w.length > 4)
  );
  const challengeWords = lower.split(' ').filter((w) => w.length > 4);
  const overlapCount = challengeWords.filter((w) => entryWords.has(w)).length;
  return { isTemplate, contentOverlap: overlapCount };
}

export function runChecks(response, entryText) {
  const failures = [];
  const challenges = response.challenges || [];

  let exactQuotes = 0;
  let fuzzyQuotes = 0;
  let validationHits = 0;
  let answeringHits = 0;
  let questionCount = 0;
  let templateHits = 0;
  let lowOverlapCount = 0;

  const summaryValidation = checkValidation(response.summary || '');
  if (summaryValidation.length > 0) {
    validationHits += summaryValidation.length;
    failures.push(`Summary contains validation: "${summaryValidation.join(', ')}"`);
  }

  for (const [i, c] of challenges.entries()) {
    const q = checkQuoteAccuracy(c.targetPhrase, entryText);
    if (q.exact) exactQuotes++;
    else if (q.fuzzy >= 0.6) fuzzyQuotes++;
    else failures.push(`Challenge ${i + 1}: targetPhrase "${c.targetPhrase}" not in entry (fuzzy=${q.fuzzy.toFixed(2)})`);

    const v = checkValidation(c.challenge);
    if (v.length > 0) {
      validationHits += v.length;
      failures.push(`Challenge ${i + 1}: validation phrase "${v.join(', ')}"`);
    }

    const a = checkAnswering(c.challenge);
    if (a.length > 0) {
      answeringHits += a.length;
      failures.push(`Challenge ${i + 1}: answer-giving phrase "${a.join(', ')}"`);
    }

    if (isQuestion(c.challenge)) questionCount++;
    else failures.push(`Challenge ${i + 1}: not a question — "${c.challenge.slice(0, 60)}..."`);

    const g = checkGeneric(c.challenge, entryText);
    if (g.isTemplate) {
      templateHits++;
      failures.push(`Challenge ${i + 1}: uses generic template phrase`);
    }
    if (g.contentOverlap < 1) {
      lowOverlapCount++;
      failures.push(`Challenge ${i + 1}: low content overlap with entry (generic-leaning)`);
    }
  }

  const total = challenges.length || 1;
  return {
    challengeCount: challenges.length,
    quoteAccuracy: {
      exact: exactQuotes,
      fuzzy: fuzzyQuotes,
      total: challenges.length,
      pct: ((exactQuotes / total) * 100).toFixed(0),
    },
    validationHits,
    answeringHits,
    questionForm: questionCount,
    questionFormPct: ((questionCount / total) * 100).toFixed(0),
    templateHits,
    lowOverlapCount,
    failures,
    pass: failures.length === 0,
  };
}
