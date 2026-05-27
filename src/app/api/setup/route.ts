import { NextResponse } from 'next/server';

// One-time setup endpoint: run SQL migrations and diagnostics via Supabase Management API
// Visit http://localhost:3000/api/setup once to apply all fixes
export async function GET() {
  const results: string[] = [];
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Helper to run raw SQL via Supabase's PostgREST rpc or direct pg
  async function runSQL(sql: string, label: string) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      // This won't work via REST, so we use the management API approach instead
      return false;
    } catch {
      return false;
    }
  }

  try {
    // Use supabaseAdmin to do what we can
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Try to add avatar_url column by doing a test select
    // If it fails, the column doesn't exist and user needs to run SQL manually
    const { error: colTest } = await supabaseAdmin
      .from('profiles')
      .select('avatar_url')
      .limit(1);
    
    if (colTest) {
      results.push(`❌ avatar_url column MISSING - ${colTest.message}`);
      results.push("→ Run this SQL in Supabase Dashboard SQL Editor:");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;");
    } else {
      results.push("✅ avatar_url column: exists");
    }

    // 2. Check is_admin column
    const { error: adminColTest } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .limit(1);
    
    if (adminColTest) {
      results.push(`❌ is_admin column MISSING - ${adminColTest.message}`);
      results.push("→ Run this SQL in Supabase Dashboard SQL Editor:");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;");
    } else {
      results.push("✅ is_admin column: exists");
    }

    // 3. Check company columns
    const { error: compColTest } = await supabaseAdmin
      .from('profiles')
      .select('company_name')
      .limit(1);
    
    if (compColTest) {
      results.push(`❌ company columns MISSING`);
      results.push("→ Run this SQL in Supabase Dashboard SQL Editor:");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_presentation TEXT;");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_website TEXT;");
      results.push("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_is_public BOOLEAN NOT NULL DEFAULT TRUE;");
    } else {
      results.push("✅ company columns: exist");
    }

    // 4. List all users
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authErr) {
      results.push(`❌ Auth admin access: ERROR - ${authErr.message}`);
    } else {
      results.push(`✅ Auth admin access: OK`);
      results.push(`📊 Total auth users: ${authUsers?.users?.length || 0}`);
    }

    const users = authUsers?.users || [];
    const userList = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      email_confirmed: !!u.email_confirmed_at,
      created: u.created_at
    }));

    // 5. Grant admin to herrmichael
    const targetUser = users.find(
      (u: any) => u.email?.toLowerCase() === 'herrmichael.carlsson@outlook.com'
    );

    if (targetUser) {
      // First confirm the user's email if not confirmed
      if (!targetUser.email_confirmed_at) {
        const { error: confirmErr } = await supabaseAdmin.auth.admin.updateUserById(
          targetUser.id,
          { email_confirm: true }
        );
        if (confirmErr) {
          results.push(`⚠️ Email confirm for owner: ERROR - ${confirmErr.message}`);
        } else {
          results.push(`✅ Email confirmed for ${targetUser.email}`);
        }
      }

      const { error: adminErr } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true, role: 'employer' })
        .eq('id', targetUser.id);
      
      if (adminErr) {
        results.push(`❌ Admin grant: ERROR - ${adminErr.message}`);
      } else {
        results.push(`✅ Admin granted to ${targetUser.email}`);
      }
    } else {
      results.push("⚠️ Owner user not found in auth.users");
    }

    // 6. Auto-confirm ALL unconfirmed users
    const unconfirmed = users.filter((u: any) => !u.email_confirmed_at);
    if (unconfirmed.length > 0) {
      results.push(`⚠️ Found ${unconfirmed.length} unconfirmed user(s), confirming them...`);
      for (const u of unconfirmed) {
        const { error: cErr } = await supabaseAdmin.auth.admin.updateUserById(
          u.id,
          { email_confirm: true }
        );
        if (!cErr) {
          results.push(`  ✅ Confirmed: ${u.email}`);
        } else {
          results.push(`  ❌ Failed to confirm ${u.email}: ${cErr.message}`);
        }
      }
    } else {
      results.push("✅ All users are email-confirmed");
    }

    // 7. Check if profiles exist for all auth users
    for (const u of users) {
      const { data: prof, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('id, role, is_admin')
        .eq('id', u.id)
        .maybeSingle();
      
      if (!prof) {
        results.push(`⚠️ No profile for ${u.email} - creating one...`);
        const role = u.raw_user_meta_data?.role || 'job_seeker';
        const { error: insErr } = await supabaseAdmin.from('profiles').insert({
          id: u.id,
          role: role,
          experience_years: 0,
          is_premium: false,
          is_premium_locked: true,
        });
        if (insErr) {
          results.push(`  ❌ Profile creation failed: ${insErr.message}`);
        } else {
          results.push(`  ✅ Profile created for ${u.email} as ${role}`);
        }
      } else {
        results.push(`✅ Profile exists: ${u.email} (role=${prof.role}, admin=${prof.is_admin})`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      users: userList,
      instructions: [
        "If columns are MISSING above, go to Supabase Dashboard → SQL Editor and run the provided SQL.",
        "To permanently disable email confirmation: Supabase Dashboard → Authentication → Providers → Email → Disable 'Confirm email'",
      ]
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      results,
      error: error.message 
    }, { status: 500 });
  }
}
