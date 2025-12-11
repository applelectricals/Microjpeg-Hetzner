// ============================================================================
// EMAIL SERVICE ADDITIONS FOR AI FEATURES
// Add these methods to your existing emailService.ts
// ============================================================================

// Add these imports if not present
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'MicroJPEG <noreply@microjpeg.com>';

// ============================================================================
// AI LIMIT WARNING EMAIL (80% usage threshold)
// ============================================================================

async sendAILimitWarning(
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
    
    console.log(`[EmailService] AI limit warning sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send AI limit warning:', error);
    return false;
  }
}

// ============================================================================
// AI LIMIT EXHAUSTED EMAIL (100% usage)
// ============================================================================

async sendAILimitExhausted(
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
    
    console.log(`[EmailService] AI limit exhausted email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send AI limit exhausted email:', error);
    return false;
  }
}

// ============================================================================
// AI MONTHLY USAGE SUMMARY EMAIL
// ============================================================================

async sendAIUsageSummary(
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
    
    console.log(`[EmailService] AI usage summary sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send AI usage summary:', error);
    return false;
  }
}
