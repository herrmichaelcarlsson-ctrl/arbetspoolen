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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const product = session.metadata?.product;

    if (!userId) {
      console.error('No client_reference_id found:', session.id);
      return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 });
    }

    console.log(`Processing checkout for user ${userId}, product: ${product}`);

    const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseAdminUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase admin keys not configured' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    switch (product) {
      case 'employer_monthly':
        await supabaseAdmin.from('profiles')
          .update({ is_premium: true, stripe_customer_id: session.customer })
          .eq('id', userId);
        break;

      case 'candidate_boost':
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        await supabaseAdmin.from('profiles')
          .update({ profile_boost_ends_at: oneWeekFromNow.toISOString() })
          .eq('id', userId);
        break;

      case 'candidate_boost_month':
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        await supabaseAdmin.from('profiles')
          .update({ profile_boost_ends_at: oneMonthFromNow.toISOString() })
          .eq('id', userId);
        break;

      case 'verification':
        await supabaseAdmin.from('verification_requests').upsert({
          profile_id: userId,
          status: 'pending',
          stripe_payment_id: session.id
        }, { onConflict: 'profile_id' });
        break;

      case 'recruitment_package':
        await supabaseAdmin.from('profiles')
          .update({ is_premium_locked: true })
          .eq('id', userId);
        break;

      default:
        await supabaseAdmin.from('profiles')
          .update({ is_premium: true })
          .eq('id', userId);
    }

    console.log(`Successfully processed ${product || 'default'} for user ${userId}`);
  } else {
    console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
