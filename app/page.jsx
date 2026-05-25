// app/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sparkles, ArrowRight, Loader2, Plus, Minus,
  Telescope, Brain, MoveRight, CheckCircle2, ArrowUpRight,
  Layers, X, ChevronDown, ChevronUp, Trash2, FileText,
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

const STRUCTURES = [
  {
    name: 'Source & Counter-Cases',
    blurb: 'Where did this come from, and where does it fail?',
    template: `Where did this thought come from?


The strongest case against it:


Where my own life confirms or contradicts it:

`,
  },
  {
    name: '5 Whys',
    blurb: 'Keep asking why until you hit something real.',
    template: `Why do I believe this?


But why that?


And why that?


And why that?


Once more, why?

`,
  },
  {
    name: 'Steelman',
    blurb: 'Argue both sides at their strongest.',
    template: `The best version of the argument I'm making:


The best version of the opposite argument:


Which one would I bet money on, and why:

`,
  },
  {
    name: 'Concrete Mechanism',
    blurb: 'Force yourself out of abstraction.',
    template: `The specific claim, in one sentence:


A concrete example where this is true:


A concrete example where the opposite is true:


The mechanism that actually explains the difference:

`,
  },
];

function textMatchesStructure(text, structureIndex) {
  if (structureIndex === null) return false;
  const template = STRUCTURES[structureIndex].template;
  const headings = template.split('\n').filter(line => line.trim().length > 0);
  if (headings.length === 0) return false;
  const present = headings.filter(h => text.includes(h.trim())).length;
  return present >= Math.ceil(headings.length * 0.66);
}

const sectionStyles = {
  deep:    { color: '#059669', bg: '#D1FAE5', cardBg: '#F0FDF4', border: '#10B981', icon: CheckCircle2, label: 'Where you went deeper' },
  shallow: { color: '#E11D48', bg: '#FFE4E6', cardBg: '#FFF1F2', border: '#F43F5E', icon: Telescope,    label: 'Where your brain hit the wall' },
  biases:  { color: '#D97706', bg: '#FEF3C7', cardBg: '#FFFBEB', border: '#F59E0B', icon: Brain,        label: 'Biases showing up' },
  next:    { color: '#4F46E5', bg: '#E0E7FF', cardBg: '#EEF2FF', border: '#6366F1', icon: MoveRight,    label: 'Push through' },
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

function PushLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="2.2" fill="none" opacity="0.35" />
      <circle cx="16" cy="16" r="9" stroke="url(#logo-grad)" strokeWidth="2.2" fill="none" opacity="0.6" />
      <circle cx="16" cy="16" r="4" fill="url(#logo-grad)" />
    </svg>
  );
}

function CollapsibleSection({ kind, count, expanded, onToggle, children }) {
  const s = sectionStyles[kind];
  const Icon = s.icon;
  return (
    <section style={{ marginBottom: '32px' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'white', border: `1.5px solid ${s.bg}`,
          borderRadius: '999px', padding: '6px 14px 6px 8px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.15s',
          marginBottom: expanded ? '20px' : '0',
        }}
        className="collapsible-trigger"
      >
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%', background: s.bg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} color={s.color} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: s.color }}>
          {s.label}
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: s.color, opacity: 0.7,
          background: s.bg, padding: '2px 7px', borderRadius: '999px',
        }}>
          {count}
        </span>
        {expanded
          ? <ChevronUp size={14} color={s.color} strokeWidth={2.5} />
          : <ChevronDown size={14} color={s.color} strokeWidth={2.5} />
        }
      </button>
      {expanded && <div className="fade-in">{children}</div>}
    </section>
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
        transition: 'all 0.15s', fontFamily: 'inherit', minHeight: '36px',
      }}>
        {bias.name}
        {expanded ? <Minus size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
      </button>
      {expanded && (
        <div className="fade-in bias-expanded" style={{
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

function StructurePicker({ onSelect, onClose, currentStructureIndex }) {
  return (
    <div className="fade-in" style={{
      background: 'white', border: '1.5px solid #C7D2FE', borderRadius: '16px',
      padding: '16px', marginTop: '10px', marginBottom: '14px',
      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E1B4B' }}>
          Pick a thinking structure
        </div>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '8px', display: 'flex', alignItems: 'center', color: '#94A3B8',
          minHeight: '32px', minWidth: '32px',
        }}>
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        {STRUCTURES.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="structure-option"
            style={{
              background: i === currentStructureIndex ? '#EEF2FF' : 'transparent',
              border: '1px solid ' + (i === currentStructureIndex ? '#C7D2FE' : '#E2E8F0'),
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>
                {s.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {s.blurb}
              </div>
            </div>
            <ArrowRight size={14} color="#6366F1" strokeWidth={2.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

// Collapsible "what you wrote" reference panel at the top of diagnosis
function EntryReference({ topic, text }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.length > 100 ? text.substring(0, 100).trim() + '...' : text;
  return (
    <div style={{ marginBottom: '24px' }}>
      <button onClick={() => setExpanded(!expanded)} className="entry-toggle">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <FileText size={14} color="#64748B" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{
              fontSize: '12px', fontWeight: 600, color: '#94A3B8',
              marginBottom: '2px',
            }}>
              What you wrote
            </div>
            <div style={{
              fontSize: '13px', color: '#475569',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {topic ? `${topic} — ` : ''}{!expanded && preview}
            </div>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={16} color="#64748B" strokeWidth={2.5} style={{ flexShrink: 0 }} />
          : <ChevronDown size={16} color="#64748B" strokeWidth={2.5} style={{ flexShrink: 0 }} />
        }
      </button>
      {expanded && (
        <div className="fade-in" style={{
          background: '#F8FAFC', borderRadius: '14px', padding: '20px 22px',
          marginTop: '8px', border: '1px solid #E2E8F0',
        }}>
          {topic && (
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#94A3B8', marginBottom: '6px',
            }}>
              Topic
            </div>
          )}
          {topic && (
            <div style={{
              fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '16px',
            }}>
              {topic}
            </div>
          )}
          <div style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#94A3B8', marginBottom: '6px',
          }}>
            Your thinking
          </div>
          <div style={{
            fontSize: '14px', color: '#334155', lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {text}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [submittedEntry, setSubmittedEntry] = useState(null); // snapshot of what was sent
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentStructure, setCurrentStructure] = useState(null);
  const [deepExpanded, setDeepExpanded] = useState(false);
  const [shallowExpanded, setShallowExpanded] = useState(true);
  const [biasesExpanded, setBiasesExpanded] = useState(false);
  const [pushId, setPushId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const resultRef = useRef(null);
  const textareaRef = useRef(null);
  const topicRef = useRef(null);

  useEffect(() => { setVisitorId(getVisitorId()); }, []);

  useEffect(() => {
    if (currentStructure !== null && !textMatchesStructure(text, currentStructure)) {
      setCurrentStructure(null);
    }
  }, [text, currentStructure]);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    if (result) {
      const hasDeep = result.wentDeep?.length > 0;
      const hasShallow = result.stayedShallow?.length > 0;
      if (hasShallow) {
        setShallowExpanded(true);
        setDeepExpanded(false);
      } else if (hasDeep) {
        setDeepExpanded(true);
        setShallowExpanded(false);
      }
      setBiasesExpanded(false);
    }
  }, [result]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const hasContent = text.trim().length > 0 || prompt.trim().length > 0;

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null); setResult(null); setFeedback(null); setPushId(null);
    setSubmittedEntry({ topic: prompt, text: text });
    try {
      const response = await fetch('/api/push', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, text, visitorId }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || 'Something went wrong.');
      else {
        setResult(data);
        if (data.pushId) setPushId(data.pushId);
      }
    } catch (e) { console.error(e); setError('Network error. Try again.'); }
    setLoading(false);
  };

  const applyStructure = (index) => {
    const meaningfulContent = text.trim().length > 20;
    if (meaningfulContent && !window.confirm('This will replace what you\'ve written. Continue?')) {
      setShowPicker(false);
      return;
    }
    setText(STRUCTURES[index].template);
    setCurrentStructure(index);
    setShowPicker(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = STRUCTURES[index].template.indexOf('\n\n') + 2;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 50);
  };

  const cycleStructure = () => {
    const next = currentStructure === null ? 0 : (currentStructure + 1) % STRUCTURES.length;
    applyStructure(next);
  };

  const clearAll = () => {
    const meaningfulContent = text.trim().length > 20 || prompt.trim().length > 5;
    if (meaningfulContent && !window.confirm('Clear everything you\'ve written?')) return;
    setText('');
    setPrompt('');
    setCurrentStructure(null);
    setResult(null);
    setSubmittedEntry(null);
    setError(null);
    setTimeout(() => {
      if (topicRef.current) topicRef.current.focus();
    }, 50);
  };

  const startWithPrompt = (newPrompt) => {
    setPrompt(newPrompt);
    setText('');
    setResult(null);
    setSubmittedEntry(null);
    setCurrentStructure(null);
    setFeedback(null);
    setPushId(null);
    setTimeout(() => {
      if (topicRef.current) topicRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (textareaRef.current) textareaRef.current.focus();
    }, 200);
  };

  const submitFeedback = async (rating) => {
    setFeedback(rating);
    if (!pushId) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushId, rating }),
      });
    } catch (e) {
      console.error('Feedback error:', e);
    }
  };

  const depth = result ? depthStyles[result.depthLabel] : null;

  return (
    <div>
      <header className="page-header" style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PushLogo size={28} />
          <span style={{
            fontSize: '26px', fontWeight: 800,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>Push</span>
        </div>
        <a href="/about" style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#64748B',
          textDecoration: 'none',
        }} className="nav-link">
          About
        </a>
      </header>

      <div className="page-wrap" style={{ padding: '24px 32px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="hero-card" style={{
          background: 'linear-gradient(180deg, #EFF0FA 0%, #E5E7F9 100%)',
          borderRadius: '32px',
          padding: 'clamp(40px, 6vw, 64px) clamp(32px, 5vw, 56px)',
        }}>
          <h1 className="hero-headline" style={{
            fontSize: 'clamp(36px, 5.5vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            margin: '0 0 20px',
            maxWidth: '820px',
          }}>
            Most AI agrees with you.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Push doesn't.</span>
          </h1>

          <p className="hero-subhead" style={{
            fontSize: 'clamp(17px, 1.7vw, 19px)',
            lineHeight: 1.5,
            color: '#475569',
            margin: '0 0 44px',
            maxWidth: '640px',
            fontWeight: 500,
          }}>
            Stop sounding like everyone else. Start sounding like you.
          </p>

          <label htmlFor="topic" className="push-label">The topic or belief you want to examine</label>
          <input
            id="topic" ref={topicRef} type="text" value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. expectation is the root cause of suffering"
            className="push-input"
          />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '28px', marginBottom: '10px', flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <label htmlFor="thinking" className="push-label" style={{ margin: 0 }}>Your thinking</label>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="structure-trigger"
              >
                <Layers size={13} strokeWidth={2.5} />
                {currentStructure !== null ? `Using: ${STRUCTURES[currentStructure].name}` : 'Need a structure?'}
              </button>
              {hasContent && (
                <button onClick={clearAll} className="clear-trigger">
                  <Trash2 size={13} strokeWidth={2.5} />
                  Clear
                </button>
              )}
            </div>
            {wordCount > 0 && (
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                {wordCount} word{wordCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {showPicker && (
            <StructurePicker
              onSelect={applyStructure}
              onClose={() => setShowPicker(false)}
              currentStructureIndex={currentStructure}
            />
          )}

          <textarea
            id="thinking" ref={textareaRef} value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Where did this thought come from? What's the strongest case against it? Where does your own life confirm or contradict it? Don't fill the page, interrogate yourself."
            rows={12}
            className="push-textarea"
          />

          {currentStructure !== null && (
            <div style={{ marginTop: '10px' }}>
              <button onClick={cycleStructure} className="cycle-link">
                Try another structure →
              </button>
            </div>
          )}

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

      {result && (
        <div ref={resultRef} className="page-wrap" style={{ padding: '8px 32px 96px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="fade-in result-card" style={{
            background: 'white', borderRadius: '32px',
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0 4px 24px rgba(15, 23, 42, 0.04)',
          }}>
            {/* Reference panel at top */}
            {submittedEntry && (
              <EntryReference topic={submittedEntry.topic} text={submittedEntry.text} />
            )}

            {depth && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: depth.bg, color: depth.color,
                padding: '6px 14px', borderRadius: '999px',
                fontSize: '13px', fontWeight: 600,
                marginBottom: '32px',
              }}>
                <Sparkles size={13} strokeWidth={2.5} />
                {result.depthLabel}
              </div>
            )}

            {result.wentDeep?.length > 0 && (
              <CollapsibleSection
                kind="deep"
                count={result.wentDeep.length}
                expanded={deepExpanded}
                onToggle={() => setDeepExpanded(!deepExpanded)}
              >
                <div style={{ display: 'grid', gap: '10px' }}>
                  {result.wentDeep.map((d, i) => (
                    <div key={i} style={{
                      background: sectionStyles.deep.cardBg, borderRadius: '14px',
                      padding: '16px 20px', borderLeft: `3px solid ${sectionStyles.deep.border}`,
                    }}>
                      <div style={{ fontSize: '13px', color: '#064E3B', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '8px' }}>
                        "{d.quote}"
                      </div>
                      <div style={{ fontSize: '14px', color: '#059669', lineHeight: 1.5, fontWeight: 500 }}>
                        {d.note}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {result.stayedShallow?.length > 0 && (
              <CollapsibleSection
                kind="shallow"
                count={result.stayedShallow.length}
                expanded={shallowExpanded}
                onToggle={() => setShallowExpanded(!shallowExpanded)}
              >
                <div style={{ display: 'grid', gap: '14px' }}>
                  {result.stayedShallow.map((c, i) => (
                    <div key={i} style={{
                      background: sectionStyles.shallow.cardBg, borderRadius: '16px',
                      padding: '20px 24px',
                      borderLeft: `4px solid ${sectionStyles.shallow.border}`,
                    }}>
                      {c.targetPhrase && c.targetPhrase.length < 80 && (
                        <div style={{ fontSize: '13px', color: '#9F1239', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.5 }}>
                          "{c.targetPhrase}"
                        </div>
                      )}
                      <div style={{ fontSize: '15px', color: '#4C0519', lineHeight: 1.6 }}>
                        {c.challenge}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {result.biases?.length > 0 && (
              <CollapsibleSection
                kind="biases"
                count={result.biases.length}
                expanded={biasesExpanded}
                onToggle={() => setBiasesExpanded(!biasesExpanded)}
              >
                <div>
                  {result.biases.map((b, i) => <BiasChip key={i} bias={b} />)}
                </div>
              </CollapsibleSection>
            )}

            {result.nextMoves?.length > 0 && (
              <section>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'white', border: `1.5px solid ${sectionStyles.next.bg}`,
                  borderRadius: '999px', padding: '6px 14px 6px 8px',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)', marginBottom: '20px',
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: sectionStyles.next.bg,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MoveRight size={13} color={sectionStyles.next.color} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: sectionStyles.next.color }}>
                    Push through
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {result.nextMoves.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => startWithPrompt(m.prompt)}
                      className="next-move-btn"
                    >
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{
                          fontSize: '16px', color: '#1E1B4B', lineHeight: 1.45,
                          fontWeight: 600, marginBottom: '4px',
                        }}>
                          {m.prompt}
                        </div>
                        <div style={{
                          fontSize: '13px', color: '#6366F1', lineHeight: 1.4,
                          fontWeight: 500,
                        }}>
                          {m.framing}
                        </div>
                      </div>
                      <div className="start-badge" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 600, color: '#4F46E5',
                        flexShrink: 0,
                      }}>
                        Start
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Feedback */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', flexWrap: 'wrap', padding: '24px 0 24px',
          }}>
            {!feedback ? (
              <>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
                  Did Push call it right?
                </span>
                {[
                  { label: 'This hit.', value: 'hit', color: '#059669', bg: '#F0FDF4' },
                  { label: 'Too easy.', value: 'easy', color: '#D97706', bg: '#FFFBEB' },
                  { label: 'Off target.', value: 'off', color: '#E11D48', bg: '#FFF1F2' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => submitFeedback(opt.value)}
                    style={{
                      background: opt.bg,
                      border: `1.5px solid ${opt.color}44`,
                      color: opt.color,
                      borderRadius: '999px',
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                      minHeight: '36px',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            ) : (
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                Got it. Helps Push get better.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
