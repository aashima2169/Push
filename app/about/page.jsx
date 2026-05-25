// app/about/page.jsx
'use client';

import {
  ArrowLeft, Sparkles, CheckCircle2, Telescope, Brain, MoveRight, ArrowUpRight,
  NotebookPen, Keyboard,
} from 'lucide-react';

function PushLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-about" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#logo-grad-about)" strokeWidth="2.2" fill="none" opacity="0.35" />
      <circle cx="16" cy="16" r="9" stroke="url(#logo-grad-about)" strokeWidth="2.2" fill="none" opacity="0.6" />
      <circle cx="16" cy="16" r="4" fill="url(#logo-grad-about)" />
    </svg>
  );
}

// Hardcoded example based on the founder's actual notebook entry
const EXAMPLE = {
  topic: "Expectation is the root cause of suffering",
  depthLabel: 'Probing',
  summary: "You challenged the premise by identifying expectation's functional roles, then closed too neatly with an undefined ideal.",
  wentDeep: [
    { quote: "Underlying assumptions behind this", note: "You named where this idea came from before accepting it. Most people don't do that." },
    { quote: "Expectation keeps things mutual, fair but also transactional", note: "You worked this out from your own experience, not from something you read." },
    { quote: "Would you still be hurt if they did more than what you expected?", note: "You asked a real question here instead of just asserting another answer." },
  ],
  stayedShallow: [
    {
      targetPhrase: "they don't hold true in unconditional love",
      challenge: "This is the moment your brain hit the comfort wall and wrapped things up with a neat, abstract bow. 'Unconditional love' sounds like a profound conclusion but it is actually a surface-level escape hatch — it lets you off the hook from applying this to your own life. When have you actually tried to love someone with no expectations? What happened?",
    },
    {
      targetPhrase: "Would you still be hurt if they did more than what you expected?",
      challenge: "You asked the most interesting question in your entire entry and then moved on without answering it. What is your actual answer?",
    },
  ],
  biases: [
    {
      name: 'closure bias',
      evidence: "Expectations are conditional, they don't hold true in unconditional love",
    },
  ],
  nextMoves: [
    { prompt: "Unconditional love is expectation that has been hidden from view", framing: "Test whether your tidy resolution holds up." },
    { prompt: "Expectations from myself drive most of my hard work", framing: "Examine the positive case you started but did not develop." },
  ],
};

const depthColors = {
  Surface: { color: '#E11D48', bg: '#FFE4E6' },
  Probing: { color: '#D97706', bg: '#FEF3C7' },
  'Going deeper': { color: '#059669', bg: '#D1FAE5' },
};

export default function AboutPage() {
  const depth = depthColors[EXAMPLE.depthLabel];

  return (
    <div>
      <header style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <PushLogo size={28} />
          <span style={{
            fontSize: '26px', fontWeight: 800,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>Push</span>
        </a>
        <a href="/" style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#64748B',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }} className="nav-link">
          <ArrowLeft size={15} strokeWidth={2.5} />
          Back to thinking
        </a>
      </header>

      <div className="about-wrap" style={{ padding: '24px 32px 96px', maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 4.5vw, 48px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          color: '#0F172A',
          margin: '32px 0 32px',
        }}>
          Why Push exists
        </h1>

        <div style={{ fontSize: '17px', lineHeight: 1.65, color: '#334155' }}>
          <p style={{ marginBottom: '20px' }}>
            Most of what we think is ours was handed to us. From family, culture, experience, from people who said things with confidence and we absorbed them. We carry more borrowed beliefs than we realize. We just never stopped to look.
          </p>

          <p style={{ marginBottom: '20px' }}>
            With the advent of AI and writing assistant tools, autocomplete finishes your sentence. Paraphrase tools clean your argument. "Improve this writing" smooths it over before you have to sit with the rough version. I started using these tools and noticed something: I was getting <strong style={{ color: '#0F172A' }}>faster and shallower at the same time</strong>.
          </p>

          <p style={{ marginBottom: '32px' }}>
            Push is a <strong style={{ color: '#0F172A' }}>contrarian bet</strong>. Most AI agrees with you.It completes what you started, smooths what you wrote, and makes your argument sound cleaner than it is. Push does the opposite. Write what you think. Push argues back.Tells you where you were surface level, where you went deeper, and where you need to push through.
          </p>

          <div className="pull-quote" style={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            borderLeft: '4px solid #6366F1',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '56px',
          }}>
            <p style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1E1B4B',
              margin: 0,
              lineHeight: 1.45,
            }}>
              If you find yourself sounding more like everyone else lately, that's the symptom Push is built for.
            </p>
          </div>

          {/* === STORYTELLING SECTION === */}
          <h2 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#0F172A',
            margin: '0 0 12px',
            letterSpacing: '-0.015em',
          }}>
            Here's what it looked like for me
          </h2>

          <p style={{ marginBottom: '32px', color: '#475569' }}>
            One morning I sat with a sentence I'd been carrying for years without questioning. <em>Expectation is the root cause of suffering.</em> Where did I get this? Did I actually believe it? I opened a notebook.
          </p>

          {/* Notebook images */}
          <div className="notebook-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <img
              src="/notebook-page-1.jpg"
              alt="Handwritten journal page exploring 'Expectation is the root cause of suffering'. Lists of underlying assumptions and blind spots."
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
                display: 'block',
              }}
            />
            <img
              src="/notebook-page-2.jpg"
              alt="Second handwritten page continuing the thinking. What expectations make us feel, and when they break down."
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
                display: 'block',
              }}
            />
          </div>

          <p style={{
            fontSize: '14px',
            color: '#475569',
            fontWeight: 500,
            marginBottom: '40px',
            textAlign: 'center',
          }}>
            Twenty minutes later, I had two pages of half-formed thoughts. Some real, some borrowed. I couldn't tell which were which.
          </p>

          {/* Transition: typed it in */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '24px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }} className="typed-it-box">
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Keyboard size={18} color="#4F46E5" strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.55 }}>
              <strong style={{ color: '#0F172A' }}>Then I typed it into Push.</strong> No photo upload yet. We will build it soon.
            </div>
          </div>

          <p style={{ marginBottom: '24px', color: '#475569' }}>
            Here's what Push said back:
          </p>

          {/* === RENDERED PUSH ANALYSIS CARD === */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(24px, 3vw, 36px)',
            boxShadow: '0 4px 24px rgba(15, 23, 42, 0.04)',
            border: '1px solid #E2E8F0',
            marginBottom: '40px',
          }} className="example-card">
            {/* Topic header */}
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#94A3B8', marginBottom: '6px',
            }}>
              Topic
            </div>
            <div style={{
              fontSize: '15px', color: '#475569', marginBottom: '24px',
              fontWeight: 500,
            }}>
              {EXAMPLE.topic}
            </div>

            {/* Depth pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: depth.bg, color: depth.color,
              padding: '6px 14px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 600,
              marginBottom: '16px',
            }}>
              <Sparkles size={13} strokeWidth={2.5} />
              {EXAMPLE.depthLabel}
            </div>

            {/* Summary */}
            <p style={{
              fontSize: '20px', lineHeight: 1.35,
              color: '#0F172A', margin: '0 0 32px',
              fontWeight: 600, letterSpacing: '-0.015em',
            }} className="example-summary">
              {EXAMPLE.summary}
            </p>

            {/* Where you went deeper */}
            <section style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', border: '1.5px solid #D1FAE5',
                borderRadius: '999px', padding: '6px 14px 6px 8px',
                marginBottom: '14px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: '#D1FAE5',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={13} color="#059669" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                  Where you went deeper
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#059669', opacity: 0.7,
                  background: '#D1FAE5', padding: '2px 7px', borderRadius: '999px',
                }}>
                  {EXAMPLE.wentDeep.length}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {EXAMPLE.wentDeep.map((d, i) => (
                  <div key={i} style={{
                    background: '#F0FDF4', borderRadius: '14px',
                    padding: '14px 18px', borderLeft: '3px solid #10B981',
                  }}>
                    <div style={{ fontSize: '13px', color: '#064E3B', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '7px' }}>
                      "{d.quote}"
                    </div>
                    <div style={{ fontSize: '13px', color: '#059669', lineHeight: 1.45, fontWeight: 500 }}>
                      {d.note}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Where your brain hit the wall */}
            <section style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', border: '1.5px solid #FFE4E6',
                borderRadius: '999px', padding: '6px 14px 6px 8px',
                marginBottom: '14px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: '#FFE4E6',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Telescope size={13} color="#E11D48" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#E11D48' }}>
                  Where your brain hit the wall
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#E11D48', opacity: 0.7,
                  background: '#FFE4E6', padding: '2px 7px', borderRadius: '999px',
                }}>
                  {EXAMPLE.stayedShallow.length}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '14px' }}>
                {EXAMPLE.stayedShallow.map((c, i) => (
                  <div key={i} style={{
                    background: '#FFF1F2', borderRadius: '16px',
                    padding: '18px 22px',
                    borderLeft: '4px solid #F43F5E',
                  }}>
                    <div style={{ fontSize: '13px', color: '#9F1239', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
                      "{c.targetPhrase}"
                    </div>
                    <div style={{ fontSize: '15px', color: '#4C0519', lineHeight: 1.55 }}>
                      {c.challenge}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Biases */}
            <section style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', border: '1.5px solid #FEF3C7',
                borderRadius: '999px', padding: '6px 14px 6px 8px',
                marginBottom: '14px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: '#FEF3C7',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={13} color="#D97706" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>
                  Biases showing up
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#D97706', opacity: 0.7,
                  background: '#FEF3C7', padding: '2px 7px', borderRadius: '999px',
                }}>
                  {EXAMPLE.biases.length}
                </span>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#FEF3C7', color: '#92400E',
                borderRadius: '999px', padding: '8px 14px',
                fontSize: '13px', fontWeight: 600,
              }}>
                {EXAMPLE.biases[0].name}
              </span>
            </section>

            {/* Continue thinking */}
            <section>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', border: '1.5px solid #E0E7FF',
                borderRadius: '999px', padding: '6px 14px 6px 8px',
                marginBottom: '14px',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: '#E0E7FF',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MoveRight size={13} color="#4F46E5" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#4F46E5' }}>
                  Push through
                </span>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {EXAMPLE.nextMoves.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                    border: '1.5px solid #C7D2FE',
                    borderLeft: '4px solid #6366F1',
                    borderRadius: '14px',
                    padding: '16px 20px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', color: '#1E1B4B', lineHeight: 1.4, fontWeight: 600, marginBottom: '3px' }}>
                        {m.prompt}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6366F1', lineHeight: 1.4, fontWeight: 500 }}>
                        {m.framing}
                      </div>
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: 600, color: '#4F46E5',
                      flexShrink: 0,
                    }}>
                      Start
                      <ArrowUpRight size={12} strokeWidth={2.5} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <p style={{
            fontSize: '15px',
            color: '#334155',
            fontWeight: 500,
            marginBottom: '56px',
            textAlign: 'center',
          }}>
            That gap between what I thought I was saying and what Push showed me I'd written. That's the product.
          </p>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0F172A',
            margin: '40px 0 16px',
            letterSpacing: '-0.015em',
          }}>
            What Push isn't
          </h2>

          <p style={{ marginBottom: '20px' }}>
            It's not a journaling app. It's not therapy. It's not a productivity tool. It's a practice. The people who keep coming back are practicing finding their own voice, one entry at a time.
          </p>

          <p style={{ marginBottom: '40px' }}>
            If that's the kind of practice you're looking for, you're in the right place.
          </p>

          <a href="/" className="push-cta" style={{ textDecoration: 'none' }}>
            Start thinking →
          </a>
        </div>
      </div>
    </div>
  );
}
