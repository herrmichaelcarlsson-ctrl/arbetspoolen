import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(request: NextRequest) {
  try {
    const { profile_id, source } = await request.json();
    
    if (!profile_id) {
      return NextResponse.json({ error: 'Missing profile_id' }, { status: 400 });
    }

    // Get viewer info from headers (set by middleware or client)
    const headersList = await headers();
    const viewerId = headersList.get('x-user-id');
    const viewerEmail = headersList.get('x-user-email');

    // Log the view using the helper function
    const { error } = await supabaseAdmin.rpc('log_profile_view', {
      p_profile_id: profile_id,
      p_viewer_id: viewerId || null,
      p_viewer_email: viewerEmail || null,
      p_source: source || 'directory'
    });

    if (error) {
      console.error('Error logging profile view:', error);
      return NextResponse.json({ error: 'Failed to log view' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Profile view error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
