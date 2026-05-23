// app/api/push/route.js
import { NextResponse } from 'next/server';
import { callPush } from '../../../lib/gemini.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { PROMPT_VERSION } from '../../../lib/prompt.js';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { prompt = '', text = '', visitorId } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Write at least a few sentences first.' }, { status: 400 });
    }
    if (text.length > 8000) {
      return NextResponse.json({ error: 'Too long. Keep it under 8000 chars for now.' }, { status: 400 });
    }

    const result = await callPush({ prompt, text });

    // Logging — verbose error reporting so Vercel logs show exactly what failed
    try {
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

      const { error: pushErr } = await supabaseAdmin.from('pushes').insert({
        visitor_id: visitorId || 'unknown',
        prompt,
        entry_text: text,
        entry_word_count: wordCount,
        response: result,
        depth_label: result.depthLabel,
        challenge_count: result.stayedShallow?.length || 0,
        prompt_version: PROMPT_VERSION,
      });
      if (pushErr) {
        console.error('=== SUPABASE INSERT (pushes) FAILED ===');
        console.error('Code:', pushErr.code, '| Message:', pushErr.message);
        console.error('Details:', pushErr.details);
        console.error('Hint:', pushErr.hint);
      } else {
        console.log('Supabase push logged successfully');
      }

      const { error: sessErr } = await supabaseAdmin
        .from('sessions')
        .upsert(
          { visitor_id: visitorId || 'unknown', last_seen_at: new Date().toISOString() },
          { onConflict: 'visitor_id', ignoreDuplicates: false }
        );
      if (sessErr) {
        console.error('=== SUPABASE UPSERT (sessions) FAILED ===');
        console.error('Code:', sessErr.code, '| Message:', sessErr.message);
        console.error('Details:', sessErr.details);
      }
    } catch (logErr) {
      console.error('Logging crashed (non-fatal):', logErr.message);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Push error:', err);
    return NextResponse.json({ error: 'Something went wrong on our end.' }, { status: 500 });
  }
}
