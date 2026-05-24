// app/about/page.jsx
'use client';

import { ArrowLeft } from 'lucide-react';

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

export default function AboutPage() {
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

      <div style={{ padding: '24px 32px 96px', maxWidth: '720px', margin: '0 auto' }}>
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
            Push exists because of an observation. The more I used AI to finish my sentences, the less I noticed when my sentences were borrowed in the first place. I was getting <strong style={{ color: '#0F172A' }}>faster and shallower at the same time</strong>.
          </p>

          <p style={{ marginBottom: '20px' }}>
            The default use of AI is convenience. It completes, paraphrases, summarizes, polishes. Helpful, often necessary, sometimes essential. Most of what we believe was handed to us by someone else, and we rarely interrogate the source.
          </p>

          <p style={{ marginBottom: '32px' }}>
            Push is a <strong style={{ color: '#0F172A' }}>contrarian bet</strong>. While most AI products race to make thinking easier, Push goes the other way. It bets that as AI commoditizes the output of thinking, originality becomes the scarce resource. Same technology, opposite job. Instead of completing your thinking, it interrupts it. Instead of summarizing what you wrote, it questions it.
          </p>

          <div className="pull-quote" style={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            borderLeft: '4px solid #6366F1',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '40px',
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

          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#0F172A',
            margin: '40px 0 16px',
            letterSpacing: '-0.015em',
          }}>
            How it works
          </h2>

          <p style={{ marginBottom: '20px' }}>
            You write what you're thinking about. A belief, a half-formed argument, a journal entry, a strategy doc, whatever you'd write to think something through.
          </p>

          <p style={{ marginBottom: '16px' }}>
            Push reads it back and tells you three things:
          </p>

          <ul style={{
            margin: '0 0 24px',
            padding: 0,
            listStyle: 'none',
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '12px',
              fontSize: '17px',
              lineHeight: 1.55,
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                marginTop: '10px',
                flexShrink: 0,
              }} />
              <span><strong style={{ color: '#0F172A' }}>Where you reasoned from first principles.</strong> The moments your thinking was actually yours.</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '12px',
              fontSize: '17px',
              lineHeight: 1.55,
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F43F5E',
                marginTop: '10px',
                flexShrink: 0,
              }} />
              <span><strong style={{ color: '#0F172A' }}>Where you stayed at the surface.</strong> Places you leaned on something you picked up somewhere without interrogating it.</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '12px',
              fontSize: '17px',
              lineHeight: 1.55,
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F59E0B',
                marginTop: '10px',
                flexShrink: 0,
              }} />
              <span><strong style={{ color: '#0F172A' }}>What cognitive biases are showing up.</strong> Confirmation bias, closure bias, survivorship bias, whatever's quietly distorting your reasoning right now.</span>
            </li>
          </ul>

          <p style={{ marginBottom: '20px' }}>
            Then, where Push finds you thinking at the surface, it gives you specific prompts to keep going. Each one is tied to a contradiction or unexamined assumption from what you just wrote. Click one, write again, push back again. Over time, this builds the mental muscle of catching your own surface-level thinking before Push has to point it out.
          </p>

          <p style={{ marginBottom: '40px' }}>
            The loop is the product.
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
