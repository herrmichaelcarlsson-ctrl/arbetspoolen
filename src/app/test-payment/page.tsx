'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPaymentPage() {
  const [userId, setUserId] = useState('d3b07384-d113-4956-a4ed-f7fa9e28f331');
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);

  // Generate a random UUID for convenience
  const generateRandomUserId = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setUserId(uuid);
    setProfile(null);
    setProfileError(null);
  };

  // Fetch profile status directly from Supabase
  const checkProfileStatus = async (targetId = userId) => {
    if (!targetId || targetId.trim() === '') {
      setProfileError('Please enter a valid user ID first.');
      return;
    }
    
    setIsFetchingProfile(true);
    setProfileError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          setProfileError(`No profile found in Supabase for user ID: ${targetId}. In development, you may want to create a row in the "profiles" table first.`);
          setProfile(null);
        } else {
          setProfileError(`Supabase Error: ${error.message} (${error.code})`);
          setProfile(null);
        }
      } else {
        setProfile(data);
        setProfileError(null);
      }
    } catch (err: any) {
      setProfileError(`Failed to fetch profile: ${err.message}`);
      setProfile(null);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // Trigger Stripe Checkout route
  const handleInitiateCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutUrl(null);
    setCheckoutSessionId(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId, // Pass via custom header
        },
        body: JSON.stringify({ userId }), // Also pass via body to verify both work!
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setCheckoutUrl(data.url);
      setCheckoutSessionId(data.sessionId);
    } catch (err: any) {
      setCheckoutError(err.message || 'An error occurred while creating Stripe checkout session');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Simulate Webhook Locally
  const handleSimulateWebhook = async () => {
    setWebhookLoading(true);
    setWebhookStatus(null);
    setWebhookResponse(null);

    const mockEvent = {
      id: 'evt_mock_' + Math.random().toString(36).substr(2, 9),
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: checkoutSessionId || 'cs_test_' + Math.random().toString(36).substr(2, 15),
          object: 'checkout.session',
          amount_subtotal: 29900,
          amount_total: 29900,
          currency: 'sek',
          client_reference_id: userId,
          customer: 'cus_mock_customer',
          payment_status: 'paid',
          status: 'complete',
          metadata: {
            userId: userId,
          },
        },
      },
    };

    try {
      const response = await fetch('/api/stripe/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-webhook': 'true', // Flag to bypass signature verification in dev
        },
        body: JSON.stringify(mockEvent),
      });

      const data = await response.json();
      
      if (response.ok) {
        setWebhookStatus('success');
        setWebhookResponse(data);
        // Refresh profile status to show the updated premium flag
        await checkProfileStatus();
      } else {
        setWebhookStatus('error');
        setWebhookResponse(data);
      }
    } catch (err: any) {
      setWebhookStatus('error');
      setWebhookResponse({ error: err.message || 'Failed to simulate webhook' });
    } finally {
      setWebhookLoading(false);
    }
  };

  // Run initial check on load
  useEffect(() => {
    checkProfileStatus();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Stripe Integration Test Dashboard
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-zinc-500 dark:text-zinc-400">
            Verify and simulate your Monthly Subscription Stripe checkout flow.
          </p>
        </div>

        {/* Setup configuration tips */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md dark:bg-zinc-800 dark:border-blue-500">
          <h3 className="font-semibold text-blue-800 dark:text-blue-400">Environment Setup Reminder</h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-zinc-300">
            Make sure your server environment includes:
          </p>
          <ul className="mt-2 list-disc list-inside text-xs text-blue-700 dark:text-zinc-400 space-y-1 font-mono">
            <li>STRIPE_SECRET_KEY=sk_test_...</li>
            <li>NEXT_PUBLIC_SUPABASE_URL=https://...</li>
            <li>SUPABASE_SERVICE_ROLE_KEY=ey... (Required for the webhook to update user profile)</li>
          </ul>
        </div>

        {/* Section 1: User Profile Context */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-850 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            1. Select Target Profile (Employer Access)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Employer User ID (Supabase Auth ID)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-zinc-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
                  placeholder="UUID format"
                />
                <button
                  onClick={() => checkProfileStatus()}
                  disabled={isFetchingProfile}
                  className="inline-flex items-center px-4 py-2 border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700"
                >
                  {isFetchingProfile ? 'Checking...' : 'Check DB Status'}
                </button>
                <button
                  onClick={generateRandomUserId}
                  className="inline-flex items-center px-3 py-2 border border-dashed border-zinc-300 rounded-md text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  title="Generate Random UUID"
                >
                  Random ID
                </button>
              </div>
            </div>

            {/* Profile database status card */}
            <div className="mt-4 p-4 rounded-md bg-zinc-50 border border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-750">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Live Database Profile Info:</h3>
              
              {isFetchingProfile && (
                <div className="text-sm text-zinc-500 py-2">Querying profiles table in Supabase...</div>
              )}

              {profileError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-900/50">
                  {profileError}
                </div>
              )}

              {profile && !isFetchingProfile && (
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-400">ID:</span> <span className="text-zinc-800 dark:text-zinc-200">{profile.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Role:</span> <span className="text-zinc-800 dark:text-zinc-200">{profile.role || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Premium Status:</span>{' '}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      profile.is_premium
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {profile.is_premium ? '★ PREMIUM (is_premium = true)' : '☆ STANDARD (is_premium = false)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Created At:</span> <span className="text-zinc-800 dark:text-zinc-200">{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              {!profile && !profileError && !isFetchingProfile && (
                <div className="text-sm text-zinc-400 py-2 italic">
                  Press &quot;Check DB Status&quot; to fetch profile data from Supabase.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Create Checkout Session */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-850 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            2. Generate Stripe Checkout Session
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Simulate a checkout request. This calls <code>POST /api/stripe/checkout</code> with the target user ID to verify currency (SEK), subscription settings, and metadata.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleInitiateCheckout}
              disabled={checkoutLoading}
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {checkoutLoading ? 'Generating Session...' : 'Generate 299 kr/month Subscription Session'}
            </button>

            {checkoutError && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900/50 font-mono">
                Error: {checkoutError}
              </div>
            )}

            {checkoutSessionId && (
              <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-750 space-y-3">
                <div className="text-xs font-mono">
                  <span className="text-zinc-400">Session ID:</span> <span className="text-zinc-800 dark:text-zinc-200">{checkoutSessionId}</span>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={checkoutUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Launch Stripe checkout page ↗
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Note: Testing standard checkout requires a valid Stripe Test Secret Key. Standard redirects route to <code>/employer/directory</code>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Webhook Simulation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-850 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            3. Simulate Webhook Success (Local Dev Bypass)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Simulate a successful payment completed notification (<code>checkout.session.completed</code>) from Stripe.
            This calls <code>POST /api/stripe/webhook</code> bypassing signature verification in development.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleSimulateWebhook}
              disabled={webhookLoading}
              className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {webhookLoading ? 'Triggering webhook simulation...' : 'Trigger Webhook (Flip is_premium)'}
            </button>

            {webhookStatus === 'success' && (
              <div className="p-3 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900/50">
                <span className="font-semibold font-mono">✔ Webhook processed successfully!</span>
                <p className="mt-1 text-xs">Profiles table updated in Supabase. Check the DB Profile Info box above to see the updated flag.</p>
              </div>
            )}

            {webhookStatus === 'error' && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900/50">
                <span className="font-semibold font-mono">✖ Webhook simulation failed.</span>
                <p className="mt-1 text-xs">Verify your local dev server is running and your SUPABASE_SERVICE_ROLE_KEY is correctly set in environment.</p>
              </div>
            )}

            {webhookResponse && (
              <div className="p-3 rounded bg-zinc-900 text-zinc-50 text-xs font-mono overflow-auto max-h-48">
                <pre>{JSON.stringify(webhookResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
