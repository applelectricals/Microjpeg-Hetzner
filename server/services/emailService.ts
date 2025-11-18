import { Resend } from 'resend';
import crypto from 'crypto';

// Initialize Resend
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not set in environment variables');
    }
    resend = new Resend(apiKey);
    console.log('✅ Resend initialized');
  }
  return resend;
}

const FROM_EMAIL = () => process.env.FROM_EMAIL || 'onboarding@resend.dev';
const SUPPORT_EMAIL = () => process.env.SUPPORT_EMAIL || 'support@microjpeg.com';
const SITE_URL = () => process.env.SITE_URL || 'https://microjpeg.com';

class EmailService {
  /**
   * Send email using Resend
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const resendClient = getResend();
      
      const { data, error } = await resendClient.emails.send({
        from: `MicroJPEG <${FROM_EMAIL()}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('❌ Resend error:', error);
        return false;
      }

      console.log(`✅ Email sent successfully to ${to}. ID: ${data?.id}`);
      return true;
      
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string,
    name: string,
    plan: string,
    billingCycle: string,
    amount: number
  ): Promise<boolean> {
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
    const cycle = billingCycle === 'monthly' ? 'Monthly' : 'Yearly';
    const nextBillingDate = billingCycle === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const subject = `🎉 Welcome to MicroJPEG ${planName} - Subscription Confirmed!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 48px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Welcome to MicroJPEG!</h1>
              <p style="color: #ffffff; margin: 12px 0 0 0; font-size: 18px; opacity: 0.95;">Your subscription is now active</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #111827; margin: 0 0 20px 0;">Hi ${name || 'there'},</p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for subscribing to MicroJPEG! Your payment has been confirmed and your <strong>${planName}</strong> plan is now active.
              </p>

              <!-- Subscription Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">📋 Subscription Details</h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; width: 140px;">Plan:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Billing:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600;">${cycle} - $${amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Status:</td>
                        <td style="color: #10b981; font-size: 14px; font-weight: 600;">● Active</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Next Billing:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600;">${nextBillingDate.toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL()}/compress" style="display: inline-block; background-color: #14b8a6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Start Compressing Images →</a>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
                <tr>
                  <td>
                    <h4 style="color: #111827; margin: 0 0 16px 0; font-size: 16px;">🚀 What's Next?</h4>
                    <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Start compressing images with your increased limits</li>
                      <li>Explore format conversion features</li>
                      <li>Manage your subscription in your dashboard</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL()}" style="color: #14b8a6;">${SUPPORT_EMAIL()}</a>
              </p>

              <p style="color: #111827; margin: 32px 0 0 0; font-size: 16px;">
                Best regards,<br>
                <strong>The MicroJPEG Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} MicroJPEG. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send one-time payment confirmation
   */
  async sendPaymentConfirmation(
    email: string,
    name: string,
    plan: string,
    amount: number,
    duration: number
  ): Promise<boolean> {
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
    const durationText = duration === 30 ? '1 Month' : duration === 365 ? '1 Year' : `${duration} Days`;
    const expiryDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    const subject = `✅ Payment Confirmed - MicroJPEG ${planName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 48px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Payment Confirmed!</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #111827; margin: 0 0 20px 0;">Hi ${name || 'there'},</p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
                Your payment of <strong>$${amount.toFixed(2)}</strong> has been successfully processed!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #111827;">💳 Purchase Details</h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; width: 140px;">Plan:</td>
                        <td style="color: #111827; font-weight: 600;">${planName}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280;">Amount:</td>
                        <td style="color: #111827; font-weight: 600;">$${amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280;">Duration:</td>
                        <td style="color: #111827; font-weight: 600;">${durationText}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280;">Valid Until:</td>
                        <td style="color: #111827; font-weight: 600;">${expiryDate.toLocaleDateString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL()}/compress" style="display: inline-block; background-color: #14b8a6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Using Your Plan →</a>
                  </td>
                </tr>
              </table>

              <p style="color: #111827; margin: 32px 0 0 0;">
                Best regards,<br>
                <strong>The MicroJPEG Team</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailure(
    email: string,
    name: string,
    reason: string
  ): Promise<boolean> {
    const subject = '⚠️ Payment Issue - MicroJPEG';
    const html = `<p>Hi ${name},</p><p>We encountered an issue: ${reason}</p>`;
    return this.sendEmail(email, subject, html);
  }

  /**
   * Send API key welcome email
   */
  async sendApiKeyWelcome(
    email: string,
    name: string,
    apiKeyPrefix: string,
    monthlyLimit: number
  ): Promise<boolean> {
    const subject = '🎉 Welcome to MicroJPEG API - Your API Key is Ready!';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 48px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Welcome to MicroJPEG API!</h1>
              <p style="color: #ffffff; margin: 12px 0 0 0; font-size: 18px; opacity: 0.95;">Your API key is ready to use</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #111827; margin: 0 0 20px 0;">Hi ${name || 'Developer'},</p>

              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
                Congratulations! Your MicroJPEG API account has been created successfully. Your API key is now active and ready to use.
              </p>

              <!-- API Key Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; margin: 24px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">📋 Your API Key Details</h3>

                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; width: 140px;">Key Prefix:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace;">${apiKeyPrefix}...</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Monthly Limit:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600;">${monthlyLimit} compressions</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Rate Limit:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600;">100 requests/hour</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Status:</td>
                        <td style="color: #10b981; font-size: 14px; font-weight: 600;">● Active</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
                <tr>
                  <td>
                    <h4 style="color: #111827; margin: 0 0 16px 0; font-size: 16px;">🚀 Next Steps</h4>
                    <ol style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 12px;">
                        <strong>Review Documentation:</strong> Visit our <a href="${SITE_URL()}/api-docs" style="color: #14b8a6;">API documentation</a> to learn how to integrate
                      </li>
                      <li style="margin-bottom: 12px;">
                        <strong>Test Your Key:</strong> Try your first API request with sample code provided in docs
                      </li>
                      <li style="margin-bottom: 12px;">
                        <strong>Monitor Usage:</strong> Track your API usage in your <a href="${SITE_URL()}/dashboard" style="color: #14b8a6;">dashboard</a>
                      </li>
                      <li>
                        <strong>Upgrade Later:</strong> Upgrade to a higher tier whenever you need more operations
                      </li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Important Note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; margin: 24px 0; padding: 16px;">
                <tr>
                  <td style="color: #92400e; font-size: 14px; line-height: 1.6;">
                    <strong>⚠️ Important:</strong> Keep your API key secret! Do not share it publicly or commit it to version control. Treat it like a password.
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL()}/api-docs" style="display: inline-block; background-color: #14b8a6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">View API Docs →</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px;">
                    <a href="${SITE_URL()}/dashboard" style="display: inline-block; background-color: #e5e7eb; color: #111827; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
                Need help? Check our <a href="${SITE_URL()}/support" style="color: #14b8a6;">support page</a> or contact us at <a href="mailto:${SUPPORT_EMAIL()}" style="color: #14b8a6;">${SUPPORT_EMAIL()}</a>
              </p>

              <p style="color: #111827; margin: 32px 0 0 0; font-size: 16px;">
                Best regards,<br>
                <strong>The MicroJPEG Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} MicroJPEG. All rights reserved. | Making the web faster, one image at a time.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Generate a secure verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    email: string,
    verificationToken: string,
    name?: string
  ): Promise<boolean> {
    const verificationUrl = `${SITE_URL()}/verify-email?token=${verificationToken}`;
    const displayName = name || email.split('@')[0];

    const subject = '📧 Verify Your Email - MicroJPEG API';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 48px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Verify Your Email</h1>
              <p style="color: #ffffff; margin: 12px 0 0 0; font-size: 18px; opacity: 0.95;">Complete your MicroJPEG API setup</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 18px; color: #111827; margin: 0 0 20px 0;">Hi ${displayName},</p>

              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for signing up for MicroJPEG API! Please verify your email address to activate your account and start using your API key.
              </p>

              <!-- Verification Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email →</a>
                  </td>
                </tr>
              </table>

              <!-- Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <tr>
                  <td style="color: #166534; font-size: 14px; line-height: 1.6;">
                    <strong>✓ Verification Link:</strong> You can also copy and paste this link in your browser:<br>
                    <code style="background: #ffffff; padding: 8px; border-radius: 4px; display: block; margin-top: 8px; word-break: break-all; font-size: 12px;">${verificationUrl}</code>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; margin: 24px 0; padding: 16px;">
                <tr>
                  <td style="color: #92400e; font-size: 14px; line-height: 1.6;">
                    <strong>⏰ This link expires in 24 hours.</strong> If you didn't create this account, please ignore this email.
                  </td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
                Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL()}" style="color: #14b8a6;">${SUPPORT_EMAIL()}</a>
              </p>

              <p style="color: #111827; margin: 32px 0 0 0; font-size: 16px;">
                Best regards,<br>
                <strong>The MicroJPEG Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} MicroJPEG. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
