import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper: verify the requesting user is an admin
async function verifyAdmin(request: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  // Check admin status using the standard client since profiles is public read
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return null;
  return { userId: user.id };
}

// GET — Fetch all users with profiles and contact details
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    // Use admin client to bypass RLS and get all data
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*, profile_contact_details(*)')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get auth user emails from admin API
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    // Build a map of user id -> email
    const emailMap: Record<string, string> = {};
    if (!authError && authUsers?.users) {
      for (const u of authUsers.users) {
        emailMap[u.id] = u.email || '';
      }
    }

    // Merge email into profile data
    const enrichedProfiles = (profiles || []).map((p: any) => ({
      ...p,
      auth_email: emailMap[p.id] || 'unknown',
    }));

    // Compute stats
    const total = enrichedProfiles.length;
    const seekers = enrichedProfiles.filter((p: any) => p.role === 'job_seeker').length;
    const employers = enrichedProfiles.filter((p: any) => p.role === 'employer').length;
    const premiumCount = enrichedProfiles.filter((p: any) => p.is_premium).length;
    const admins = enrichedProfiles.filter((p: any) => p.is_admin).length;

    return NextResponse.json({
      stats: { total, seekers, employers, premiumCount, admins },
      users: enrichedProfiles,
    });
  } catch (error: any) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — Update a user's profile (toggle premium, admin, delete, etc.)
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { targetUserId, action, updates } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
    }

    if (action === 'toggle_premium') {
      const { data: current } = await supabaseAdmin
        .from('profiles')
        .select('is_premium')
        .eq('id', targetUserId)
        .single();

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_premium: !current?.is_premium })
        .eq('id', targetUserId);

      if (error) throw error;
      return NextResponse.json({ success: true, is_premium: !current?.is_premium });
    }

    if (action === 'toggle_admin') {
      // Prevent self-demotion
      if (targetUserId === admin.userId) {
        return NextResponse.json({ error: 'Cannot remove your own admin status' }, { status: 400 });
      }

      const { data: current } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', targetUserId)
        .single();

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: !current?.is_admin })
        .eq('id', targetUserId);

      if (error) throw error;
      return NextResponse.json({ success: true, is_admin: !current?.is_admin });
    }

    if (action === 'update_profile') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', targetUserId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_user') {
      // Prevent self-deletion
      if (targetUserId === admin.userId) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
      }

      // Delete from auth (cascade will delete profile)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
