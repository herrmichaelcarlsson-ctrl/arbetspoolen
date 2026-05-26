import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;

    // 1. Try to authenticate via Authorization Bearer token (standard Supabase JWT)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        userId = user.id;
      }
    }

    // 2. Try to authenticate via a custom headers fallback (useful for custom testing/mocking)
    if (!userId) {
      userId = request.headers.get('x-user-id') || request.headers.get('X-User-Id');
    }

    // 3. Try to extract userId from the JSON request body
    if (!userId) {
      try {
        // Clone the request so we don't consume the stream prematurely
        const body = await request.clone().json();
        if (body && typeof body === 'object' && body.userId) {
          userId = String(body.userId);
        }
      } catch {
        // Body was either not JSON or empty; ignore and continue
      }
    }

    // If still no user is identified, reject the request
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: User authentication failed. Please provide a valid Authorization header, x-user-id header, or a JSON body with { "userId": "..." }.' },
        { status: 401 }
      );
    }

    // Determine the base URL dynamically from request, fallback to environment
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    
    // Configurable success and cancel redirect URLs pointing back to /employer/directory
    const successUrl = `${origin}/employer/directory?session_id={CHECKOUT_SESSION_ID}&payment_success=true`;
    const cancelUrl = `${origin}/employer/directory?payment_cancelled=true`;

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            product_data: {
              name: 'Monthly Employer Access',
              description: 'Access candidate contact details and premium recruitment features on SveaTalang.',
            },
            unit_amount: 29900, // 299.00 SEK (29900 öre)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      metadata: {
        userId: userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error('Failed to retrieve checkout URL from Stripe session.');
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}
