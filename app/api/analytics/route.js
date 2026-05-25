// app/api/analytics/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase.js';

export const runtime = 'nodejs';

export async function GET(req) {
  const key = req.headers.get('x-dashboard-key');
  if (!key || key !== process.env.DASHBOARD_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Total entries
    const { count: totalEntries } = await supabaseAdmin
      .from('push_events')
      .select('*', { count: 'exact', head: true });

    // All entries for aggregation
    const { data: allEntries } = await supabaseAdmin
      .from('push_events')
      .select('visitor_id, depth_label, feedback, entry_word_count, prompt, created_at, prompt_version')
      .order('created_at', { ascending: false });

    if (!allEntries) {
      return NextResponse.json({ error: 'No data' }, { status: 500 });
    }

    // Unique users
    const uniqueUsers = new Set(allEntries.map(e => e.visitor_id)).size;

    // Return users (visitor_ids with more than 1 entry)
    const countByUser = {};
    allEntries.forEach(e => {
      countByUser[e.visitor_id] = (countByUser[e.visitor_id] || 0) + 1;
    });
    const returnUsers = Object.values(countByUser).filter(c => c > 1).length;

    // Depth distribution
    const depthCounts = { Surface: 0, Probing: 0, 'Going deeper': 0 };
    allEntries.forEach(e => {
      if (e.depth_label && depthCounts[e.depth_label] !== undefined) {
        depthCounts[e.depth_label]++;
      }
    });

    // Feedback distribution
    const feedbackCounts = { hit: 0, easy: 0, off: 0, none: 0 };
    allEntries.forEach(e => {
      if (e.feedback && feedbackCounts[e.feedback] !== undefined) {
        feedbackCounts[e.feedback]++;
      } else {
        feedbackCounts.none++;
      }
    });

    // Average word count
    const wordCounts = allEntries.filter(e => e.entry_word_count).map(e => e.entry_word_count);
    const avgWordCount = wordCounts.length
      ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
      : 0;

    // Entries by day (last 14 days)
    const now = new Date();
    const dayCounts = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayCounts[key] = 0;
    }
    allEntries.forEach(e => {
      if (e.created_at) {
        const day = e.created_at.split('T')[0];
        if (dayCounts[day] !== undefined) dayCounts[day]++;
      }
    });

    // Recent 10 entries
    const recent = allEntries.slice(0, 10).map(e => ({
      date: e.created_at ? e.created_at.split('T')[0] : 'unknown',
      topic: e.prompt || '(no topic)',
      depth: e.depth_label || 'unknown',
      feedback: e.feedback || null,
      words: e.entry_word_count || 0,
      version: e.prompt_version || 'unknown',
    }));

    // Prompt version breakdown
    const versionCounts = {};
    allEntries.forEach(e => {
      const v = e.prompt_version || 'unknown';
      versionCounts[v] = (versionCounts[v] || 0) + 1;
    });

    return NextResponse.json({
      totalEntries: totalEntries || 0,
      uniqueUsers,
      returnUsers,
      returnRate: uniqueUsers > 0 ? Math.round((returnUsers / uniqueUsers) * 100) : 0,
      avgWordCount,
      depthCounts,
      feedbackCounts,
      dailyCounts: Object.entries(dayCounts).map(([date, count]) => ({ date, count })),
      recent,
      versionCounts,
    });
  } catch (e) {
    console.error('[analytics] error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
