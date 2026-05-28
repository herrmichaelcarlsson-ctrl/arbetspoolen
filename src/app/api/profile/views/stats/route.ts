import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ weekly_count: 0, recent_views: [] });
    }

    // Get weekly view count using the helper function
    const { data: weeklyCount, error: weeklyError } = await supabase.rpc(
      'get_weekly_view_count',
      { p_profile_id: userId }
    );

    if (weeklyError) {
      console.error('Error getting weekly views:', weeklyError);
      return NextResponse.json({ weekly_count: 0, recent_views: [] });
    }

    return NextResponse.json({
      weekly_count: weeklyCount || 0,
      recent_views: []
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ weekly_count: 0, recent_views: [] });
  }
}
