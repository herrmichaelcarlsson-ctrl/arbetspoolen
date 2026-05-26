import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_compilation';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any, // safe, stable API version
});
