// app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';

const depthColors = {
  Surface: { bg: '#FFE4E6', color: '#E11D48', bar: '#F43F5E' },
  Probing: { bg: '#FEF3C7', color: '#D97706', bar: '#F59E0B' },
  'Going deeper': { bg: '#D1FAE5', color: '#059669', bar: '#10B981' },
};

const feedbackLabels = {
  hit: { label: 'This hit.', color: '#059669', bg: '#D1FAE5' },
  easy: { label: 'Too easy.', color: '#D97706', bg: '#FEF3C7' },
  off: { label: 'Off target.', color: '#E11D48', bg: '#FFE4E6' },
  none: { label: 'No feedback', color: '#94A3B8', bg: '#F1F5F9' },
};

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '24px',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)', flex: 1, minWidth: '160px',
    }}>
      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
            {d.count > 0 ? d.count : ''}
          </div>
          <div style={{
            width: '100%', background: d.count > 0 ? '#6366F1' : '#E2E8F0',
            borderRadius: '4px 4px 0 0',
            height: `${Math.max((d.count / max) * 60, d.count > 0 ? 4 : 2)}px`,
            transition: 'height 0.3s',
          }} />
          <div style={{
            fontSize: '10px', color: '#94A3B8', fontWeight: 500,
            transform: 'rotate(-45deg)', transformOrigin: 'center',
            whiteSpace: 'nowrap',
          }}>
            {d.date.slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [key, setKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('push_dashboard_key');
    if (saved) { setKey(saved); fetchData(saved); }
  }, []);

  const fetchData = async (k) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/analytics', {
        headers: { 'x-dashboard-key': k },
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Failed'); return; }
      setData(json);
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    localStorage.setItem('push_dashboard_key', inputKey);
    setKey(inputKey);
    fetchData(inputKey);
  };

  if (!key) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ textAlign: 'center', maxWidth: '320px', width: '100%', padding: '32px' }}>
          <div style={{
            fontSize: '24px', fontWeight: 800, color: '#0F172A',
            letterSpacing: '-0.02em', marginBottom: '8px',
          }}>
            Push Analytics
          </div>
          <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
            Enter your dashboard key
          </div>
          <input
            type="password"
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Dashboard key"
            style={{
              width: '100%', padding: '12px 16px', fontSize: '15px',
              border: '1.5px solid #E2E8F0', borderRadius: '12px',
              outline: 'none', fontFamily: 'inherit', marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: 'white', border: 'none', borderRadius: '12px',
              padding: '12px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            View dashboard
          </button>
          {error && (
            <div style={{ color: '#E11D48', fontSize: '13px', marginTop: '12px' }}>
              Wrong key.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#6366F1', fontSize: '15px',
      }}>
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ textAlign: 'center', color: '#E11D48' }}>
          {error}
          <br />
          <button onClick={() => { setKey(''); localStorage.removeItem('push_dashboard_key'); }}
            style={{ marginTop: '12px', cursor: 'pointer', color: '#64748B', background: 'none', border: 'none', fontFamily: 'inherit' }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalFeedback = data.feedbackCounts.hit + data.feedbackCounts.easy + data.feedbackCounts.off;

  return (
    <div style={{
      minHeight: '100vh', padding: '32px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      maxWidth: '1100px', margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Push Analytics
          </div>
          <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
            Last updated just now
          </div>
        </div>
        <button
          onClick={() => fetchData(key)}
          style={{
            background: 'white', border: '1.5px solid #E2E8F0', borderRadius: '10px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#475569',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <StatCard label="Total entries" value={data.totalEntries} />
        <StatCard label="Unique users" value={data.uniqueUsers} />
        <StatCard label="Return users" value={data.returnUsers} sub={`${data.returnRate}% came back`} />
        <StatCard label="Avg word count" value={data.avgWordCount} sub="per entry" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Depth distribution */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '16px' }}>
            Depth distribution
          </div>
          {Object.entries(data.depthCounts).map(([label, count]) => {
            const style = depthColors[label] || { bg: '#F1F5F9', color: '#475569', bar: '#94A3B8' };
            const pct = data.totalEntries > 0 ? Math.round((count / data.totalEntries) * 100) : 0;
            return (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: style.color }}>{label}</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: '#F1F5F9', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ background: style.bar, height: '100%', width: `${pct}%`, borderRadius: '999px', transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback distribution */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '16px' }}>
            Feedback ({totalFeedback} rated)
          </div>
          {['hit', 'easy', 'off'].map(k => {
            const f = feedbackLabels[k];
            const count = data.feedbackCounts[k] || 0;
            const pct = totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0;
            return (
              <div key={k} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: f.color }}>{f.label}</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: '#F1F5F9', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ background: f.color, height: '100%', width: `${pct}%`, borderRadius: '999px', transition: 'width 0.5s', opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#94A3B8' }}>
            {data.feedbackCounts.none} entries with no feedback
          </div>
        </div>
      </div>

      {/* Daily chart */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(15,23,42,0.06)', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '20px' }}>
          Entries — last 14 days
        </div>
        <BarChart data={data.dailyCounts} />
      </div>

      {/* Prompt version breakdown */}
      {Object.keys(data.versionCounts).length > 1 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(15,23,42,0.06)', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '12px' }}>
            Prompt version breakdown
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(data.versionCounts).map(([v, count]) => (
              <div key={v} style={{
                background: '#EEF2FF', borderRadius: '10px', padding: '10px 16px',
                fontSize: '13px', color: '#4F46E5', fontWeight: 600,
              }}>
                {v}: {count} entries
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent entries */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '16px' }}>
          Recent entries
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Date', 'Topic', 'Depth', 'Words', 'Feedback', 'Version'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px', color: '#94A3B8',
                    fontWeight: 600, borderBottom: '1px solid #F1F5F9',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent.map((row, i) => {
                const depth = depthColors[row.depth] || { bg: '#F1F5F9', color: '#475569' };
                const fb = row.feedback ? feedbackLabels[row.feedback] : null;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.date}</td>
                    <td style={{ padding: '10px 12px', color: '#0F172A', fontWeight: 500, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.topic}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: depth.bg, color: depth.color,
                        borderRadius: '999px', padding: '3px 10px',
                        fontSize: '11px', fontWeight: 700,
                      }}>{row.depth}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>{row.words}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {fb ? (
                        <span style={{
                          background: fb.bg, color: fb.color,
                          borderRadius: '999px', padding: '3px 10px',
                          fontSize: '11px', fontWeight: 700,
                        }}>{fb.label}</span>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{row.version}</td>
                  </tr>
                );
              })}
              {data.recent.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                    No entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={() => { setKey(''); localStorage.removeItem('push_dashboard_key'); }}
          style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
