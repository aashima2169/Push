// app/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, ArrowRight, Loader2, Plus, Minus,
  Telescope, Brain, MoveRight, CheckCircle2,
} from 'lucide-react';

function getVisitorId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('push_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('push_visitor_id', id);
  }
  return id;
}

const sectionStyles = {
  deep:    { color: '#059669', bg: '#D1FAE5', cardBg: '#F0FDF4', border: '#10B981', icon: CheckCircle2, label: 'Where you went deeper' },
  shallow: { color: '#E11D48', bg: '#FFE4E6', cardBg: '#FFF1F2', border: '#F43F5E', icon: Telescope,    label: 'Where you stayed on the surface' },
  biases:  { color: '#D97706', bg: '#FEF3C7', cardBg: '#FFFBEB', border: '#F59E0B', icon: Brain,        label: 'Biases showing up' },
  next:    { color: '#4F46E5', bg: '#E0E7FF', cardBg: '#EEF2FF', border: '#6366F1', icon: MoveRight,    label: 'Next move' },
};

const depthStyles = {
  Surface:       { color: '#E11D48', bg: '#FFE4E6' },
  Probing:       { color: '#D97706', bg: '#FEF3C7' },
  'Going deeper':{ color: '#059669', bg: '#D1FAE5' },
};

const patternColors = {
  'Borrowed thought':  '#E11D48',
  'One-sided':         '#C2410C',
  Abstract:            '#D97706',
  'Unexamined premise':'#475569',
  Restating:           '#7C2D12',
};

// SVG thought bubble illustration for the hero
function ThoughtBubble() {
  return (
    <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="bubble-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="bubble-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EEF2FF" />
        </linearGradient>
      </defs>
      {/* Main thought bubble */}
      <ellipse cx="110" cy="80" rx="70" ry="55" fill="url(#bubble-fill)" stroke="url(#bubble-grad)" strokeWidth="3" />
      {/* Small trailing bubble */}
      <circle cx="55" cy="145" r="14" fill="url(#bubble-fill)" stroke="url(#bubble-grad)" strokeWidth="2.5" />
      {/* Smallest trailing bubble */}
      <circle cx="30" cy="170" r="7" fill="url(#bubble-fill)" stroke="url(#bubble-grad)" strokeWidth="2" />
      {/* Sparkle inside main bubble - left */}
      <path d="M85 70 L88 78 L96 81 L88 84 L85 92 L82 84 L74 81 L82 78 Z" fill="#7C3AED" />
      {/* Sparkle inside main bubble - right */}
      <path d="M130 85 L132 90 L137 92 L132 94 L130 99 L128 94 L123 92 L128 90 Z" fill="#A78BFA" />
      {/* Small dot */}
      <circle cx="110" cy="60" r="3" fill="#C4B5FD" />
    </svg>
  );
}

function SectionBadge({ kind }) {
  const s = sectionStyles[kind];
  const Icon = s.icon;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: 'white', border: `1.5px solid ${s.bg}`,
      borderRadius: '999px', padding: '6px 14px 6px 8px', marginBottom: '20px',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
    }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', background: s.bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={13} color={s.color} strokeWidth={2.5} />
      </div>
      <span style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: s.color,
      }}>{s.label}</span>
    </div>
  );
}

function BiasChip({ bias }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <span style={{ display: 'inline-block', marginBottom: '10px', marginRight: '8px', verticalAlign: 'top' }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        background: expanded ? '#F59E0B' : '#FEF3C7',
        color: expanded ? '#FFFFFF' : '#92400E',
        border: 'none', borderRadius: '999px',
        padding: '8px 14px', fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.15s', fontFamily: 'inherit',
      }}>
        {bias.name}
        {expanded ? <Minus size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
      </button>
      {expanded && (
        <div className="fade-in" style={{
          marginTop: '12px', padding: '16px 18px', background: '#FFFBEB',
          borderRadius: '14px', border: '1px solid #FEF3C7', maxWidth: '480px',
        }}>
          <div style={{ fontSize: '12px', color: '#A16207', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
            "{bias.evidence}"
          </div>
          <div style={{ fontSize: '14px', color: '#451A03', lineHeight: 1.55, marginBottom: '12px' }}>
            {bias.why}
          </div>
          <div style={{ fontSize: '14px', color: '#92400E', lineHeight: 1.5, fontWeight: 600 }}>
            → {bias.interrogation}
          </div>
        </div>
      )}
    </span>
  );
}

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => { setVisitorId(getVisitorId()); }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [result]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch('/api/push', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, text, visitorId }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || 'Something went wrong.');
      else setResult(data);
    } catch (e) { console.error(e); setError('Network error. Try again.'); }
    setLoading(false);
  };

  const depth = result ? depthStyles[result.depthLabel] : null;

  return (
    <div>
      {/* Top nav — wordmark only, no version pill */}
      <header style={{
        padding: '24px 32px', display: 'flex', alignItems: 'center',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={22} color="#A78BFA" strokeWidth={2.5} />
          </div>
          <span style={{
            fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>Push</span>
        </div>
      </header>

      {/* Hero card */}
      <div style={{ padding: '8px 32px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(180deg, #EFF0FA 0%, #E5E7F9 100%)',
          borderRadius: '32px', padding: 'clamp(32px, 5vw, 56px)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative illustration in upper right */}
          <div style={{
            position: 'absolute', right: '32px', top: '32px',
            display: 'none',
          }} className="hero-illustration">
            <ThoughtBubble />
          </div>

          {/* Status pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'white', borderRadius: '999px', padding: '8px 16px 8px 12px',
            marginBottom: '28px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}>
            <div className="pulse-dot" style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#10B981',
            }} />
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#4F46E5',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Ready when you are</span>
          </div>

          {/* Mobile illustration — shows above headline on small screens */}
          <div className="hero-illustration-mobile" style={{ display: 'block', marginBottom: '20px' }}>
            <ThoughtBubble />
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 60px)', fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0F172A',
            margin: '0 0 18px', maxWidth: '780px',
          }}>
            Push back on{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>your own thinking.</span>
          </h1>

          <p style={{
            fontSize: '18px', lineHeight: 1.55, color: '#475569',
            margin: '0 0 40px', maxWidth: '620px',
          }}>
            The opposite of autocomplete. Write what you're thinking, and Push tells you{' '}
            <strong style={{ color: '#0F172A' }}>where you actually went deeper</strong>
            {' — and '}
            <strong style={{ color: '#0F172A' }}>where you stayed on the surface or borrowed a thought</strong>.
          </p>

          <label htmlFor="topic" className="push-label">The topic or belief you want to examine</label>
          <input
            id="topic" type="text" value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. expectation is the root cause of suffering"
            className="push-input"
          />

          {/* Textarea label row with word count on the right */}
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginTop: '28px', marginBottom: '10px',
          }}>
            <label htmlFor="thinking" className="push-label" style={{ margin: 0 }}>Your thinking</label>
            {wordCount > 0 && (
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                {wordCount} word{wordCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <textarea
            id="thinking" value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Where did this thought come from? Where did you pick it up? What are the arguments for and against? Don't fill the page — interrogate yourself."
            rows={12}
            className="push-textarea"
          />

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px',
            flexWrap: 'wrap',
          }}>
            <button onClick={analyze} disabled={loading || !text.trim()} className="push-cta">
              {loading ? (
                <><Loader2 size={16} className="spin" strokeWidth={2.5} /> thinking…</>
              ) : (
                <><Sparkles size={16} strokeWidth={2.5} /> help me think better <ArrowRight size={16} strokeWidth={2.5} /></>
              )}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '20px', padding: '14px 18px', background: '#FFE4E6',
              borderRadius: '12px', color: '#BE123C', fontSize: '14px', fontWeight: 500,
              display: 'inline-block',
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && !result && (
        <div style={{
          padding: '8px 32px 48px', maxWidth: '1200px', margin: '0 auto',
          textAlign: 'center',
        }}>
          <div className="fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            color: '#6366F1', fontSize: '15px', fontWeight: 500,
            background: 'white', padding: '14px 22px', borderRadius: '999px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}>
            <Loader2 size={18} className="spin" strokeWidth={2.5} />
            Reading what you wrote…
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div ref={resultRef} style={{ padding: '8px 32px 96px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="fade-in" style={{
            background: 'white', borderRadius: '32px',
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0 4px 24px rgba(15, 23, 42, 0.04)',
          }}>
            {depth && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: depth.bg, color: depth.color,
                padding: '6px 14px', borderRadius: '999px',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                <Sparkles size={12} strokeWidth={2.5} />
                {result.depthLabel}
              </div>
            )}

            <p style={{
              fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.35,
              color: '#0F172A', margin: '0 0 48px',
              fontWeight: 600, letterSpacing: '-0.015em', maxWidth: '780px',
            }}>
              {result.summary}
            </p>

            {result.wentDeep?.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <SectionBadge kind="deep" />
                <div style={{ display: 'grid', gap: '14px' }}>
                  {result.wentDeep.map((d, i) => (
                    <div key={i} style={{
                      background: sectionStyles.deep.cardBg, borderRadius: '16px',
                      padding: '20px 24px', borderLeft: `4px solid ${sectionStyles.deep.border}`,
                    }}>
                      <div style={{ fontSize: '13px', color: '#15803D', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
                        "{d.quote}"
                      </div>
                      <div style={{ fontSize: '15px', color: '#064E3B', lineHeight: 1.55 }}>
                        {d.why}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.stayedShallow?.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <SectionBadge kind="shallow" />
                <div style={{ display: 'grid', gap: '14px' }}>
                  {result.stayedShallow.map((c, i) => (
                    <div key={i} style={{
                      background: sectionStyles.shallow.cardBg, borderRadius: '16px',
                      padding: '20px 24px',
                      borderLeft: `4px solid ${patternColors[c.pattern] || sectionStyles.shallow.border}`,
                    }}>
                      <div style={{
                        display: 'inline-block', fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: patternColors[c.pattern] || '#E11D48', marginBottom: '10px',
                      }}>
                        {c.pattern}
                      </div>
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
            )}

            {result.biases?.length > 0 && (
              <section style={{ marginBottom: '40px' }}>
                <SectionBadge kind="biases" />
                <div>
                  {result.biases.map((b, i) => <BiasChip key={i} bias={b} />)}
                </div>
              </section>
            )}

            {result.nextMove && (
              <section>
                <SectionBadge kind="next" />
                <div style={{
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  borderRadius: '16px', padding: '24px 28px',
                  borderLeft: `4px solid ${sectionStyles.next.border}`,
                }}>
                  <div style={{ fontSize: '17px', color: '#1E1B4B', lineHeight: 1.55, fontWeight: 500 }}>
                    {result.nextMove}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
