import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

// Product price configurations (in öre/SEK cents)
const PRODUCTS = {
  employer_monthly: {
    name: 'Monthly Employer Access',
    description: 'Access candidate contact details and premium recruitment features.',
    amount: 29900, // 299 SEK
    interval: 'month' as const,
    product_key: 'employer_monthly'
  },
  candidate_boost: {
    name: 'Profile Boost - 1 Week',
    description: 'Your profile appears at the top of search results for 7 days.',
    amount: 4900, // 49 SEK
    interval: null, // one-time
    product_key: 'candidate_boost'
  },
  candidate_boost_month: {
    name: 'Profile Boost - 1 Month',
    description: 'Your profile appears at the top of search results for 30 days.',
    amount: 14900, // 149 SEK
    interval: null,
    product_key: 'candidate_boost_month'
  },
  verification: {
    name: 'Verified Professional Badge',
    description: 'Manual verification of your certificates against official registers.',
    amount: 9900, // 99 SEK
    interval: null,
    product_key: 'verification'
  },
  recruitment_package: {
    name: 'Recruitment Package - 5 Candidates',
    description: 'We hand-pick 5 matching candidates for your job position.',
    amount: 299900, // 2999 SEK
    interval: null,
    product_key: 'recruitment_package'
  }
};

type ProductKey = keyof typeof PRODUCTS;

async function getUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    if (user) return user.id;
  }
  
  return request.headers.get('x-user-id') || null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product } = body as { product: ProductKey };

    if (!product || !PRODUCTS[product]) {
      return NextResponse.json({ 
        error: 'Invalid product. Available: ' + Object.keys(PRODUCTS).join(', ')
      }, { status: 400 });
    }

    const productConfig = PRODUCTS[product];
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    
    const lineItem = {
      price_data: {
        currency: 'sek',
        product_data: {
          name: productConfig.name,
          description: productConfig.description,
        },
        unit_amount: productConfig.amount,
        ...(productConfig.interval ? { recurring: { interval: productConfig.interval } } : {}),
      },
      quantity: 1,
    };

    // Determine redirect URLs based on product type
    let successUrl = `${origin}/seeker/dashboard?payment_success=true`;
    let cancelUrl = `${origin}/seeker/dashboard?payment_cancelled=true`;
    
    if (product.startsWith('employer')) {
      successUrl = `${origin}/employer/directory?session_id={CHECKOUT_SESSION_ID}&payment_success=true`;
      cancelUrl = `${origin}/employer/directory?payment_cancelled=true`;
    } else if (product === 'recruitment_package') {
      successUrl = `${origin}/employer/directory?payment_success=true&package=true`;
      cancelUrl = `${origin}/employer/directory?payment_cancelled=true`;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: productConfig.interval ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [lineItem],
      client_reference_id: userId,
      metadata: {
        userId: userId,
        product: productConfig.product_key,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error('Failed to retrieve checkout URL');
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
