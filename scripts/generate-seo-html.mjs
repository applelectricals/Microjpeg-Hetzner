#!/usr/bin/env node

/**
 * SEO Static HTML Generator - BULLETPROOF VERSION
 * 
 * This script generates static HTML for SEO pages and GUARANTEES
 * that each page has the correct:
 * - <title>
 * - <link rel="canonical">
 * - <meta name="description">
 * - <meta property="og:*">
 * 
 * Run: node scripts/generate-seo-html.mjs
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVER_PORT = process.env.SEO_SERVER_PORT || 10000;
const IS_BUILD = process.env.SEO_BUILD === 'true';
const SERVER_URL = IS_BUILD
  ? `http://127.0.0.1:${SERVER_PORT}`
  : (process.env.SEO_SERVER_URL || 'https://microjpeg.com');
const OUTPUT_DIR = path.join(__dirname, '../dist/seo');
const STARTUP_DELAY = 15000;
const MAX_RETRIES = 3;

// ============================================================================
// SEO PAGES CONFIGURATION
// ============================================================================

const SEO_PAGES = [
  { url: '/', output: 'index.html', name: 'Landing Page' },
  { url: '/about', output: 'about.html', name: 'About Page' },
  { url: '/contact', output: 'contact.html', name: 'Contact Page' },
  { url: '/tools', output: 'tools.html', name: 'Tools Page' },
  { url: '/pricing', output: 'pricing.html', name: 'Pricing' },
  { url: '/features', output: 'features.html', name: 'Features' },
  { url: '/api-docs', output: 'api-docs.html', name: 'API Docs' },
  { url: '/wordpress-plugin', output: 'wordpress-plugin.html', name: 'WordPress Plugin' },
  { url: '/wordpress-plugin/install', output: 'wordpress-plugin-install.html', name: 'WordPress Install' },
  { url: '/blog', output: 'blog.html', name: 'Blog' },
  { url: '/support', output: 'support.html', name: 'Support' },
  { url: '/legal/terms', output: 'legal-terms.html', name: 'Terms of Service' },
  { url: '/legal/privacy', output: 'legal-privacy.html', name: 'Privacy Policy' },
  { url: '/legal/cookies', output: 'legal-cookies.html', name: 'Cookie Policy' },
  { url: '/legal/cancellation', output: 'legal-cancellation.html', name: 'Cancellation Policy' },
  { url: '/legal/payment-protection', output: 'legal-payment-protection.html', name: 'Payment Protection' },
  { url: '/remove-background', output: 'remove-background.html', name: 'AI Background Remover' },
  { url: '/enhance-image', output: 'enhance-image.html', name: 'AI Image Enhancer' },
];

// Blog posts
const BLOG_POSTS = [
  'how-to-use-microjpeg',
  'optimize-png-tiff-wordpress',
  'avif-vs-webp-vs-jpg-2025',
  'batch-convert-avif-2025',
  'raw-to-webp-photographer-workflow',
  'webp-back-to-jpg-png',
  'image-compression-best-practices',
  'svg-to-avif-icons',
  'jpg-recompression-myths',
  'python-raw-to-tiff',
  'webp-quality-settings',
  'compress-jpg-images-without-losing-quality',
  'raw-to-jpg-conversion-guide',
  'wordpress-image-optimization-guide'
];

BLOG_POSTS.forEach(slug => {
  SEO_PAGES.push({
    url: `/blog/${slug}`,
    output: `blog-${slug}.html`,
    name: `Blog: ${slug}`
  });
});

// Conversion pages
const CONVERSIONS = [
  'jpg-to-png', 'jpg-to-webp', 'jpg-to-avif', 'jpg-to-tiff',
  'png-to-jpg', 'png-to-webp', 'png-to-avif', 'png-to-tiff',
  'webp-to-jpg', 'webp-to-png', 'webp-to-avif', 'webp-to-tiff',
  'avif-to-jpg', 'avif-to-png', 'avif-to-webp', 'avif-to-tiff',
  'tiff-to-jpg', 'tiff-to-png', 'tiff-to-webp', 'tiff-to-avif',
  'cr2-to-jpg', 'cr2-to-png', 'cr2-to-webp', 'cr2-to-avif', 'cr2-to-tiff',
  'nef-to-jpg', 'nef-to-png', 'nef-to-webp', 'nef-to-avif', 'nef-to-tiff',
  'arw-to-jpg', 'arw-to-png', 'arw-to-webp', 'arw-to-avif', 'arw-to-tiff',
  'dng-to-jpg', 'dng-to-png', 'dng-to-webp', 'dng-to-avif', 'dng-to-tiff',
  'orf-to-jpg', 'orf-to-png', 'orf-to-webp', 'orf-to-avif', 'orf-to-tiff',
  'raf-to-jpg', 'raf-to-png', 'raf-to-webp', 'raf-to-avif', 'raf-to-tiff',
  'crw-to-jpg', 'crw-to-png', 'crw-to-webp', 'crw-to-avif', 'crw-to-tiff',
  'rw2-to-jpg',
  'svg-to-jpg', 'svg-to-png', 'svg-to-webp', 'svg-to-avif', 'svg-to-tiff',
];

CONVERSIONS.forEach(conversion => {
  SEO_PAGES.push({
    url: `/convert/${conversion}`,
    output: `convert-${conversion}.html`,
    name: `Convert: ${conversion}`
  });
});

// Compression pages
const COMPRESS_FORMATS = ['jpg', 'png', 'webp', 'avif', 'tiff'];
COMPRESS_FORMATS.forEach(format => {
  SEO_PAGES.push({
    url: `/compress/${format}`,
    output: `compress-${format}.html`,
    name: `Compress: ${format}`
  });
  SEO_PAGES.push({
    url: `/compress/${format}-to-${format}`,
    output: `compress-${format}-to-${format}.html`,
    name: `Compress: ${format}-to-${format}`
  });
});

console.log(`\n📊 Total SEO pages to generate: ${SEO_PAGES.length}\n`);

let serverProcess = null;

async function waitForServer(maxRetries = MAX_RETRIES) {
  console.log('🔍 Waiting for server to be ready...');
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${SERVER_URL}/`);
      console.log(`   ✅ Server responding (status: ${response.status})`);
      return true;
    } catch (error) {
      console.log(`   ⏳ Attempt ${i + 1}/${maxRetries}: Server not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Server failed to start after maximum retries');
}

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting local server...');
    serverProcess = spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, PORT: SERVER_PORT }
    });
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('listening') || output.includes('ready') || output.includes('started')) {
        console.log(`   ✅ Server started on port ${SERVER_PORT}`);
        resolve();
      }
    });
    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Error') || output.includes('error')) {
        console.error(`   Server error: ${output}`);
      }
    });
    serverProcess.on('error', (error) => {
      console.error(`   ❌ Failed to start server: ${error.message}`);
      reject(error);
    });
    setTimeout(resolve, STARTUP_DELAY);
  });
}

function stopServer() {
  if (serverProcess) {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

/**
 * BULLETPROOF: Completely rewrite the <head> section with correct meta tags
 */
function fixHeadSection(html, pageConfig) {
  const pageUrl = pageConfig.url;
  const isHomePage = pageUrl === '/';
  const fullUrl = `https://microjpeg.com${pageUrl === '/' ? '' : pageUrl}`;
  
  // Extract the page-specific title from the rendered content
  // Look for H1 tag content as fallback
  let pageTitle = 'MicroJPEG';
  let pageDescription = 'Free online image compression and conversion tool.';
  
  // Try to find H1 in the body
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    // Clean up the H1 text
    pageTitle = h1Match[1]
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
    
    // Truncate if too long
    if (pageTitle.length > 60) {
      pageTitle = pageTitle.substring(0, 57) + '...';
    }
  }
  
  // Generate description based on page type
  if (pageUrl.startsWith('/convert/')) {
    const conversion = pageUrl.replace('/convert/', '');
    const [from, to] = conversion.split('-to-');
    pageDescription = `Convert ${from.toUpperCase()} to ${to.toUpperCase()} online for free. Fast, secure, and high-quality image conversion. No signup required.`;
    if (!pageTitle.includes(from.toUpperCase())) {
      pageTitle = `Convert ${from.toUpperCase()} to ${to.toUpperCase()} Online | Free Converter`;
    }
  } else if (pageUrl.startsWith('/compress/')) {
    const format = pageUrl.replace('/compress/', '').split('-')[0];
    pageDescription = `Compress ${format.toUpperCase()} images online for free. Reduce file size up to 90% without losing quality.`;
    if (!pageTitle.includes('Compress')) {
      pageTitle = `Compress ${format.toUpperCase()} Images Online | Free Compressor`;
    }
  } else if (pageUrl === '/') {
    pageTitle = 'MicroJPEG - Smart Image Compression & Conversion | Free Online Tool';
    pageDescription = 'Free online image compression and conversion tool. Compress JPG, PNG, WEBP up to 90% smaller. Convert RAW files (CR2, NEF, ARW) to JPG, PNG, WEBP. No signup required.';
  }
  
  // Remove ALL existing meta tags that we'll replace
  // Remove title
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
  
  // Remove canonical
  html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
  
  // Remove description
  html = html.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, '');
  
  // Remove keywords
  html = html.replace(/<meta[^>]*name=["']keywords["'][^>]*>/gi, '');
  
  // Remove all OG tags
  html = html.replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi, '');
  
  // Remove all Twitter tags
  html = html.replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi, '');
  
  // Build new meta tags
  const newMetaTags = `
    <title>${pageTitle}</title>
    <link rel="canonical" href="${fullUrl}">
    <meta name="description" content="${pageDescription}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${pageDescription}">
    <meta property="og:image" content="https://microjpeg.com/og-image.jpg">
    <meta property="og:site_name" content="MicroJPEG">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${pageTitle}">
    <meta name="twitter:description" content="${pageDescription}">
    <meta name="twitter:image" content="https://microjpeg.com/og-image.jpg">
`;
  
  // Insert new meta tags right after <head>
  html = html.replace(/<head>/i, `<head>${newMetaTags}`);
  
  return html;
}

async function generatePage(browser, pageConfig) {
  const fullUrl = `${SERVER_URL}${pageConfig.url}`;
  console.log(`\n📄 Generating: ${pageConfig.name}`);
  console.log(`   URL: ${fullUrl}`);

  const page = await browser.newPage();

  try {
    await page.setUserAgent('Mozilla/5.0 (compatible; MicroJPEG-SEO-Generator/1.0)');
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate and wait for network to be idle
    await page.goto(fullUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for React to render
    console.log(`   ⏳ Waiting for React to render...`);
    
    // Wait for #root to have children
    await page.waitForFunction(
      () => document.querySelector('#root')?.children.length > 0,
      { timeout: 30000 }
    ).catch(() => console.log('   ⚠️ Root children timeout'));

    // Wait for H1
    await page.waitForSelector('h1', { timeout: 15000 })
      .then(() => console.log('   ✅ H1 found'))
      .catch(() => console.log('   ⚠️ No H1 found'));

    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the HTML
    let html = await page.content();

    // ============================================================
    // BULLETPROOF FIX: Completely rewrite the <head> section
    // ============================================================
    console.log(`   🔧 Fixing meta tags...`);
    html = fixHeadSection(html, pageConfig);

    // Validate
    const expectedCanonical = `https://microjpeg.com${pageConfig.url === '/' ? '' : pageConfig.url}`;
    const hasCorrectCanonical = html.includes(`href="${expectedCanonical}"`);
    const hasH1 = /<h1[^>]*>/i.test(html);
    const linkCount = (html.match(/href=["']\/(convert|compress)\//gi) || []).length;

    console.log(`   📋 Validation:`);
    console.log(`      Canonical: ${hasCorrectCanonical ? '✅' : '❌'} ${expectedCanonical}`);
    console.log(`      H1: ${hasH1 ? '✅' : '❌'}`);
    console.log(`      Internal links: ${linkCount}`);

    // Save
    const outputPath = path.join(OUTPUT_DIR, pageConfig.output);
    fs.writeFileSync(outputPath, html, 'utf8');

    const stats = fs.statSync(outputPath);
    console.log(`   ✅ Saved: ${pageConfig.output} (${(stats.size / 1024).toFixed(2)} KB)`);

    await page.close();
    return { success: true };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    await page.close();
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   SEO Static HTML Generator - BULLETPROOF VERSION          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
    }

    if (IS_BUILD) {
      await startServer();
    } else {
      console.log(`🔗 Connecting to: ${SERVER_URL}\n`);
    }

    await waitForServer();

    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    let successCount = 0;
    let failCount = 0;

    for (const pageConfig of SEO_PAGES) {
      const result = await generatePage(browser, pageConfig);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      // Small delay between pages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await browser.close();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    GENERATION COMPLETE                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Success: ${successCount} pages`);
    console.log(`❌ Failed: ${failCount} pages`);
    console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    stopServer();
  }
}

main();
