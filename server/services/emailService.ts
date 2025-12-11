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

/**
 * Send AI limit warning email (80% usage threshold)
 */
export async function sendAILimitWarning(
  email: string,
  firstName: string,
  featureName: string,
  usagePercent: number,
  remaining: number,
  limit: number,
  tierName: string
): Promise<boolean> {
  try {
    const upgradeLink = `${process.env.APP_URL || 'https://microjpeg.com'}/pricing`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `⚠️ You've used ${usagePercent}% of your ${featureName} limit`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Usage Alert</h1>
          </div>

          <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi ${firstName},</p>

            <p style="font-size: 16px;">You've used <strong style="color: #f59e0b;">${usagePercent}%</strong> of your monthly ${featureName} limit.</p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Current Usage:</strong> ${limit - remaining} of ${limit} operations<br>
                <strong>Remaining:</strong> ${remaining} operations<br>
                <strong>Current Plan:</strong> ${tierName.charAt(0).toUpperCase() + tierName.slice(1)}
              </p>
            </div>

            <p style="font-size: 16px;">Running low? Upgrade now to get more ${featureName.toLowerCase()} operations and unlock premium features:</p>

            <ul style="font-size: 14px; color: #4b5563;">
              <li>✨ More monthly operations</li>
              <li>🎨 All output formats (PNG, WebP, AVIF, JPG)</li>
              <li>🚀 8x upscaling for image enhancement</li>
              <li>👤 Face enhancement feature</li>
              <li>⚡ Priority processing</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${upgradeLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Upgrade Now →
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280;">Your limits reset on the 1st of each month.</p>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} MicroJPEG. All rights reserved.</p>
            <p>
              <a href="${process.env.APP_URL}/dashboard" style="color: #6b7280;">Dashboard</a> ·
              <a href="${process.env.APP_URL}/pricing" style="color: #6b7280;">Pricing</a> ·
              <a href="${process.env.APP_URL}/support" style="color: #6b7280;">Support</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ AI limit warning sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send AI limit warning:', error);
    return false;
  }
}

/**
 * Send AI limit exhausted email (100% usage)
 */
export async function sendAILimitExhausted(
  email: string,
  firstName: string,
  featureName: string,
  tierName: string
): Promise<boolean> {
  try {
    const upgradeLink = `${process.env.APP_URL || 'https://microjpeg.com'}/pricing`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🚫 Your ${featureName} limit has been reached`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚫 Limit Reached</h1>
          </div>

          <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi ${firstName},</p>

            <p style="font-size: 16px;">You've used all of your monthly <strong>${featureName}</strong> operations on your <strong>${tierName}</strong> plan.</p>

            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 14px; color: #991b1b;">
                <strong>Don't worry!</strong> You have two options:
              </p>
              <ol style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #991b1b;">
                <li>Wait until the 1st of next month for your limits to reset</li>
                <li>Upgrade now to continue using ${featureName.toLowerCase()}</li>
              </ol>
            </div>

            <p style="font-size: 16px;">Upgrade to unlock:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Plan</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">${featureName}</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Price</th>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Starter</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;"><strong>200/month</strong></td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">$9/month</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Pro</td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;"><strong>500/month</strong></td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">$19/month</td>
              </tr>
              <tr>
                <td style="padding: 12px;">Business</td>
                <td style="padding: 12px; text-align: center;"><strong>1000/month</strong></td>
                <td style="padding: 12px; text-align: center;">$49/month</td>
              </tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${upgradeLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Upgrade Your Plan →
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              Need help? Reply to this email or visit our <a href="${process.env.APP_URL}/support" style="color: #3b82f6;">support page</a>.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} MicroJPEG. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ AI limit exhausted email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send AI limit exhausted email:', error);
    return false;
  }
}

/**
 * Send AI monthly usage summary email
 */
export async function sendAIUsageSummary(
  email: string,
  firstName: string,
  stats: {
    bgRemovalUsed: number;
    bgRemovalLimit: number;
    enhanceUsed: number;
    enhanceLimit: number;
    compressionUsed: number;
    tierName: string;
  }
): Promise<boolean> {
  try {
    const dashboardLink = `${process.env.APP_URL || 'https://microjpeg.com'}/dashboard`;

    const bgPercent = stats.bgRemovalLimit > 0
      ? Math.round((stats.bgRemovalUsed / stats.bgRemovalLimit) * 100)
      : 0;
    const enhancePercent = stats.enhanceLimit > 0
      ? Math.round((stats.enhanceUsed / stats.enhanceLimit) * 100)
      : 0;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `📊 Your MicroJPEG Monthly Usage Summary`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Monthly Usage Summary</h1>
          </div>

          <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Hi ${firstName},</p>

            <p style="font-size: 16px;">Here's your MicroJPEG usage summary for this month:</p>

            <!-- Background Removal Stats -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #374151;">🖼️ Background Removal</h3>
              <div style="background: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${Math.min(bgPercent, 100)}%;"></div>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                <strong>${stats.bgRemovalUsed}</strong> of ${stats.bgRemovalLimit} used (${bgPercent}%)
              </p>
            </div>

            <!-- Enhancement Stats -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #374151;">✨ Image Enhancement</h3>
              <div style="background: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #6366f1, #4f46e5); height: 100%; width: ${Math.min(enhancePercent, 100)}%;"></div>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
                <strong>${stats.enhanceUsed}</strong> of ${stats.enhanceLimit} used (${enhancePercent}%)
              </p>
            </div>

            <!-- Compression Stats -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #374151;">📦 Compressions</h3>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3b82f6;">
                ${stats.compressionUsed.toLocaleString()}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">images processed this month</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardLink}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                View Full Dashboard →
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              Current Plan: <strong>${stats.tierName}</strong>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} MicroJPEG. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ AI usage summary sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send AI usage summary:', error);
    return false;
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
  sendAILimitWarning,
  sendAILimitExhausted,
  sendAIUsageSummary,
};

export default emailService;
