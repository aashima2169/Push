// evals/test-entries.js
// Add new entries here as you find failure cases in the wild.
// The eval script will run all of these against the current prompt.

export const TEST_ENTRIES = [
  {
    name: 'shallow-money',
    prompt: 'Money cannot buy happiness',
    text: `Money can't buy happiness, as the famous saying goes. Studies have shown that beyond a certain income, more money doesn't increase happiness. The Buddha taught that attachment to material things causes suffering. Many wealthy people are unhappy, while villagers in simple settings are often content. True happiness comes from within.`,
    expected: {
      depth: 'Surface',
      shouldFlag: ['Borrowed thought', 'Abstract'],
      shouldQuote: ['studies have shown', 'Buddha', 'happiness comes from within'],
    },
  },
  {
    name: 'shallow-success',
    prompt: 'Success requires hard work',
    text: `Success requires hard work — there are no shortcuts. As they say, the harder you work, the luckier you get. Every successful person I've read about put in the hours. You have to grind. Talent is overrated; effort is everything. This is just how the world works.`,
    expected: {
      depth: 'Surface',
      shouldFlag: ['Borrowed thought', 'One-sided', 'Unexamined premise'],
      shouldQuote: ['as they say', 'talent is overrated', 'just how the world works'],
    },
  },
  {
    name: 'deep-expectations',
    prompt: 'Expectation is the root cause of suffering',
    text: `The premise comes from self-help books and from the Bhagavad Gita as a way to achieve moksha. But expectations from self push you to be better, perform better. Expectations from others are mutual — parents help in upbringing of a child and the child in turn takes care of the parents in old age. Employer and employee have a transactional expectation that keeps things fair, but in personal relationships, expectation becomes grudge, resentment, dissatisfaction. Expectations from others make us feel like we belong, that someone cares, that we matter. But they also make us miserable when the other party doesn't hold their end. Would you still be hurt if they did more than what you expected? Expectations are conditional, they don't hold true in unconditional love.`,
    expected: {
      depth: 'Probing',
      shouldFlag: ['Unexamined premise', 'One-sided'],
      shouldQuote: ['unconditional love', 'becomes grudge', 'moksha'],
    },
  },
  {
    name: 'trap-sounds-deep',
    prompt: 'Authenticity is the highest virtue',
    text: `Authenticity is the highest virtue because being true to oneself is the foundation of all meaningful action. Without authenticity, our actions are performances, our relationships transactions, our work mere labor. The authentic self is who we truly are beneath the social conditioning. To live authentically is to align inner truth with outer expression. This is the path to meaning, fulfillment, and genuine connection. Anything less is self-betrayal.`,
    expected: {
      depth: 'Surface',
      shouldFlag: ['Abstract', 'Borrowed thought', 'Unexamined premise'],
      shouldQuote: ['authentic self', 'who we truly are', 'inner truth'],
    },
  },
  {
    name: 'mixed-relationships',
    prompt: 'Long-distance relationships rarely work',
    text: `Long-distance relationships rarely work — that's the conventional wisdom and I think it's mostly true. The lack of physical presence means you miss the small moments that build intimacy. But I also know two couples who did it for years and are now married, so the rule isn't absolute. The factor that seems to matter is whether there's a known end date. Without one, the relationship becomes endless waiting, which corrodes things. With one, it becomes a project both people are building toward.`,
    expected: {
      depth: 'Probing',
      shouldFlag: ['Borrowed thought', 'Unexamined premise'],
      shouldQuote: ['conventional wisdom', 'two couples', 'known end date'],
    },
  },
];
