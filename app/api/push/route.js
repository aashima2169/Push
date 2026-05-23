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

    try {
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      await Promise.all([
        supabaseAdmin.from('pushes').insert({
          visitor_id: visitorId || 'unknown',
          prompt,
          entry_text: text,
          entry_word_count: wordCount,
          response: result,
          depth_label: result.depthLabel,
          challenge_count: result.stayedShallow?.length || 0,
          prompt_version: PROMPT_VERSION,
        }),
        supabaseAdmin.from('sessions').upsert(
          {
            visitor_id: visitorId || 'unknown',
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: 'visitor_id', ignoreDuplicates: false }
        ),
      ]);
    } catch (logErr) {
      console.error('Logging error (non-fatal):', logErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Push error:', err);
    return NextResponse.json({ error: 'Something went wrong on our end.' }, { status: 500 });
  }
}
