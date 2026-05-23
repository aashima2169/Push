// app/api/push/route.js
import { NextResponse } from 'next/server';
import { callPush } from '../../../lib/gemini.js';
import { supabaseAdmin } from '../../../lib/supabase.js';
import { PROMPT_VERSION } from '../../../lib/prompt.js';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req) {
  // === Stage 0: env var check at entry ===
  console.log('[push] === REQUEST START ===');
  console.log('[push] env check:', {
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_gemini_key: !!process.env.GEMINI_API_KEY,
    supabase_url_prefix: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').substring(0, 30),
    service_role_prefix: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').substring(0, 20),
  });

  try {
    const { prompt = '', text = '', visitorId } = await req.json();
    console.log('[push] received request', {
      prompt_len: prompt.length,
      text_len: text.length,
      visitor_id: visitorId,
    });

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Write at least a few sentences first.' }, { status: 400 });
    }
    if (text.length > 8000) {
      return NextResponse.json({ error: 'Too long. Keep it under 8000 chars for now.' }, { status: 400 });
    }

    // === Stage 1: Call Gemini ===
    console.log('[push] calling Gemini...');
    const result = await callPush({ prompt, text });
    console.log('[push] Gemini returned successfully', {
      depth: result.depthLabel,
      deep_count: result.wentDeep?.length || 0,
      shallow_count: result.stayedShallow?.length || 0,
      bias_count: result.biases?.length || 0,
      next_moves_count: result.nextMoves?.length || 0,
    });

    // === Stage 2: Supabase logging ===
    console.log('[push] attempting Supabase insert...');
    try {
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      const insertPayload = {
        visitor_id: visitorId || 'unknown',
        prompt,
        entry_text: text,
        entry_word_count: wordCount,
        response: result,
        depth_label: result.depthLabel,
        challenge_count: result.stayedShallow?.length || 0,
        prompt_version: PROMPT_VERSION,
      };
      console.log('[push] insert payload keys:', Object.keys(insertPayload));

      const { data: pushData, error: pushErr, status: pushStatus, statusText: pushStatusText } =
        await supabaseAdmin.from('pushes').insert(insertPayload).select();

      if (pushErr) {
        console.error('[push] !!! SUPABASE INSERT FAILED !!!');
        console.error('[push] HTTP status:', pushStatus, pushStatusText);
        console.error('[push] error.code:', pushErr.code);
        console.error('[push] error.message:', pushErr.message);
        console.error('[push] error.details:', pushErr.details);
        console.error('[push] error.hint:', pushErr.hint);
        console.error('[push] full error object:', JSON.stringify(pushErr, null, 2));
      } else {
        console.log('[push] insert returned data:', pushData ? `${pushData.length} row(s)` : 'no data');
        console.log('[push] insert succeeded (status:', pushStatus, ')');
      }

      const { error: sessErr, status: sessStatus } =
        await supabaseAdmin.from('sessions').upsert(
          { visitor_id: visitorId || 'unknown', last_seen_at: new Date().toISOString() },
          { onConflict: 'visitor_id', ignoreDuplicates: false }
        );
      if (sessErr) {
        console.error('[push] !!! SESSION UPSERT FAILED !!!');
        console.error('[push] code:', sessErr.code, '| message:', sessErr.message);
        console.error('[push] details:', sessErr.details, '| hint:', sessErr.hint);
      } else {
        console.log('[push] session upserted (status:', sessStatus, ')');
      }
    } catch (logErr) {
      console.error('[push] LOGGING BLOCK CRASHED with exception:');
      console.error('[push]', logErr.message);
      console.error('[push]', logErr.stack);
    }

    console.log('[push] === REQUEST END ===');
    return NextResponse.json(result);
  } catch (err) {
    console.error('[push] TOP-LEVEL ERROR:', err.message);
    console.error('[push]', err.stack);
    return NextResponse.json({ error: 'Something went wrong on our end.' }, { status: 500 });
  }
}
