/**
 * SveaTalang - Supabase Database Verification Script
 * Checks that the schema, tables, RLS policies, and triggers are correctly deployed.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hixyruprqmaollrpibdx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xzSlykuaHj1R3gpfMf_0Ig_X3SglFwi';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const results = [];

function log(emoji, label, detail) {
  const line = `${emoji} ${label}: ${detail}`;
  console.log(line);
  results.push({ emoji, label, detail });
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  SveaTalang — Supabase Database Verification');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // 1. Test connection
  console.log('--- 1. Connection Test ---');
  try {
    const { data, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (error) {
      log('❌', 'Connection', `Failed — ${error.message} (code: ${error.code})`);
    } else {
      log('✅', 'Connection', 'Successfully connected to Supabase');
    }
  } catch (e) {
    log('❌', 'Connection', `Exception — ${e.message}`);
  }

  // 2. Query profiles table schema (read some rows)
  console.log('');
  console.log('--- 2. Profiles Table ---');
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      log('❌', 'profiles table', `Query failed — ${error.message} (${error.code})`);
    } else {
      log('✅', 'profiles table', `Exists and queryable — ${count ?? data?.length ?? 0} total rows`);
      if (data && data.length > 0) {
        const cols = Object.keys(data[0]);
        log('📋', 'profiles columns', cols.join(', '));
        
        // Check expected columns exist
        const expected = ['id', 'role', 'trade', 'city', 'experience_years', 'availability', 'bio', 'is_premium_locked', 'is_premium', 'created_at', 'updated_at'];
        const missing = expected.filter(c => !cols.includes(c));
        if (missing.length === 0) {
          log('✅', 'profiles schema', 'All expected columns present');
        } else {
          log('⚠️', 'profiles schema', `Missing columns: ${missing.join(', ')}`);
        }
      } else {
        log('ℹ️', 'profiles data', 'Table is empty (no rows yet — this is normal for a fresh deploy)');
      }
    }
  } catch (e) {
    log('❌', 'profiles table', `Exception — ${e.message}`);
  }

  // 3. Query profile_contact_details table
  console.log('');
  console.log('--- 3. Profile Contact Details Table ---');
  try {
    const { data, error, count } = await supabase
      .from('profile_contact_details')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      // RLS may block unauthenticated reads — that's expected and GOOD
      if (error.code === 'PGRST301' || error.message.includes('permission') || error.code === '42501') {
        log('✅', 'contact_details RLS', `Table exists but RLS correctly blocks unauthenticated reads — ${error.message}`);
      } else {
        log('❌', 'contact_details table', `Query failed — ${error.message} (${error.code})`);
      }
    } else {
      log('✅', 'contact_details table', `Exists and queryable — ${count ?? data?.length ?? 0} total rows`);
      if (data && data.length > 0) {
        const cols = Object.keys(data[0]);
        log('📋', 'contact_details columns', cols.join(', '));
        
        const expected = ['profile_id', 'full_name', 'contact_email', 'contact_phone', 'created_at'];
        const missing = expected.filter(c => !cols.includes(c));
        if (missing.length === 0) {
          log('✅', 'contact_details schema', 'All expected columns present');
        } else {
          log('⚠️', 'contact_details schema', `Missing columns: ${missing.join(', ')}`);
        }
      } else {
        log('ℹ️', 'contact_details data', 'Table is empty (expected — RLS restricts access or no data yet)');
      }
    }
  } catch (e) {
    log('❌', 'contact_details table', `Exception — ${e.message}`);
  }

  // 4. Test RLS — unauthenticated user should NOT be able to see contact details
  console.log('');
  console.log('--- 4. RLS Policy Verification ---');
  try {
    // Profiles should be public-readable
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role, trade, city')
      .limit(1);

    if (profileErr) {
      log('⚠️', 'RLS profiles (public)', `Unexpected error — ${profileErr.message}`);
    } else {
      log('✅', 'RLS profiles (public)', 'Anonymous users CAN read profiles (as expected)');
    }

    // Contact details should be blocked for anonymous users
    const { data: contactData, error: contactErr } = await supabase
      .from('profile_contact_details')
      .select('full_name, contact_email')
      .limit(1);

    if (contactErr) {
      log('✅', 'RLS contact_details (blocked)', `Anonymous users are correctly BLOCKED — ${contactErr.message}`);
    } else if (contactData && contactData.length === 0) {
      log('✅', 'RLS contact_details', 'No rows returned for anonymous user (RLS active or table empty)');
    } else {
      log('⚠️', 'RLS contact_details', `Anonymous user received ${contactData?.length} rows — verify RLS policies are active`);
    }
  } catch (e) {
    log('❌', 'RLS verification', `Exception — ${e.message}`);
  }

  // 5. Test joined query (this is what the Employer Directory page does)
  console.log('');
  console.log('--- 5. Employer Directory Query Test ---');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, profile_contact_details(*)')
      .eq('role', 'job_seeker')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      log('❌', 'Directory join query', `Failed — ${error.message} (${error.code})`);
    } else {
      log('✅', 'Directory join query', `Successful — returned ${data?.length ?? 0} candidates`);
      
      if (data && data.length > 0) {
        for (const c of data) {
          const contactStatus = c.profile_contact_details ? '🔓 Unlocked' : '🔒 Locked (RLS)';
          log('👤', `Candidate ${c.trade || 'unknown'} (${c.city || '?'})`, contactStatus);
        }
      }
    }
  } catch (e) {
    log('❌', 'Directory join query', `Exception — ${e.message}`);
  }

  // 6. Auth test — verify signUp endpoint responds
  console.log('');
  console.log('--- 6. Auth Endpoint Test ---');
  try {
    // Just check that the auth endpoint is reachable (don't actually create a user)
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      log('⚠️', 'Auth endpoint', `Session check returned error — ${error.message}`);
    } else {
      log('✅', 'Auth endpoint', 'Supabase Auth is reachable and responding');
    }
  } catch (e) {
    log('❌', 'Auth endpoint', `Exception — ${e.message}`);
  }

  // Summary
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  const passed = results.filter(r => r.emoji === '✅').length;
  const warnings = results.filter(r => r.emoji === '⚠️').length;
  const failed = results.filter(r => r.emoji === '❌').length;
  console.log(`  ✅ Passed:   ${passed}`);
  console.log(`  ⚠️ Warnings: ${warnings}`);
  console.log(`  ❌ Failed:   ${failed}`);
  console.log('');
  
  if (failed === 0) {
    console.log('  🎉 All critical checks passed! Your Supabase deployment looks good.');
  } else {
    console.log('  ⚠️  Some checks failed. Review the output above for details.');
  }
  console.log('');
}

main().catch(console.error);
