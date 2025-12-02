/**
 * Email Service - Resend Integration
 * 
 * Handles all transactional emails:
 * - Payment confirmation
 * - Subscription activation
 * - Subscription renewal reminders
 * - Subscription cancelled
 * - Payment failed
 * - Welcome email
 * 
 * ENVIRONMENT VARIABLES:
 * - RESEND_API_KEY
 * - FROM_EMAIL (default: noreply@microjpeg.com)
 */

import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'MicroJPEG <noreply@microjpeg.com>';
const SUPPORT_EMAIL = 'support@microjpeg.com';

// ============================================================================
// TYPES
// ============================================================================

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SubscriptionDetails {
  tier: string;
  cycle: 'monthly' | 'yearly';
  amount: number;
  currency: 'INR' | 'USD';
  startDate: Date;
  endDate: Date;
  subscriptionId?: string;
  paymentId?: string;
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

function getBaseTemplate(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MicroJPEG</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 32px; }
    .footer { background: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }
    .button { display: inline-block; background: #14b8a6; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .card { background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
    .detail-label { color: #71717a; }
    .detail-value { font-weight: 600; color: #18181b; }
    .success-icon { font-size: 48px; margin-bottom: 16px; }
    .highlight { color: #14b8a6; font-weight: 600; }
  </style>
</head>
<body>
  <span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>
  <div class="container">
    <div class="header">
      <h1>🖼️ MicroJPEG</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MicroJPEG. All rights reserved.</p>
      <p>Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p><a href="https://microjpeg.com/legal/terms">Terms</a> • <a href="https://microjpeg.com/legal/privacy">Privacy</a> • <a href="https://microjpeg.com/dashboard">Manage Subscription</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

/**
 * Send payment/subscription confirmation email
 */
export async function sendPaymentConfirmation(
  email: string,
  name: string,
  subscription: SubscriptionDetails
): Promise<EmailResult> {
  const currencySymbol = subscription.currency === 'INR' ? '₹' : '$';
  const tierName = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);
  const cycleName = subscription.cycle === 'yearly' ? 'Annual' : 'Monthly';

  const content = `
    <div style="text-align: center;">
      <div class="success-icon">✅</div>
      <h2 style="margin: 0 0 8px 0;">Payment Successful!</h2>
      <p style="color: #71717a; margin: 0;">Welcome to MicroJPEG ${tierName}</p>
    </div>

    <div class="card">
      <h3 style="margin: 0 0 16px 0;">Subscription Details</h3>
      <div class="detail-row">
        <span class="detail-label">Plan</span>
        <span class="detail-value">${tierName} (${cycleName})</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Paid</span>
        <span class="detail-value">${currencySymbol}${subscription.amount.toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Billing Cycle</span>
        <span class="detail-value">${cycleName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Start Date</span>
        <span class="detail-value">${subscription.startDate.toLocaleDateString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Next Billing</span>
        <span class="detail-value">${subscription.endDate.toLocaleDateString()}</span>
      </div>
      ${subscription.paymentId ? `
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">Transaction ID</span>
        <span class="detail-value" style="font-size: 12px;">${subscription.paymentId}</span>
      </div>
      ` : ''}
    </div>

    <h3>🚀 What's Next?</h3>
    <ul style="color: #52525b; line-height: 1.8;">
      <li>Your ${tierName} features are now active</li>
      <li>Compress images up to ${subscription.tier === 'business' ? '200MB' : subscription.tier === 'pro' ? '150MB' : '75MB'}</li>
      <li>Enjoy unlimited compressions with priority processing</li>
      <li>Access all formats including RAW files</li>
    </ul>

    <div style="text-align: center;">
      <a href="https://microjpeg.com/compress" class="button">Start Compressing →</a>
    </div>

    <p style="color: #71717a; font-size: 14px;">
      Your subscription will automatically renew on ${subscription.endDate.toLocaleDateString()}. 
      You can cancel anytime from your <a href="https://microjpeg.com/dashboard">dashboard</a>.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Payment Confirmed - MicroJPEG ${tierName}`,
      html: getBaseTemplate(content, `Your MicroJPEG ${tierName} subscription is now active!`),
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Payment confirmation email sent:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (err: any) {
    console.error('❌ Email exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send subscription renewal reminder (7 days before)
 */
export async function sendRenewalReminder(
  email: string,
  name: string,
  subscription: SubscriptionDetails
): Promise<EmailResult> {
  const currencySymbol = subscription.currency === 'INR' ? '₹' : '$';
  const tierName = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);

  const content = `
    <h2>Hi ${name},</h2>
    
    <p>This is a friendly reminder that your MicroJPEG <span class="highlight">${tierName}</span> subscription will renew in <strong>7 days</strong>.</p>

    <div class="card">
      <div class="detail-row">
        <span class="detail-label">Plan</span>
        <span class="detail-value">${tierName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Renewal Date</span>
        <span class="detail-value">${subscription.endDate.toLocaleDateString()}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">Amount</span>
        <span class="detail-value">${currencySymbol}${subscription.amount.toLocaleString()}</span>
      </div>
    </div>

    <p>No action is needed - your subscription will renew automatically. If you'd like to make changes or cancel, you can do so from your dashboard.</p>

    <div style="text-align: center;">
      <a href="https://microjpeg.com/dashboard" class="button">Manage Subscription</a>
    </div>

    <p style="color: #71717a; font-size: 14px;">
      Questions? Reply to this email or contact us at ${SUPPORT_EMAIL}
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔔 Subscription Renewal Reminder - MicroJPEG`,
      html: getBaseTemplate(content, `Your MicroJPEG subscription renews on ${subscription.endDate.toLocaleDateString()}`),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('✅ Renewal reminder sent:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send subscription cancelled confirmation
 */
export async function sendCancellationConfirmation(
  email: string,
  name: string,
  endDate: Date,
  tier: string
): Promise<EmailResult> {
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  const content = `
    <h2>Hi ${name},</h2>
    
    <p>We're sorry to see you go! Your MicroJPEG <span class="highlight">${tierName}</span> subscription has been cancelled.</p>

    <div class="card">
      <p style="margin: 0;"><strong>✓ Your subscription remains active until ${endDate.toLocaleDateString()}</strong></p>
      <p style="margin: 8px 0 0 0; color: #71717a;">You'll continue to have access to all ${tierName} features until then.</p>
    </div>

    <h3>What happens next?</h3>
    <ul style="color: #52525b; line-height: 1.8;">
      <li>You'll retain full access until ${endDate.toLocaleDateString()}</li>
      <li>After that, your account will revert to the Free plan</li>
      <li>Your compression history and settings will be preserved</li>
      <li>You can resubscribe anytime to restore ${tierName} features</li>
    </ul>

    <p>Changed your mind? You can reactivate your subscription anytime before ${endDate.toLocaleDateString()}.</p>

    <div style="text-align: center;">
      <a href="https://microjpeg.com/pricing" class="button">Reactivate Subscription</a>
    </div>

    <p style="color: #71717a; font-size: 14px;">
      We'd love to hear why you cancelled. Reply to this email with any feedback - it helps us improve!
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Subscription Cancelled - MicroJPEG`,
      html: getBaseTemplate(content, `Your MicroJPEG subscription has been cancelled`),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('✅ Cancellation email sent:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(
  email: string,
  name: string,
  tier: string,
  nextRetryDate?: Date
): Promise<EmailResult> {
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  const content = `
    <div style="text-align: center;">
      <div class="success-icon">⚠️</div>
      <h2 style="margin: 0 0 8px 0;">Payment Failed</h2>
      <p style="color: #71717a; margin: 0;">We couldn't process your subscription payment</p>
    </div>

    <div class="card" style="background: #fef2f2; border: 1px solid #fecaca;">
      <p style="margin: 0; color: #991b1b;">
        Your payment for <strong>MicroJPEG ${tierName}</strong> could not be processed. 
        ${nextRetryDate ? `We'll automatically retry on ${nextRetryDate.toLocaleDateString()}.` : ''}
      </p>
    </div>

    <h3>Please update your payment method</h3>
    <p>To avoid any interruption to your service, please update your payment details:</p>

    <div style="text-align: center;">
      <a href="https://microjpeg.com/dashboard" class="button" style="background: #dc2626;">Update Payment Method</a>
    </div>

    <p style="color: #71717a; font-size: 14px;">
      If you believe this is an error or need assistance, please contact us at ${SUPPORT_EMAIL}
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `⚠️ Payment Failed - Action Required`,
      html: getBaseTemplate(content, `Your MicroJPEG payment failed - please update your payment method`),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('✅ Payment failed email sent:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<EmailResult> {
  const content = `
    <div style="text-align: center;">
      <div class="success-icon">🎉</div>
      <h2 style="margin: 0 0 8px 0;">Welcome to MicroJPEG!</h2>
      <p style="color: #71717a; margin: 0;">Your account has been created successfully</p>
    </div>

    <p>Hi ${name},</p>
    
    <p>Thanks for joining MicroJPEG! We're excited to help you optimize your images.</p>

    <h3>🚀 Get Started</h3>
    <ul style="color: #52525b; line-height: 1.8;">
      <li><strong>Compress images</strong> - Reduce file sizes without losing quality</li>
      <li><strong>Convert formats</strong> - Support for JPEG, PNG, WebP, and RAW files</li>
      <li><strong>Batch processing</strong> - Handle multiple images at once</li>
      <li><strong>API access</strong> - Integrate with your workflow</li>
    </ul>

    <div style="text-align: center;">
      <a href="https://microjpeg.com/compress" class="button">Start Compressing →</a>
    </div>

    <div class="card">
      <h4 style="margin: 0 0 8px 0;">📈 Want more features?</h4>
      <p style="margin: 0; color: #52525b;">
        Upgrade to a paid plan for larger file sizes, priority processing, and unlimited compressions.
        <a href="https://microjpeg.com/pricing">View Plans →</a>
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 Welcome to MicroJPEG!`,
      html: getBaseTemplate(content, `Welcome! Your MicroJPEG account is ready`),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('✅ Welcome email sent:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Send subscription charged notification (recurring payment success)
 */
export async function sendSubscriptionCharged(
  email: string,
  name: string,
  subscription: SubscriptionDetails
): Promise<EmailResult> {
  const currencySymbol = subscription.currency === 'INR' ? '₹' : '$';
  const tierName = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);

  const content = `
    <h2>Hi ${name},</h2>
    
    <p>Your MicroJPEG subscription has been renewed successfully.</p>

    <div class="card">
      <div class="detail-row">
        <span class="detail-label">Plan</span>
        <span class="detail-value">${tierName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Charged</span>
        <span class="detail-value">${currencySymbol}${subscription.amount.toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Next Renewal</span>
        <span class="detail-value">${subscription.endDate.toLocaleDateString()}</span>
      </div>
      ${subscription.paymentId ? `
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">Transaction ID</span>
        <span class="detail-value" style="font-size: 12px;">${subscription.paymentId}</span>
      </div>
      ` : ''}
    </div>

    <p>Thank you for continuing to use MicroJPEG! Your ${tierName} features remain active.</p>

    <div style="text-align: center;">
      <a href="https://microjpeg.com/dashboard" class="button">View Dashboard</a>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Subscription Renewed - MicroJPEG`,
      html: getBaseTemplate(content, `Your MicroJPEG subscription has been renewed`),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('✅ Subscription charged email sent:', data?.id);
    return { success: true, messageId: data?.id };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Export all functions
export const emailService = {
  sendPaymentConfirmation,
  sendRenewalReminder,
  sendCancellationConfirmation,
  sendPaymentFailedNotification,
  sendWelcomeEmail,
  sendSubscriptionCharged,
};

export default emailService;
