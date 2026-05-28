import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get weekly view count using the helper function
    const { data: weeklyCount, error: weeklyError } = await supabaseAdmin.rpc(
      'get_weekly_view_count',
      { p_profile_id: userId }
    );

    if (weeklyError) {
      console.error('Error getting weekly views:', weeklyError);
      return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }

    // Get detailed view history (for premium)
    const { data: recentViews, error: recentError } = await supabaseAdmin
      .from('profile_views')
      .select('viewed_at, source, viewer_email')
      .eq('profile_id', userId)
      .gte('viewed_at', `date_trunc('week', NOW())`)
      .order('viewed_at', { ascending: false })
      .limit(20);

    if (recentError) {
      console.error('Error getting recent views:', recentError);
    }

    return NextResponse.json({
      weekly_count: weeklyCount || 0,
      recent_views: recentViews || []
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
