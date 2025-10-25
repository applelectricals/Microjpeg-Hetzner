import fetch from 'node-fetch';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data: any = await response.json();
  return data.access_token;
}

async function createProduct() {
  const token = await getAccessToken();

  const productData = {
    name: 'MicroJPEG Image Compression Service',
    description: 'Professional image compression and conversion service',
    type: 'SERVICE',
    category: 'SOFTWARE',
    image_url: 'https://microjpeg.com/logo.png',
    home_url: 'https://microjpeg.com'
  };

  const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `product-${Date.now()}`
    },
    body: JSON.stringify(productData),
  });

  const product: any = await response.json();
  
  if (response.ok) {
    console.log('✅ Product created:', product.id);
    return product.id;
  } else {
    console.error('❌ Product creation failed:', product);
    throw new Error('Failed to create product');
  }
}

async function createPlan(productId: string, name: string, description: string, price: string, interval: 'MONTH' | 'YEAR') {
  const token = await getAccessToken();

  const planData = {
    product_id: productId,
    name,
    description,
    status: 'ACTIVE',
    billing_cycles: [{
      frequency: {
        interval_unit: interval,
        interval_count: 1
      },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: {
        fixed_price: {
          value: price,
          currency_code: 'USD'
        }
      }
    }],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3
    }
  };

  const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `plan-${Date.now()}-${Math.random()}`
    },
    body: JSON.stringify(planData),
  });

  const plan: any = await response.json();
  
  if (response.ok) {
    console.log(`✅ Created: ${name} - ${plan.id}`);
    return plan.id;
  } else {
    console.error(`❌ Failed: ${name}`, plan);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating PayPal Subscription Plans...');
  console.log(`📍 Mode: ${process.env.PAYPAL_MODE}\n`);

  // Step 1: Create Product
  const productId = await createProduct();
  
  // Step 2: Create Plans
  const plans = {
    STARTER_MONTHLY: await createPlan(productId, 'MicroJPEG Starter Monthly', 'Perfect for freelancers - 3,000 operations/month', '9.00', 'MONTH'),
    STARTER_YEARLY: await createPlan(productId, 'MicroJPEG Starter Yearly', 'Perfect for freelancers - Save 27%', '79.00', 'YEAR'),
    PRO_MONTHLY: await createPlan(productId, 'MicroJPEG Pro Monthly', 'For agencies - 15,000 operations/month', '19.00', 'MONTH'),
    PRO_YEARLY: await createPlan(productId, 'MicroJPEG Pro Yearly', 'For agencies - Save 35%', '149.00', 'YEAR'),
    BUSINESS_MONTHLY: await createPlan(productId, 'MicroJPEG Business Monthly', 'For enterprises - 50,000 operations/month', '49.00', 'MONTH'),
    BUSINESS_YEARLY: await createPlan(productId, 'MicroJPEG Business Yearly', 'For enterprises - Save 32%', '399.00', 'YEAR'),
  };

  console.log('\n✅ All plans created! Add these to Coolify env variables:\n');
  console.log('='.repeat(60));
  console.log(`PAYPAL_PLAN_STARTER_MONTHLY=${plans.STARTER_MONTHLY}`);
  console.log(`PAYPAL_PLAN_STARTER_YEARLY=${plans.STARTER_YEARLY}`);
  console.log(`PAYPAL_PLAN_PRO_MONTHLY=${plans.PRO_MONTHLY}`);
  console.log(`PAYPAL_PLAN_PRO_YEARLY=${plans.PRO_YEARLY}`);
  console.log(`PAYPAL_PLAN_BUSINESS_MONTHLY=${plans.BUSINESS_MONTHLY}`);
  console.log(`PAYPAL_PLAN_BUSINESS_YEARLY=${plans.BUSINESS_YEARLY}`);
  console.log('='.repeat(60));
}

main().catch(console.error);