// ============================================================================
// SEO PRE-RENDERING MIDDLEWARE
// ============================================================================
// File: server/middleware/seoPreRenderMiddleware.ts
//
// This middleware detects search engine bots and serves pre-rendered static
// HTML files from /dist/seo/ instead of the SPA shell.
// ============================================================================

import path from 'path';
import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';

// List of bot user agents to detect
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'applebot',
  'ahrefsbot',
  'semrushbot',
  'dotbot',
  'mj12bot',
  'screaming frog',
  'rogerbot',
  'embedly',
  'pinterest',
  'redditbot',
  'petalbot',
];

// Cache the SEO directory path
const SEO_DIR = path.join(process.cwd(), 'dist', 'seo');

/**
 * Check if the request is from a search engine bot
 */
function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

/**
 * Get the pre-rendered HTML file path for a given URL
 */
function getSeoFilePath(urlPath: string): string | null {
  // Remove trailing slash and query string
  const cleanPath = urlPath.split('?')[0].replace(/\/$/, '') || '/';
  
  let seoFile: string;
  
  // Homepage
  if (cleanPath === '/') {
    seoFile = 'index.html';
  }
  // Conversion pages: /convert/xxx-to-yyy -> convert-xxx-to-yyy.html
  else if (cleanPath.match(/^\/convert\/([a-z0-9]+-to-[a-z0-9]+)$/i)) {
    const conversion = cleanPath.replace('/convert/', '');
    seoFile = `convert-${conversion}.html`;
  }
  // Compression pages: /compress/xxx-to-xxx -> compress-xxx.html
  else if (cleanPath.match(/^\/compress\/([a-z]+-to-[a-z]+)$/i)) {
    const format = cleanPath.replace('/compress/', '').split('-to-')[0];
    seoFile = `compress-${format}.html`;
  }
  // Blog pages: /blog/slug -> blog-slug.html
  else if (cleanPath.match(/^\/blog\/(.+)$/)) {
    const slug = cleanPath.replace('/blog/', '');
    seoFile = `blog-${slug}.html`;
  }
  // AI Tools
  else if (cleanPath === '/remove-background') {
    seoFile = 'remove-background.html';
  }
  else if (cleanPath === '/enhance-image') {
    seoFile = 'enhance-image.html';
  }
  // Tools pages
  else if (cleanPath === '/tools') {
    seoFile = 'tools.html';
  }
  else if (cleanPath === '/tools/compress') {
    seoFile = 'tools-compress.html';
  }
  else if (cleanPath === '/tools/convert') {
    seoFile = 'tools-convert.html';
  }
  else if (cleanPath === '/tools/optimizer') {
    seoFile = 'tools-optimizer.html';
  }
  // WordPress plugin pages
  else if (cleanPath === '/wordpress-plugin') {
    seoFile = 'wordpress-plugin.html';
  }
  else if (cleanPath === '/wordpress-plugin/install') {
    seoFile = 'wordpress-plugin-install.html';
  }
  else if (cleanPath === '/wordpress-plugin/docs') {
    seoFile = 'wordpress-plugin-docs.html';
  }
  // Other static pages
  else if (cleanPath === '/about') {
    seoFile = 'about.html';
  }
  else if (cleanPath === '/contact') {
    seoFile = 'contact.html';
  }
  else if (cleanPath === '/pricing') {
    seoFile = 'pricing.html';
  }
  else if (cleanPath === '/features') {
    seoFile = 'features.html';
  }
  else if (cleanPath === '/privacy-policy') {
    seoFile = 'privacy-policy.html';
  }
  else if (cleanPath === '/terms-of-service') {
    seoFile = 'terms-of-service.html';
  }
  else if (cleanPath === '/cancellation-policy') {
    seoFile = 'cancellation-policy.html';
  }
  else if (cleanPath === '/legal/cookies' || cleanPath === '/cookie-policy') {
    seoFile = 'legal-cookies.html';
  }
  // API docs
  else if (cleanPath.startsWith('/api-docs')) {
    seoFile = 'api-docs-overview.html';
  }
  else {
    // No pre-rendered file for this path
    return null;
  }
  
  const fullPath = path.join(SEO_DIR, seoFile);
  
  // Check if file exists
  try {
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  } catch {
    // File doesn't exist
  }
  
  return null;
}

/**
 * Express middleware for SEO pre-rendering
 * 
 * Detects search engine bots and serves pre-rendered HTML from /dist/seo/
 */
export function seoPreRenderMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/api-v1/')) {
    return next();
  }
  
  // Skip static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json|webp|avif|pdf|zip)$/i)) {
    return next();
  }
  
  // Skip assets directory
  if (req.path.startsWith('/assets/')) {
    return next();
  }
  
  // Check if request is from a bot
  const userAgent = req.headers['user-agent'];
  if (!isBot(userAgent)) {
    return next();
  }
  
  // Try to find pre-rendered HTML file
  const seoFilePath = getSeoFilePath(req.path);
  
  if (seoFilePath) {
    console.log(`[SEO] Bot detected, serving pre-rendered: ${req.path} -> ${path.basename(seoFilePath)}`);
    res.setHeader('X-SEO-Prerender', 'true');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(seoFilePath);
  }
  
  // No pre-rendered file found, continue to SPA
  next();
}

// Default export for convenience
export default seoPreRenderMiddleware;
