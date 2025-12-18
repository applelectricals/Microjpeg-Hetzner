#!/usr/bin/env node

/**
 * SEO Static HTML Generator - IMPROVED VERSION
 * 
 * This script generates static HTML for SEO pages by:
 * 1. Starting the production server
 * 2. Using Puppeteer to render each page
 * 3. WAITING for React to fully render (H1, meta tags, links)
 * 4. Saving the fully-rendered HTML to dist/seo/
 * 
 * Run: node scripts/generate-seo-html.mjs
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
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
  { url: '/privacy-policy', output: 'privacy-policy.html', name: 'Privacy Policy' },
  { url: '/terms-of-service', output: 'terms-of-service.html', name: 'Terms of Service' },
  { url: '/cancellation-policy', output: 'cancellation-policy.html', name: 'Cancellation Policy' },
  { url: '/tools', output: 'tools.html', name: 'Tools Page' },
  { url: '/tools/compress', output: 'tools-compress.html', name: 'Tools Compress' },
  { url: '/tools/convert', output: 'tools-convert.html', name: 'Tools Convert' },
  { url: '/tools/optimizer', output: 'tools-optimizer.html', name: 'Tools Optimizer' },
  { url: '/api-docs#overview', output: 'api-docs-overview.html', name: 'API Overview' },
  { url: '/api-docs#how-it-works', output: 'api-docs-how-it-works.html', name: 'API How It Works' },
  { url: '/api-docs#api-vs-web', output: 'api-docs-api-vs-web.html', name: 'API vs Web' },
  { url: '/api-docs#documentation', output: 'api-docs-documentation.html', name: 'API Documentation' },
  { url: '/wordpress-plugin', output: 'wordpress-plugin.html', name: 'WordPress Plugin' },
  { url: '/wordpress-plugin/install', output: 'wordpress-plugin-install.html', name: 'WordPress Plugin Install' },
  { url: '/wordpress-plugin/docs', output: 'wordpress-plugin-docs.html', name: 'WordPress Plugin Docs' },
  { url: '/pricing', output: 'pricing.html', name: 'Pricing' },
  { url: '/features', output: 'features.html', name: 'Features' },
  { url: '/legal/cookies', output: 'legal-cookies.html', name: 'Cookie Policy' },
  { url: '/remove-background', output: 'remove-background.html', name: 'AI Background Remover' },
  { url: '/enhance-image', output: 'enhance-image.html', name: 'AI Image Enhancer' }
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
const CONVERSION_PAGES = [
  'jpg-to-png', 'jpg-to-webp', 'jpg-to-avif', 'jpg-to-tiff',
  'png-to-jpg', 'png-to-webp', 'png-to-avif', 'png-to-tiff',
  'webp-to-jpg', 'webp-to-png', 'webp-to-avif', 'webp-to-tiff',
  'avif-to-jpg', 'avif-to-png', 'avif-to-webp', 'avif-to-tiff',
  'cr2-to-jpg', 'cr2-to-png', 'cr2-to-webp', 'cr2-to-avif', 'cr2-to-tiff',
  'nef-to-jpg', 'nef-to-png', 'nef-to-webp', 'nef-to-avif', 'nef-to-tiff',
  'arw-to-jpg', 'arw-to-png', 'arw-to-webp', 'arw-to-avif', 'arw-to-tiff',
  'dng-to-jpg', 'dng-to-png', 'dng-to-webp', 'dng-to-avif', 'dng-to-tiff',
  'orf-to-jpg', 'orf-to-png', 'orf-to-webp', 'orf-to-avif', 'orf-to-tiff',
  'raf-to-jpg', 'raf-to-png', 'raf-to-webp', 'raf-to-avif', 'raf-to-tiff',
  'crw-to-jpg', 'crw-to-png', 'crw-to-webp', 'crw-to-avif', 'crw-to-tiff',
  'tiff-to-jpg', 'tiff-to-png', 'tiff-to-webp', 'tiff-to-avif',
  'svg-to-jpg', 'svg-to-png', 'svg-to-webp', 'svg-to-avif', 'svg-to-tiff',
  'jpg-to-jpg', 'png-to-png', 'webp-to-webp', 'avif-to-avif', 'tiff-to-tiff'
];

CONVERSION_PAGES.forEach(conversion => {
  const isSelfCompression = conversion.split('-to-')[0] === conversion.split('-to-')[1];
  const pagePath = isSelfCompression ? '/compress/' : '/convert/';
  const format = isSelfCompression ? conversion.split('-')[0] : null;
  const outputFile = isSelfCompression ? `compress-${format}.html` : `convert-${conversion}.html`;

  SEO_PAGES.push({
    url: `${pagePath}${conversion}`,
    output: outputFile,
    name: `${isSelfCompression ? 'Compress' : 'Convert'}: ${conversion}`
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
 * IMPROVED: Wait for React to FULLY render with specific element checks
 */
async function waitForReactRender(page, pageConfig) {
  const isConversionPage = pageConfig.url.includes('/convert/') || pageConfig.url.includes('/compress/');
  const isHomePage = pageConfig.url === '/';
  
  console.log(`   ⏳ Waiting for React to render...`);
  
  // Step 1: Wait for root element to have children
  try {
    await page.waitForSelector('#root > *', { timeout: 15000 });
  } catch (e) {
    console.log(`   ⚠️  Root element not found`);
  }

  // Step 2: Wait for H1 tag to appear (critical for SEO)
  try {
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log(`   ✅ H1 tag found`);
  } catch (e) {
    console.log(`   ⚠️  H1 tag not found within timeout`);
  }

  // Step 3: Wait for canonical link to be set (critical for SEO)
  let canonicalAttempts = 0;
  const maxCanonicalAttempts = 20;
  
  while (canonicalAttempts < maxCanonicalAttempts) {
    const canonical = await page.evaluate(() => {
      const link = document.querySelector('link[rel="canonical"]');
      return link ? link.getAttribute('href') : null;
    });
    
    if (canonical && canonical !== 'https://microjpeg.com/' && !isHomePage) {
      console.log(`   ✅ Canonical set: ${canonical}`);
      break;
    } else if (canonical && isHomePage) {
      console.log(`   ✅ Canonical set: ${canonical}`);
      break;
    }
    
    canonicalAttempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Step 4: Wait for internal links (ButtonsSection) on conversion pages
  if (isConversionPage) {
    try {
      // Wait for either the details element or the hidden nav
      await page.waitForSelector('details summary, nav[aria-label="All conversion tools"]', { timeout: 10000 });
      
      // Count internal links
      const linkCount = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href^="/convert/"], a[href^="/compress/"]');
        return links.length;
      });
      
      console.log(`   ✅ Found ${linkCount} internal conversion links`);
    } catch (e) {
      console.log(`   ⚠️  ButtonsSection links not found`);
    }
  }

  // Step 5: Wait for meta description
  try {
    await page.waitForFunction(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta && meta.getAttribute('content') && meta.getAttribute('content').length > 50;
    }, { timeout: 8000 });
    console.log(`   ✅ Meta description set`);
  } catch (e) {
    console.log(`   ⚠️  Meta description not found or too short`);
  }

  // Step 6: Wait for Open Graph tags
  try {
    await page.waitForFunction(() => {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      return ogTitle && ogTitle.getAttribute('content');
    }, { timeout: 5000 });
    console.log(`   ✅ Open Graph tags set`);
  } catch (e) {
    console.log(`   ⚠️  Open Graph tags not found`);
  }

  // Step 7: Additional wait for any remaining async content
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Validate final content
  const validation = await page.evaluate(() => {
    return {
      hasH1: !!document.querySelector('h1'),
      h1Text: document.querySelector('h1')?.innerText?.substring(0, 50) || 'NONE',
      hasCanonical: !!document.querySelector('link[rel="canonical"]'),
      canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'NONE',
      hasMetaDesc: !!document.querySelector('meta[name="description"]'),
      hasOgTitle: !!document.querySelector('meta[property="og:title"]'),
      hasOgDesc: !!document.querySelector('meta[property="og:description"]'),
      hasOgImage: !!document.querySelector('meta[property="og:image"]'),
      internalLinkCount: document.querySelectorAll('a[href^="/convert/"], a[href^="/compress/"]').length,
      bodyLength: document.body.innerText.length,
    };
  });

  console.log(`   📋 Validation: H1="${validation.h1Text}" | Links=${validation.internalLinkCount} | Body=${validation.bodyLength} chars`);
  
  return validation;
}

/**
 * Generate HTML for a single page with validation
 */
async function generatePageHTML(browser, page, pageConfig) {
  const fullUrl = `${SERVER_URL}${pageConfig.url}`;
  
  console.log(`\n📄 Generating: ${pageConfig.name}`);
  console.log(`   URL: ${fullUrl}`);

  try {
    // Navigate with longer timeout
    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    // Wait for React to fully render
    const validation = await waitForReactRender(page, pageConfig);

    // Get the rendered HTML
    let html = await page.content();

    // ============================================================
    // POST-PROCESSING: Fix meta tags in the captured HTML
    // The index.html has hardcoded homepage meta tags that need
    // to be replaced with the correct page-specific ones.
    // ============================================================
    
    const isHomePage = pageConfig.url === '/';
    const isConversionPage = pageConfig.url.includes('/convert/');
    const isCompressPage = pageConfig.url.includes('/compress/');
    
    // Get the correct values from the rendered page
    const correctMeta = await page.evaluate(() => {
      // Find the LAST (most recent) canonical - that's the one SEOHead added
      const canonicals = document.querySelectorAll('link[rel="canonical"]');
      const lastCanonical = canonicals[canonicals.length - 1];
      
      // Find the LAST title
      const titles = document.querySelectorAll('title');
      const lastTitle = titles[titles.length - 1];
      
      // Find meta description (SEOHead adds with specific pattern)
      const metaDescs = document.querySelectorAll('meta[name="description"]');
      const lastMetaDesc = metaDescs[metaDescs.length - 1];
      
      // Find OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      
      return {
        canonical: lastCanonical?.getAttribute('href') || null,
        title: lastTitle?.innerText || null,
        description: lastMetaDesc?.getAttribute('content') || null,
        ogTitle: ogTitle?.getAttribute('content') || null,
        ogDesc: ogDesc?.getAttribute('content') || null,
        ogUrl: ogUrl?.getAttribute('content') || null,
      };
    });
    
    console.log(`   🔧 Post-processing: Fixing meta tags...`);
    
    // Remove ALL existing canonical links and add the correct one
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
    const expectedCanonical = `https://microjpeg.com${pageConfig.url === '/' ? '' : pageConfig.url}`;
    html = html.replace('</head>', `<link rel="canonical" href="${expectedCanonical}">\n</head>`);
    
    // Fix title tag - remove old, keep correct
    if (correctMeta.title && !isHomePage) {
      // Remove the hardcoded homepage title
      html = html.replace(/<title>MicroJPEG - Smart Image Compression Made Easy \| Reduce File Size by 90%<\/title>/gi, '');
      // If title is now missing, add the correct one
      if (!html.includes('<title>')) {
        html = html.replace('</head>', `<title>${correctMeta.title}</title>\n</head>`);
      }
    }
    
    // Fix meta description - remove homepage one, keep page-specific
    if (!isHomePage) {
      // Remove the hardcoded homepage description
      html = html.replace(/<meta[^>]*name=["']description["'][^>]*content=["']Best free JPEG compression tool online[^"']*["'][^>]*>/gi, '');
    }
    
    // Remove duplicate meta keywords (homepage specific)
    if (!isHomePage) {
      html = html.replace(/<meta[^>]*name=["']keywords["'][^>]*content=["']JPEG compression tool[^"']*["'][^>]*>/gi, '');
    }
    
    // Fix OG tags - remove homepage ones
    if (!isHomePage) {
      // Remove homepage OG title
      html = html.replace(/<meta[^>]*property=["']og:title["'][^>]*content=["']MicroJPEG - Smart Image Compression Made Easy[^"']*["'][^>]*>/gi, '');
      // Remove homepage OG description  
      html = html.replace(/<meta[^>]*property=["']og:description["'][^>]*content=["']Smart image compression made easy[^"']*["'][^>]*>/gi, '');
    }
    
    console.log(`   ✅ Fixed canonical: ${expectedCanonical}`);
    


    // Validate minimum requirements
    if (!validation.hasH1) {
      console.log(`   ⚠️  WARNING: Page has no H1 tag!`);
    }
    
    if (validation.internalLinkCount < 5 && (isConversionPage || isCompressPage)) {
      console.log(`   ⚠️  WARNING: Page has only ${validation.internalLinkCount} internal links!`);
    }

    // Save to file
    const outputPath = path.join(OUTPUT_DIR, pageConfig.output);
    fs.writeFileSync(outputPath, html, 'utf8');

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`   ✅ Saved: ${pageConfig.output} (${sizeKB} KB)`);
    return { success: true, validation };

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   SEO Static HTML Generator for MicroJPEG (IMPROVED)       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
    }

    if (IS_BUILD) {
      await startServer();
      console.log('✅ Local server started for SEO generation\n');
    } else {
      console.log(`🔗 Connecting to: ${SERVER_URL}\n`);
    }

    await waitForServer();
    console.log('✅ Server is responding\n');

    // Launch Puppeteer
    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    console.log('✅ Browser launched\n');

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setJavaScriptEnabled(true);

    // Track results
    let successful = 0;
    let failed = 0;
    const issues = [];

    // Generate HTML for each page
    for (const pageConfig of SEO_PAGES) {
      const result = await generatePageHTML(browser, page, pageConfig);
      if (result.success) {
        successful++;
        
        // Track pages with potential issues
        if (result.validation && !result.validation.hasH1) {
          issues.push({ page: pageConfig.name, issue: 'Missing H1' });
        }
        if (result.validation && result.validation.internalLinkCount < 5 && 
            (pageConfig.url.includes('/convert/') || pageConfig.url.includes('/compress/'))) {
          issues.push({ page: pageConfig.name, issue: `Only ${result.validation.internalLinkCount} links` });
        }
      } else {
        failed++;
      }
    }

    await browser.close();
    console.log('\n✅ Browser closed\n');

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    GENERATION COMPLETE                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Successful: ${successful} pages`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} pages`);
    }
    
    if (issues.length > 0) {
      console.log(`\n⚠️  Pages with potential SEO issues:`);
      issues.forEach(i => console.log(`   - ${i.page}: ${i.issue}`));
    }
    
    console.log(`\n📁 Output: ${OUTPUT_DIR}\n`);

    // Create manifest
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalPages: SEO_PAGES.length,
      successful,
      failed,
      issues,
      pages: SEO_PAGES.map(p => ({ url: p.url, file: p.output }))
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Manifest created: manifest.json\n');

    if (IS_BUILD) {
      stopServer();
    }

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    if (IS_BUILD) {
      stopServer();
    }
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted by user');
  if (IS_BUILD) stopServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Terminated');
  if (IS_BUILD) stopServer();
  process.exit(1);
});

main();
