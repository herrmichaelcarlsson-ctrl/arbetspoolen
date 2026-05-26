import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const isMock = request.headers.get('x-mock-webhook') === 'true' && process.env.NODE_ENV !== 'production';

  let event: any;

  if (isMock) {
    console.log('Skipping Stripe Webhook signature verification for local mock simulation.');
    try {
      event = JSON.parse(body);
    } catch (err: any) {
      console.error('Mock payload parsing failed:', err);
      return NextResponse.json({ error: `Invalid JSON body: ${err.message}` }, { status: 400 });
    }
  } else {
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET environment variable is missing.');
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  }

  // Handle the target checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No client_reference_id found in the checkout session:', session.id);
      return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 });
    }

    console.log(`Processing successful checkout session ${session.id} for user ${userId}`);

    // Create Supabase Admin client to bypass RLS and update profiles
    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseAdminUrl || !supabaseServiceKey) {
      console.error('Supabase administrative keys are missing in the server environment (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
      return NextResponse.json({ error: 'Supabase admin keys not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Update the is_premium status of the employer profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId)
      .select();

    if (error) {
      console.error(`Failed to update is_premium for user ${userId} in profiles table:`, error);
      return NextResponse.json({ error: `Supabase update error: ${error.message}` }, { status: 500 });
    }

    console.log(`Successfully updated profile premium status for user ${userId}:`, data);
  } else {
    console.log(`Unhandled Stripe Webhook event received: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
