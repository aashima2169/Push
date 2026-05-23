// app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

function getVisitorId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('push_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('push_visitor_id', id);
  }
  return id;
}

const patternColors = {
  'Borrowed thought': '#D4471C',
  'One-sided': '#B8400D',
  Abstract: '#8B6914',
  'Unexamined premise': '#6B6B68',
  Restating: '#5A3D2D',
};

const depthColor = {
  Surface: '#D4471C',
  Probing: '#8B6914',
  'Going deeper': '#2D5A3D',
};

export default function Page() {
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visitorId, setVisitorId] = useState(null);

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, text, visitorId }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || 'Something went wrong.');
      else setResult(data);
    } catch (e) {
      console.error(e);
      setError('Network error. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 32px 96px' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '72px',
          paddingBottom: '24px',
          borderBottom: '1px solid #D9D9D4',
        }}
      >
        <div>
          <h1
            className="serif"
            style={{
              fontSize: '56px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              margin: 0,
              fontStyle: 'italic',
              fontVariationSettings: '"opsz" 72',
            }}
          >
            Push
          </h1>
          <div style={{ fontSize: '14px', color: '#6B6B68', marginTop: '10px' }}>
            think deeper, not faster
          </div>
        </div>
        <div className="caps" style={{ opacity: 0.5 }}>v0.1</div>
      </header>

      <div className="push-grid">
        <div>
          <label htmlFor="topic">What are you thinking about?</label>
          <input
            id="topic"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. expectation is the root cause of suffering"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #D9D9D4',
              fontSize: '22px',
              padding: '10px 0 18px',
              marginTop: '10px',
              outline: 'none',
              color: '#161616',
            }}
          />

          <label htmlFor="thinking" style={{ marginTop: '40px' }}>Your thinking</label>
          <textarea
            id="thinking"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Where did this thought come from? Where did you pick it up? What are the arguments for and against? Don't fill the page — interrogate yourself."
            rows={18}
            style={{
              width: '100%',
              background: '#FAFAF7',
              border: '1px solid #D9D9D4',
              borderRadius: '2px',
              padding: '24px',
              fontSize: '16px',
              lineHeight: 1.7,
              resize: 'vertical',
              outline: 'none',
              color: '#161616',
              marginTop: '14px',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
              flexWrap: 'wrap',
              gap: '12px',
              minHeight: '40px',
            }}
          >
            <button onClick={analyze} disabled={loading || !text.trim()} className="push-btn">
              {loading ? (
                <><Loader2 size={15} className="spin" /> reading…</>
              ) : (
                <>push back <ArrowRight size={15} /></>
              )}
            </button>
            {wordCount > 0 && (
              <div style={{ fontSize: '12px', color: '#A8A8A4' }}>
                {wordCount} word{wordCount === 1 ? '' : 's'}
              </div>
            )}
          </div>
        </div>

        <aside className="push-aside">
          {!result && !loading && !error && (
            <div style={{ color: '#A8A8A4', fontSize: '15px', lineHeight: 1.7 }}>
              Write something, then push back.
              <br /><br />
              Push won't complete your thoughts — it will interrupt them with questions you'd rather not answer.
            </div>
          )}

          {loading && (
            <div style={{ color: '#6B6B68', fontSize: '14px' }}>reading what you wrote…</div>
          )}

          {error && <div style={{ color: '#D4471C', fontSize: '14px' }}>{error}</div>}

          {result && (
            <div>
              <div
                className="fade-in stag-1 caps"
                style={{ color: depthColor[result.depthLabel] || '#6B6B68', marginBottom: '12px' }}
              >
                Read · {result.depthLabel}
              </div>
              <p
                className="serif fade-in stag-2"
                style={{
                  fontSize: '19px',
                  lineHeight: 1.55,
                  fontStyle: 'italic',
                  color: '#2a2a2a',
                  margin: '0 0 44px',
                  fontVariationSettings: '"opsz" 36',
                }}
              >
                {result.summary}
              </p>

              <div className="fade-in stag-2 caps" style={{ marginBottom: '24px' }}>
                Pushback · {result.challenges.length}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {result.challenges.map((c, i) => (
                  <div
                    key={i}
                    className={`fade-in stag-${Math.min(i + 3, 5)}`}
                    style={{
                      borderLeft: `2px solid ${patternColors[c.pattern] || '#D4471C'}`,
                      paddingLeft: '20px',
                    }}
                  >
                    <div
                      className="caps"
                      style={{
                        color: patternColors[c.pattern] || '#D4471C',
                        marginBottom: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {c.pattern}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#A8A8A4',
                        fontStyle: 'italic',
                        marginBottom: '12px',
                        lineHeight: 1.5,
                      }}
                    >
                      "{c.targetPhrase}"
                    </div>
                    <div style={{ fontSize: '16px', lineHeight: 1.55, color: '#161616' }}>
                      {c.challenge}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="fade-in stag-5"
                style={{
                  marginTop: '44px',
                  paddingTop: '20px',
                  borderTop: '1px solid #D9D9D4',
                  fontSize: '13px',
                  color: '#A8A8A4',
                  lineHeight: 1.6,
                }}
              >
                Now go answer one of these in the text on the left. Push back again when you're done.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
