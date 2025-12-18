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
  'semrushbot',      // SEMrush ← THIS WAS MISSING!
  'mj12bot',         // Majestic
  'dotbot',          // Moz
  'rogerbot',        // Moz
  'screaming frog',  // Screaming Frog
  'sitebulb',        // Sitebulb
  'deepcrawl',       // DeepCrawl
  'oncrawl',         // OnCrawl
  'seokicks',        // SEOkicks
  'sistrix',         // Sistrix
  'serpstat',        // Serpstat
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
  'redditbot',           // Reddit
  'embedly',             // Embedly
  'quora link preview',  // Quora
  'outbrain',            // Outbrain
  'vkshare',             // VK
  'w3c_validator',       // W3C Validator
  'lighthouse',          // Google Lighthouse
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

  // Remove query string and trailing slash
  const cleanRoute = route.split('?')[0].replace(/\/$/, '') || '/';

  // Map routes to files
  const routeMap: Record<string, string> = {
    '/': 'index.html',
    '/about': 'about.html',
    '/contact': 'contact.html',
    '/privacy-policy': 'privacy-policy.html',
    '/terms-of-service': 'terms-of-service.html',
    '/cancellation-policy': 'cancellation-policy.html',
    '/tools': 'tools.html',
    '/tools/compress': 'tools-compress.html',
    '/tools/convert': 'tools-convert.html',
    '/tools/optimizer': 'tools-optimizer.html',
    '/api-docs': 'api-docs-overview.html',
    '/wordpress-plugin': 'wordpress-plugin.html',
    '/wordpress-plugin/install': 'wordpress-plugin-install.html',
    '/wordpress-plugin/docs': 'wordpress-plugin-docs.html',
    '/pricing': 'pricing.html',
    '/features': 'features.html',
    '/legal/cookies': 'legal-cookies.html',
    '/legal/terms': 'terms-of-service.html',
    '/legal/privacy': 'privacy-policy.html',
    '/legal/cancellation': 'cancellation-policy.html',
    '/remove-background': 'remove-background.html',
    '/enhance-image': 'enhance-image.html',
  };

  // Handle API docs fragment routes (#overview, #how-it-works, etc.)
  if (cleanRoute.startsWith('/api-docs')) {
    const fragment = cleanRoute.split('#')[1];
    let fileName = 'api-docs-overview.html';

    if (fragment) {
      fileName = `api-docs-${fragment}.html`;
    }

    const filePath = path.join(seoDir, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return path.join(seoDir, 'api-docs-overview.html');
  }

  // Handle blog posts
  if (cleanRoute.startsWith('/blog/')) {
    const slug = cleanRoute.replace('/blog/', '');
    const fileName = `blog-${slug}.html`;
    const filePath = path.join(seoDir, fileName);

    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  // Handle conversion pages: /convert/xxx-to-yyy
  if (cleanRoute.startsWith('/convert/')) {
    const conversion = cleanRoute.replace('/convert/', '');
    const fileName = `convert-${conversion}.html`;
    const filePath = path.join(seoDir, fileName);

    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  // Handle compression pages: /compress/xxx-to-xxx or /compress/xxx
  if (cleanRoute.startsWith('/compress/')) {
    const compressPath = cleanRoute.replace('/compress/', '');
    
    // Try full path first (e.g., compress-jpg-to-jpg.html)
    let fileName = `compress-${compressPath}.html`;
    let filePath = path.join(seoDir, fileName);
    
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    
    // Try short format (e.g., compress-jpg.html)
    const format = compressPath.split('-')[0];
    fileName = `compress-${format}.html`;
    filePath = path.join(seoDir, fileName);
    
    if (fs.existsSync(filePath)) {
      return filePath;
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
 * 
 * Usage:
 * app.use(botDetectionMiddleware);
 */
export function botDetectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Skip static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json|webp|avif|pdf|zip)$/i)) {
    return next();
  }
  
  const userAgent = req.get('user-agent') || '';
  
  // Check if this is a bot
  if (!isBot(userAgent)) {
    // Regular user - continue to React app
    return next();
  }

  // This is a bot - try to serve static HTML
  console.log(`🤖 Bot detected: ${userAgent.substring(0, 60)}... for ${req.path}`);

  const staticHTMLPath = getStaticHTMLPath(req.path);

  if (staticHTMLPath) {
    // Serve pre-rendered HTML
    console.log(`   ✅ Serving static HTML: ${path.basename(staticHTMLPath)}`);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Rendered-By', 'MicroJPEG-SEO-Static');
    res.setHeader('X-SEO-Prerender', 'true');
    
    return res.sendFile(staticHTMLPath);
  } else {
    // No static HTML available - serve React app
    console.log(`   ⚠️  No static HTML for ${req.path}, serving React app`);
    return next();
  }
}

/**
 * Debug endpoint to test bot detection
 * 
 * Usage:
 * curl -A "AhrefsBot" https://microjpeg.com/__seo-debug
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
    sampleFiles: seoFiles.slice(0, 10),
    totalBots: BOT_USER_AGENTS.length,
    botsIncluded: BOT_USER_AGENTS,
    testUrls: {
      landing: '/',
      convert: '/convert/cr2-to-jpg',
      compress: '/compress/jpg-to-jpg',
      about: '/about',
      blog: '/blog/how-to-use-microjpeg'
    },
    howToTest: {
      asAhrefsBot: 'curl -A "AhrefsBot/7.0" https://microjpeg.com/convert/cr2-to-jpg',
      asGooglebot: 'curl -A "Googlebot" https://microjpeg.com/',
      asUser: 'curl https://microjpeg.com/',
    }
  });
}

export default botDetectionMiddleware;
