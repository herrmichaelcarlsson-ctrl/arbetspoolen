/**
 * SveaTalang Stripe Webhook Simulation Script
 * 
 * This script runs locally using Node.js to trigger a mock Stripe webhook event (checkout.session.completed)
 * for a specific user ID to test the database update without needing the Stripe CLI.
 * 
 * Usage:
 *   node scripts/simulate-webhook.js <userId> [baseUrl]
 * 
 * Example:
 *   node scripts/simulate-webhook.js d3b07384-d113-4956-a4ed-f7fa9e28f331
 */

const http = require('http');

const userId = process.argv[2];
const baseUrl = process.argv[3] || 'http://localhost:3000';

if (!userId) {
  console.error('\x1b[31mError: Please provide a userId as the first argument.\x1b[0m');
  console.log('Usage: node scripts/simulate-webhook.js <userId> [baseUrl]');
  console.log('Example: node scripts/simulate-webhook.js d3b07384-d113-4956-a4ed-f7fa9e28f331');
  process.exit(1);
}

console.log(`\x1b[36mPreparing to simulate Stripe webhook locally...\x1b[0m`);
console.log(`Target User ID: \x1b[33m${userId}\x1b[0m`);
console.log(`Target URL: \x1b[33m${baseUrl}/api/stripe/webhook\x1b[0m\n`);

// Mock Stripe checkout.session.completed event
const mockEvent = {
  id: 'evt_mock_' + Math.random().toString(36).substr(2, 9),
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_' + Math.random().toString(36).substr(2, 15),
      object: 'checkout.session',
      amount_subtotal: 29900,
      amount_total: 29900,
      currency: 'sek',
      client_reference_id: userId,
      customer: 'cus_mock_customer',
      payment_status: 'paid',
      status: 'complete',
      metadata: {
        userId: userId
      }
    }
  }
};

const payload = JSON.stringify(mockEvent);

const url = new URL(`${baseUrl}/api/stripe/webhook`);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    // Bypass signature check in local dev environment
    'x-mock-webhook': 'true',
    'User-Agent': 'SveaTalang Webhook Simulator'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log(`HTTP Response Status Code: \x1b[32m${res.statusCode}\x1b[0m`);
    console.log('Response headers:');
    console.log(res.headers);
    console.log('\nResponse body:');
    try {
      const json = JSON.parse(responseData);
      console.log(JSON.stringify(json, null, 2));
      if (res.statusCode === 200) {
        console.log(`\n\x1b[32m✔ Success! The webhook was parsed successfully.\x1b[0m`);
        console.log(`If NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set, profile '${userId}' is now premium!`);
      } else {
        console.log(`\n\x1b[31m✖ Error: The webhook handler returned a non-200 status code.\x1b[0m`);
      }
    } catch {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('\x1b[31mConnection Error:\x1b[0m', error.message);
  console.log('\x1b[33mTip: Make sure your Next.js local server is running (e.g. at localhost:3000)\x1b[0m');
});

req.write(payload);
req.end();
