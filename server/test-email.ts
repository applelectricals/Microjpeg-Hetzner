import 'dotenv/config'; // MUST BE FIRST LINE - loads .env file
import { emailService } from './services/emailService';

async function testEmail() {
  console.log('📧 Testing Resend Email Service\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Debug: Show what env variables are loaded
  console.log('🔍 Environment Variables Check:');
  console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? `✅ Loaded (${process.env.RESEND_API_KEY.substring(0, 15)}...)` : '❌ NOT FOUND');
  console.log('   FROM_EMAIL:', process.env.FROM_EMAIL || '❌ NOT FOUND');
  console.log('   SUPPORT_EMAIL:', process.env.SUPPORT_EMAIL || '(using default)');
  console.log('   SITE_URL:', process.env.SITE_URL || '(using default)');
  console.log('');
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERROR: RESEND_API_KEY not found!\n');
    console.log('Make sure:');
    console.log('1. File server/.env exists');
    console.log('2. It contains: RESEND_API_KEY=re_your-key-here');
    console.log('3. You\'re running from server/ directory\n');
    console.log('Get your API key from: https://resend.com/api-keys\n');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════\n');
  console.log('📤 Sending test subscription confirmation email...\n');
  
  try {
    const success = await emailService.sendSubscriptionConfirmation(
      'applelectricals@gmail.com',
      'Prasun',
      'starter',
      'monthly',
      9
    );

    console.log('\n═══════════════════════════════════════════\n');
    
    if (success) {
      console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
      console.log('📬 Check your inbox: applelectricals@gmail.com');
      console.log('📧 Subject: 🎉 Welcome to MicroJPEG Starter - Subscription Confirmed!');
      console.log('📨 From: MicroJPEG <' + (process.env.FROM_EMAIL || 'noreply@microjpeg.com') + '>');
      console.log('');
      console.log('💡 Tips:');
      console.log('   • Check spam folder if not in inbox');
      console.log('   • Verify in Resend dashboard: https://resend.com/emails');
      console.log('   • First emails may take 1-2 minutes to arrive\n');
    } else {
      console.log('❌ EMAIL FAILED TO SEND\n');
      console.log('Check the error messages above for details.\n');
      console.log('Common issues:');
      console.log('   • Domain not verified in Resend');
      console.log('   • Invalid API key');
      console.log('   • FROM_EMAIL domain not added to Resend\n');
    }
    
  } catch (error: any) {
    console.log('\n═══════════════════════════════════════════\n');
    console.error('💥 ERROR:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response, null, 2));
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check API key is correct in .env');
    console.log('   2. Verify domain in Resend dashboard');
    console.log('   3. Check FROM_EMAIL uses verified domain');
    console.log('   4. Visit https://resend.com/domains\n');
  }
}

console.log('🚀 MicroJPEG Email Service Test\n');
testEmail();
