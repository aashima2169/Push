// app/api/feedback/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase.js';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { pushId, rating } = await req.json();

    if (!pushId || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('pushes')
      .update({ feedback: rating })
      .eq('id', pushId);

    if (error) {
      console.error('[feedback] update failed:', error.message);
      return NextResponse.json({ ok: false });
    }

    console.log('[feedback] saved:', rating, 'for push:', pushId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[feedback] error:', e.message);
    return NextResponse.json({ ok: false });
  }
}
