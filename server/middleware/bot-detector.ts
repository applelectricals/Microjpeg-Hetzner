/**
 * Bot Detection Middleware for SEO
 * 
 * Detects search engine bots and serves pre-rendered static HTML
 * while regular users get the React SPA.
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// List of search engine bot user agents
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',        // Yahoo
  'duckduckbot',  // DuckDuckGo
  'baiduspider',  // Baidu
  'yandexbot',    // Yandex
  'sogou',        // Sogou
  'exabot',       // Exalead
  'facebookexternalhit', // Facebook
  'twitterbot',   // Twitter
  'linkedinbot',  // LinkedIn
  'whatsapp',     // WhatsApp
  'telegrambot',  // Telegram
  'slackbot',     // Slack
  'discordbot',   // Discord
  'pinterest',    // Pinterest
  'applebot',     // Apple
  'ia_archiver',  // Alexa
  'seznambot',    // Seznam
  'developers.google.com/+/web/snippet', // Google+
];

/**
 * Check if the request is from a bot
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Get the static HTML file path for a given route
 */
function getStaticHTMLPath(route: string): string | null {
  const seoDir = path.join(process.cwd(), 'dist/seo');
  
  // Map routes to files
  const routeMap: Record<string, string> = {
    '/': 'index.html',
    '/convert': 'convert.html',
    '/about': 'about.html',
    '/contact': 'contact.html',
    '/privacy-policy': 'privacy-policy.html',
    '/terms-of-service': 'terms-of-service.html',
    '/cancellation-policy': 'cancellation-policy.html',
  };

  // Handle blog posts
  if (route.startsWith('/blog/')) {
    const slug = route.replace('/blog/', '');
    const fileName = `blog-${slug}.html`;
    const filePath = path.join(seoDir, fileName);
    
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  // Handle mapped routes
  const fileName = routeMap[route];
  if (!fileName) return null;

  const filePath = path.join(seoDir, fileName);
  
  // Check if file exists
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
  const userAgent = req.get('user-agent') || '';
  
  // Check if this is a bot
  if (!isBot(userAgent)) {
    // Regular user - continue to React app
    return next();
  }

  // This is a bot - try to serve static HTML
  console.log(`🤖 Bot detected: ${userAgent.substring(0, 50)}... for ${req.path}`);

  const staticHTMLPath = getStaticHTMLPath(req.path);

  if (staticHTMLPath) {
    // Serve pre-rendered HTML
    console.log(`   ✅ Serving static HTML: ${path.basename(staticHTMLPath)}`);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Rendered-By', 'MicroJPEG-SEO-Static');
    
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
 * curl -A "Googlebot" http://localhost:10000/__seo-debug
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
    seoFiles,
    testUrls: {
      landing: '/',
      convert: '/convert',
      about: '/about',
      blog: '/blog/understanding-image-compression'
    },
    howToTest: {
      asBot: 'curl -A "Googlebot" http://localhost:10000/',
      asUser: 'curl http://localhost:10000/',
      inBrowser: 'Open DevTools -> Network -> User-Agent (override)'
    }
  });
}

export default botDetectionMiddleware;
