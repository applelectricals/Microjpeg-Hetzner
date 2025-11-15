import 'dotenv/config';
import { emailService } from './services/emailService';

// Test configuration
const TEST_EMAIL = 'applelectricals@gmail.com'; // ← Change to your email

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 MicroJPEG Email Service - Complete Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check environment
  console.log('📋 Step 1: Environment Check');
  console.log('─────────────────────────────────────');
  
  const checks = {
    apiKey: !!process.env.RESEND_API_KEY,
    fromEmail: !!process.env.FROM_EMAIL,
    supportEmail: !!process.env.SUPPORT_EMAIL,
    siteUrl: !!process.env.SITE_URL
  };

  console.log('   RESEND_API_KEY:', checks.apiKey ? '✅' : '❌');
  console.log('   FROM_EMAIL:', checks.fromEmail ? `✅ (${process.env.FROM_EMAIL})` : '❌');
  console.log('   SUPPORT_EMAIL:', checks.supportEmail ? `✅ (${process.env.SUPPORT_EMAIL})` : '⚠️  (will use default)');
  console.log('   SITE_URL:', checks.siteUrl ? `✅ (${process.env.SITE_URL})` : '⚠️  (will use default)');
  console.log('');

  if (!checks.apiKey) {
    console.error('❌ RESEND_API_KEY is required! Add it to server/.env');
    console.log('   Get your key from: https://resend.com/api-keys\n');
    process.exit(1);
  }

  if (!checks.fromEmail) {
    console.error('❌ FROM_EMAIL is required! Add it to server/.env');
    console.log('   Example: FROM_EMAIL=noreply@microjpeg.com\n');
    process.exit(1);
  }

  // Test 1: Subscription Confirmation
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 Test 1: Subscription Confirmation Email');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    console.log('   Sending to:', TEST_EMAIL);
    console.log('   Plan: Starter Monthly ($9)');
    console.log('   Processing...\n');

    const result1 = await emailService.sendSubscriptionConfirmation(
      TEST_EMAIL,
      'Prasun Kumar',
      'starter',
      'monthly',
      9
    );

    if (result1) {
      console.log('   ✅ SUCCESS - Subscription confirmation sent!\n');
    } else {
      console.log('   ❌ FAILED - Check errors above\n');
    }
  } catch (error: any) {
    console.error('   ❌ ERROR:', error.message, '\n');
  }

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Payment Confirmation
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 Test 2: One-Time Payment Confirmation Email');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    console.log('   Sending to:', TEST_EMAIL);
    console.log('   Plan: Pro Yearly ($149)');
    console.log('   Duration: 365 days');
    console.log('   Processing...\n');

    const result2 = await emailService.sendPaymentConfirmation(
      TEST_EMAIL,
      'Prasun Kumar',
      'pro',
      149,
      365
    );

    if (result2) {
      console.log('   ✅ SUCCESS - Payment confirmation sent!\n');
    } else {
      console.log('   ❌ FAILED - Check errors above\n');
    }
  } catch (error: any) {
    console.error('   ❌ ERROR:', error.message, '\n');
  }

  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Payment Failure
  console.log('═══════════════════════════════════════════════════════');
  console.log('📧 Test 3: Payment Failure Notification');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    console.log('   Sending to:', TEST_EMAIL);
    console.log('   Reason: Card declined');
    console.log('   Processing...\n');

    const result3 = await emailService.sendPaymentFailure(
      TEST_EMAIL,
      'Prasun Kumar',
      'Your payment card was declined. Please update your payment method and try again.'
    );

    if (result3) {
      console.log('   ✅ SUCCESS - Payment failure notification sent!\n');
    } else {
      console.log('   ❌ FAILED - Check errors above\n');
    }
  } catch (error: any) {
    console.error('   ❌ ERROR:', error.message, '\n');
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('   ✅ All tests completed!');
  console.log('   📬 Check your inbox:', TEST_EMAIL);
  console.log('   📧 You should receive 3 emails:\n');
  console.log('      1. Subscription Confirmation (Starter Monthly)');
  console.log('      2. Payment Confirmation (Pro Yearly)');
  console.log('      3. Payment Failure Notice\n');
  console.log('   💡 Tips:');
  console.log('      • Check spam folder if emails not in inbox');
  console.log('      • View sent emails: https://resend.com/emails');
  console.log('      • First emails may take 1-2 minutes\n');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run all tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
