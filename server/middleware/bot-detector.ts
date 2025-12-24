/**
 * Bot Detection Middleware for SEO
 * 
 * Detects search engine bots and serves pre-rendered static HTML
 * while regular users get the React SPA.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// List of search engine bot user agents - COMPREHENSIVE LIST
const BOT_USER_AGENTS = [
  // Major Search Engines
  'googlebot',
  'bingbot',
  'slurp',           // Yahoo
  'duckduckbot',     // DuckDuckGo
  'baiduspider',     // Baidu
  'yandexbot',       // Yandex
  'sogou',           // Sogou
  'exabot',          // Exalead

  // SEO Tools - CRITICAL FOR AUDITS
  'ahrefsbot',       // Ahrefs ← THIS WAS MISSING!
  'semrushbot',      // SEMrush
  'mj12bot',         // Majestic
  'dotbot',          // Moz
  'rogerbot',        // Moz
  'screaming frog',  // Screaming Frog
  'sitebulb',        // Sitebulb
  'seokicks',        // SEOkicks
  'petalbot',        // Huawei/Petal

  // Social Media
  'facebookexternalhit', // Facebook
  'twitterbot',          // Twitter
  'linkedinbot',         // LinkedIn
  'whatsapp',            // WhatsApp
  'telegrambot',         // Telegram
  'slackbot',            // Slack
  'discordbot',          // Discord
  'pinterest',           // Pinterest

  // Other
  'applebot',            // Apple
  'ia_archiver',         // Alexa
  'seznambot',           // Seznam
  'developers.google.com/+/web/snippet', // Google+
];

/**
 * Check if the request is from a bot
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent) return false;

  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}

/**
 * Get the static HTML file path for a given route
 */
function getStaticHTMLPath(route: string): string | null {
  const seoDir = path.join(process.cwd(), 'dist/seo');

  // Clean the route - remove query strings and trailing slashes AND lowercase
  const cleanRoute = (route.split('?')[0].replace(/\/$/, '') || '/').toLowerCase();

  // Map routes to files - COMPLETE LIST
  const routeMap: Record<string, string> = {
    '/': 'index.html',
    '/about': 'about.html',
    '/contact': 'contact.html',
    '/tools': 'tools.html',
    '/pricing': 'pricing.html',
    '/features': 'features.html',
    '/support': 'support.html',
    '/blog': 'blog.html',

    // API Docs
    '/api-docs': 'api-docs.html',

    // WordPress
    '/wordpress-plugin': 'wordpress-plugin.html',
    '/wordpress-plugin/install': 'wordpress-plugin-install.html',
    '/wordpress-plugin/docs': 'wordpress-plugin-docs.html',

    // Legal pages - THESE WERE MISSING!
    '/legal/terms': 'legal-terms.html',
    '/legal/privacy': 'legal-privacy.html',
    '/legal/cookies': 'legal-cookies.html',
    '/legal/cancellation': 'legal-cancellation.html',
    '/legal/payment-protection': 'legal-payment-protection.html',

    // AI Tools - THESE WERE MISSING!
    '/remove-background': 'remove-background.html',
    '/enhance-image': 'enhance-image.html',

    // Legacy redirects (in case bots hit old URLs)
    '/privacy-policy': 'legal-privacy.html',
    '/terms-of-service': 'legal-terms.html',
    '/cookie-policy': 'legal-cookies.html',
    '/cancellation-policy': 'legal-cancellation.html',
  };

  // Handle blog posts: /blog/slug -> blog-slug.html
  if (cleanRoute.startsWith('/blog/')) {
    const slug = cleanRoute.replace('/blog/', '');
    const fileName = `blog-${slug}.html`;
    const filePath = path.join(seoDir, fileName);

    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  // Handle conversion pages: /convert/xxx-to-yyy -> convert-xxx-to-yyy.html
  if (cleanRoute.startsWith('/convert/')) {
    const conversion = cleanRoute.replace('/convert/', '');
    const fileName = `convert-${conversion}.html`;
    const filePath = path.join(seoDir, fileName);

    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  // Handle compression pages: /compress/xxx or /compress/xxx-to-xxx
  if (cleanRoute.startsWith('/compress/')) {
    const compressPath = cleanRoute.replace('/compress/', '');
    const fileName = `compress-${compressPath}.html`;
    const filePath = path.join(seoDir, fileName);

    if (fs.existsSync(filePath)) {
      return filePath;
    }

    // Try short format: compress-jpg.html
    const format = compressPath.split('-')[0];
    const shortFileName = `compress-${format}.html`;
    const shortFilePath = path.join(seoDir, shortFileName);

    if (fs.existsSync(shortFilePath)) {
      return shortFilePath;
    }

    return null;
  }

  // Handle mapped routes
  const fileName = routeMap[cleanRoute];
  if (!fileName) return null;

  const filePath = path.join(seoDir, fileName);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  return null;
}

/**
 * Bot detection middleware
 */
export function botDetectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip API routes and static assets
  if (req.path.startsWith('/api') ||
    req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|map|json|webp|avif)$/i)) {
    return next();
  }

  const userAgent = req.get('user-agent') || '';

  // Check if this is a bot
  if (!isBot(userAgent)) {
    return next();
  }

  // This is a bot - try to serve static HTML
  console.log(`🤖 Bot detected: ${userAgent.substring(0, 60)}... for ${req.path}`);

  const staticHTMLPath = getStaticHTMLPath(req.path);

  if (staticHTMLPath) {
    console.log(`   ✅ Serving: ${path.basename(staticHTMLPath)}`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Rendered-By', 'MicroJPEG-SEO-Static');
    res.setHeader('X-SEO-Bot', 'true');

    return res.sendFile(staticHTMLPath);
  } else {
    console.log(`   ⚠️ No static HTML for ${req.path}`);
    return next();
  }
}

/**
 * Debug endpoint
 */
export function seoDebugEndpoint(req: Request, res: Response) {
  const userAgent = req.get('user-agent') || '';
  const isBotRequest = isBot(userAgent);

  const seoDir = path.join(process.cwd(), 'dist/seo');
  const seoFiles = fs.existsSync(seoDir)
    ? fs.readdirSync(seoDir).filter(f => f.endsWith('.html'))
    : [];

  res.json({
    botDetected: isBotRequest,
    userAgent,
    seoFilesAvailable: seoFiles.length,
    sampleFiles: seoFiles.slice(0, 20),
    botsSupported: BOT_USER_AGENTS,
    testCommands: {
      ahrefsBot: 'curl -A "AhrefsBot/7.0" https://microjpeg.com/convert/cr2-to-jpg',
      googleBot: 'curl -A "Googlebot" https://microjpeg.com/',
    }
  });
}

export default botDetectionMiddleware;
