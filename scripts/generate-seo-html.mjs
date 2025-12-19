#!/usr/bin/env node

/**
 * SEO Static HTML Generator - LIVE SITE VERSION
 * 
 * This script generates static HTML by fetching from the LIVE production site
 * instead of trying to start a local server (which fails in Docker builds).
 * 
 * If the live site is not reachable, it skips gracefully so the build continues.
 * 
 * Run manually after deployment:
 *   node scripts/generate-seo-html.mjs
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - ALWAYS use the live site
const SERVER_URL = process.env.SEO_SERVER_URL || 'https://microjpeg.com';
const OUTPUT_DIR = path.join(__dirname, '../dist/seo');

console.log(`\n🌐 SEO Generator will fetch from: ${SERVER_URL}\n`);

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

console.log(`📊 Total SEO pages to generate: ${SEO_PAGES.length}\n`);

/**
 * BULLETPROOF: Completely rewrite the <head> section with correct meta tags
 */
function fixHeadSection(html, pageConfig) {
  const pageUrl = pageConfig.url;
  const fullUrl = `https://microjpeg.com${pageUrl === '/' ? '' : pageUrl}`;
  
  // Extract title from H1 if possible
  let pageTitle = 'MicroJPEG';
  let pageDescription = 'Free online image compression and conversion tool.';
  
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    pageTitle = h1Match[1]
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageTitle.length > 60) {
      pageTitle = pageTitle.substring(0, 57) + '...';
    }
  }
  
  // Generate description based on page type
  if (pageUrl.startsWith('/convert/')) {
    const conversion = pageUrl.replace('/convert/', '');
    const [from, to] = conversion.split('-to-');
    pageDescription = `Convert ${from.toUpperCase()} to ${to.toUpperCase()} online for free. Fast, secure, and high-quality image conversion. No signup required.`;
    if (!pageTitle.toLowerCase().includes(from.toLowerCase())) {
      pageTitle = `Convert ${from.toUpperCase()} to ${to.toUpperCase()} Online | Free Converter`;
    }
  } else if (pageUrl.startsWith('/compress/')) {
    const format = pageUrl.replace('/compress/', '').split('-')[0];
    pageDescription = `Compress ${format.toUpperCase()} images online for free. Reduce file size up to 90% without losing quality.`;
    if (!pageTitle.toLowerCase().includes('compress')) {
      pageTitle = `Compress ${format.toUpperCase()} Images Online | Free Compressor`;
    }
  } else if (pageUrl === '/') {
    pageTitle = 'MicroJPEG - Smart Image Compression & Conversion | Free Online Tool';
    pageDescription = 'Free online image compression and conversion tool. Compress JPG, PNG, WEBP up to 90% smaller. Convert RAW files (CR2, NEF, ARW) to JPG, PNG, WEBP. No signup required.';
  }
  
  // Remove ALL existing meta tags
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, '');
  html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, '');
  html = html.replace(/<meta[^>]*name=["']keywords["'][^>]*>/gi, '');
  html = html.replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi, '');
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
  
  // Insert after <head>
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

    // Navigate with longer timeout for live site
    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 90000
    });

    // Wait for React
    console.log(`   ⏳ Waiting for React...`);
    
    await page.waitForFunction(
      () => document.querySelector('#root')?.children.length > 0,
      { timeout: 30000 }
    ).catch(() => {});

    await page.waitForSelector('h1', { timeout: 15000 })
      .then(() => console.log('   ✅ H1 found'))
      .catch(() => console.log('   ⚠️ No H1'));

    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 2000));

    let html = await page.content();

    // Fix meta tags
    console.log(`   🔧 Fixing meta tags...`);
    html = fixHeadSection(html, pageConfig);

    // Validate
    const expectedCanonical = `https://microjpeg.com${pageConfig.url === '/' ? '' : pageConfig.url}`;
    const hasCorrectCanonical = html.includes(`href="${expectedCanonical}"`);
    const hasH1 = /<h1[^>]*>/i.test(html);
    const linkCount = (html.match(/href=["']\/(convert|compress)\//gi) || []).length;

    console.log(`   📋 Canonical: ${hasCorrectCanonical ? '✅' : '❌'} | H1: ${hasH1 ? '✅' : '❌'} | Links: ${linkCount}`);

    // Save
    const outputPath = path.join(OUTPUT_DIR, pageConfig.output);
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`   ✅ Saved: ${pageConfig.output} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);

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
  console.log('║   SEO Static HTML Generator - LIVE SITE VERSION            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if we can reach the live site
  console.log(`🔍 Testing connection to ${SERVER_URL}...`);
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) {
      console.log(`⚠️ Warning: ${SERVER_URL} returned status ${response.status}`);
    } else {
      console.log(`✅ Live site is reachable\n`);
    }
  } catch (error) {
    console.log(`❌ Cannot reach ${SERVER_URL}: ${error.message}`);
    console.log(`\n⚠️ SEO generation requires the live site to be accessible.`);
    console.log(`   Skipping SEO generation - deploy first, then run manually:`);
    console.log(`   node scripts/generate-seo-html.mjs\n`);
    
    // Create a placeholder file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'README.txt'),
      'SEO files not generated during build.\nRun "node scripts/generate-seo-html.mjs" after deployment.'
    );
    process.exit(0); // Exit cleanly, don't fail the build
  }

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
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  await browser.close();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    GENERATION COMPLETE                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Success: ${successCount} pages`);
  console.log(`❌ Failed: ${failCount} pages`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
