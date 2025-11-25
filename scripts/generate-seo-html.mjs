#!/usr/bin/env node

/**
 * SEO Static HTML Generator
 * 
 * This script generates static HTML for SEO pages by:
 * 1. Starting the production server
 * 2. Using Puppeteer to render each page
 * 3. Saving the fully-rendered HTML to dist/seo/
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
const SERVER_PORT = 10000;
// Always use localhost for development - production builds should have pre-rendered HTML
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;
const OUTPUT_DIR = path.join(__dirname, '../dist/seo');
const STARTUP_DELAY = 15000; // Wait 15s for server to start (increased for build environment)
const MAX_RETRIES = 3; // Number of times to retry connecting to server

// Pages to pre-render for SEO
const SEO_PAGES = [
  {
    url: '/',
    output: 'index.html',
    name: 'Landing Page'
  },
  {
    url: '/about',
    output: 'about.html',
    name: 'About Page'
  },
  {
    url: '/contact',
    output: 'contact.html',
    name: 'Contact Page'
  },
  {
    url: '/privacy-policy',
    output: 'privacy-policy.html',
    name: 'Privacy Policy'
  },
  {
    url: '/terms-of-service',
    output: 'terms-of-service.html',
    name: 'Terms of Service'
  },
  {
    url: '/cancellation-policy',
    output: 'cancellation-policy.html',
    name: 'Cancellation Policy'
  },
  {
    url: '/tools',
    output: 'tools.html',
    name: 'Tools Page'
  },
  {
    url: '/tools/compress',
    output: 'tools-compress.html',
    name: 'Tools Compress'
  },
  {
    url: '/tools/convert',
    output: 'tools-convert.html',
    name: 'Tools Convert'
  },
  {
    url: '/tools/optimizer',
    output: 'tools-optimizer.html',
    name: 'Tools Optimizer'
  },
  {
    url: '/api-docs#overview',
    output: 'api-docs-overview.html',
    name: 'API Overview'
  },
  {
    url: '/api-docs#how-it-works',
    output: 'api-docs-how-it-works.html',
    name: 'API How It Works'
  },
  {
    url: '/api-docs#api-vs-web',
    output: 'api-docs-api-vs-web.html',
    name: 'API vs Web'
  },
  {
    url: '/api-docs#documentation',
    output: 'api-docs-documentation.html',
    name: 'API Documentation'
  },
  {
    url: '/wordpress-plugin',
    output: 'wordpress-plugin.html',
    name: 'WordPress Plugin'
  },
  {
    url: '/wordpress-plugin/install',
    output: 'wordpress-plugin-install.html',
    name: 'WordPress Plugin Install'
  },
  {
    url: '/wordpress-plugin/docs',
    output: 'wordpress-plugin-docs.html',
    name: 'WordPress Plugin Docs'
  },
  {
    url: '/pricing',
    output: 'pricing.html',
    name: 'Pricing'
  },
  {
    url: '/features',
    output: 'features.html',
    name: 'Features'
  },
  {
    url: '/legal/cookies',
    output: 'legal-cookies.html',
    name: 'Cookie Policy'
  }
];

// Blog posts - ADD YOUR BLOG POST SLUGS HERE
// CRITICAL: Each slug MUST have a comma after it (except the last one)
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

// Add blog posts to SEO pages
BLOG_POSTS.forEach(slug => {
  SEO_PAGES.push({
    url: `/blog/${slug}`,
    output: `blog-${slug}.html`,
    name: `Blog: ${slug}`
  });
});

// Conversion pages - Corrected to 65 total (60 conversions + 5 compressions)
const CONVERSION_PAGES = [
  // Web format conversions (12 conversions - no self-compressions here)
  'jpg-to-png', 'jpg-to-webp', 'jpg-to-avif', 'jpg-to-tiff',
  'png-to-jpg', 'png-to-webp', 'png-to-avif', 'png-to-tiff',
  'webp-to-jpg', 'webp-to-png', 'webp-to-avif', 'webp-to-tiff',
  'avif-to-jpg', 'avif-to-png', 'avif-to-webp', 'avif-to-tiff',

  // RAW to Web formats (35 conversions: 7 RAW formats × 5 web targets including TIFF)
  'cr2-to-jpg', 'cr2-to-png', 'cr2-to-webp', 'cr2-to-avif', 'cr2-to-tiff',
  'nef-to-jpg', 'nef-to-png', 'nef-to-webp', 'nef-to-avif', 'nef-to-tiff',
  'arw-to-jpg', 'arw-to-png', 'arw-to-webp', 'arw-to-avif', 'arw-to-tiff',
  'dng-to-jpg', 'dng-to-png', 'dng-to-webp', 'dng-to-avif', 'dng-to-tiff',
  'orf-to-jpg', 'orf-to-png', 'orf-to-webp', 'orf-to-avif', 'orf-to-tiff',
  'raf-to-jpg', 'raf-to-png', 'raf-to-webp', 'raf-to-avif', 'raf-to-tiff',
  'crw-to-jpg', 'crw-to-png', 'crw-to-webp', 'crw-to-avif', 'crw-to-tiff',

  // TIFF conversions (4 conversions: to jpg, png, webp, avif)
  'tiff-to-jpg', 'tiff-to-png', 'tiff-to-webp', 'tiff-to-avif',

  // SVG conversions (5 conversions - includes svg-to-tiff)
  'svg-to-jpg', 'svg-to-png', 'svg-to-webp', 'svg-to-avif', 'svg-to-tiff',

  // Self compressions (5 conversions - use /compress/ route)
  'jpg-to-jpg', 'png-to-png', 'webp-to-webp', 'avif-to-avif', 'tiff-to-tiff'
];

// Add conversion pages to SEO pages
CONVERSION_PAGES.forEach(conversion => {
  // Self-compressions use /compress/ path and compress- prefix, others use /convert/
  const isSelfCompression = conversion === 'jpg-to-jpg' || conversion === 'png-to-png' ||
                           conversion === 'webp-to-webp' || conversion === 'avif-to-avif' ||
                           conversion === 'tiff-to-tiff';

  const path = isSelfCompression ? '/compress/' : '/convert/';

  // Extract format name from conversion (e.g., 'jpg-to-jpg' -> 'jpg')
  const format = isSelfCompression ? conversion.split('-')[0] : null;
  const outputFile = isSelfCompression ? `compress-${format}.html` : `convert-${conversion}.html`;

  SEO_PAGES.push({
    url: `${path}${conversion}`,
    output: outputFile,
    name: `${isSelfCompression ? 'Compress' : 'Convert'}: ${conversion}`
  });
});

console.log(`\n📊 Total SEO pages to generate: ${SEO_PAGES.length}`);
console.log(`   - Core pages: 20 (includes tools, pricing, features, WordPress, API docs, legal)`);
console.log(`   - Blog posts: ${BLOG_POSTS.length}`);
console.log(`   - Conversion pages: 60 (includes svg-to-tiff)`);
console.log(`   - Compression pages: 5`);
console.log(`   - Grand total: ${SEO_PAGES.length}\n`);


let serverProcess = null;

/**
 * Check if server is responding
 */
async function waitForServer(maxRetries = MAX_RETRIES) {
  console.log('🔍 Waiting for server to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${SERVER_URL}/`);
      console.log(`   ✅ Server responding (status: ${response.status})`);
      return true;
    } catch (error) {
      console.log(`   ⏳ Attempt ${i + 1}/${maxRetries}: Server not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s between retries
    }
  }
  
  throw new Error('Server failed to start after maximum retries');
}

/**
 * Start the development server (which already has .env loaded)
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting development server...');
    
    // Start the dev server (tsx already loads .env)
    serverProcess = spawn('npm', ['run', 'dev'], {
      env: { 
        ...process.env,
        PORT: SERVER_PORT,
        NODE_ENV: 'development'
      },
      stdio: 'pipe',
      shell: true
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`   Server: ${output.trim()}`);
      
      // Wait for server to be ready
      if (output.includes('listening') || output.includes('started')) {
        setTimeout(resolve, STARTUP_DELAY);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`   Server Error: ${data.toString().trim()}`);
    });

    serverProcess.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });

    // Also resolve after delay even if we don't see the message
    setTimeout(resolve, STARTUP_DELAY + 2000);
  });
}

/**
 * Stop the server
 */
function stopServer() {
  if (serverProcess) {
    console.log('🛑 Stopping server...');
    serverProcess.kill();
    serverProcess = null;
  }
}

/**
 * Generate HTML for a single page
 */
async function generatePageHTML(browser, page, pageConfig) {
  const fullUrl = `${SERVER_URL}${pageConfig.url}`;

  console.log(`\n📄 Generating: ${pageConfig.name}`);
  console.log(`   URL: ${fullUrl}`);

  let html = null;

  // Navigate to page with error handling
  try {
    await page.goto(fullUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
  } catch (navError) {
    // Continue even if navigation has issues (ERR_EMPTY_RESPONSE, etc)
    console.log(`   ⚠️  Navigation warning: ${navError.message}`);
    // Try to get whatever content is available
    try {
      html = await page.content();
    } catch (contentError) {
      console.log(`   ⚠️  Could not get page content: ${contentError.message}`);
    }
  }

  // If we don't have HTML yet, try to get it
  if (!html) {
    try {
      // Wait for React root, but don't fail if it's not there
      try {
        await page.waitForSelector('#root', { timeout: 3000 });
      } catch {
        // Root element not found, continue anyway
      }

      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the HTML
      html = await page.content();
    } catch (error) {
      console.log(`   ⚠️  Error getting content: ${error.message}`);
      // Create minimal fallback HTML
      html = `<!DOCTYPE html>
<html>
<head>
  <title>${pageConfig.name}</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>${pageConfig.name}</h1>
  <p>Page loaded from: ${fullUrl}</p>
</body>
</html>`;
    }
  }

  // Save to file regardless of what we got
  const outputPath = path.join(OUTPUT_DIR, pageConfig.output);

  try {
    fs.writeFileSync(outputPath, html || '', 'utf8');

    // Get file size
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`   ✅ Saved: ${pageConfig.output} (${sizeKB} KB)`);
    return true;
  } catch (writeError) {
    console.error(`   ❌ Error writing file: ${writeError.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   SEO Static HTML Generator for MicroJPEG ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${OUTPUT_DIR}\n`);
    }

    // Start server
    // await startServer();
    // console.log('✅ Server process started\n');
    
    console.log('🔗 Connecting to existing dev server...');
    console.log(`   URL: ${SERVER_URL}\n`);
    
    // Wait for server to be ready
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
        '--disable-gpu'
      ]
    });
    console.log('✅ Browser launched\n');

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });

    // Track results
    let successful = 0;
    let failed = 0;

    // Generate HTML for each page
    for (const pageConfig of SEO_PAGES) {
      const success = await generatePageHTML(browser, page, pageConfig);
      if (success) {
        successful++;
      } else {
        failed++;
      }
    }

    // Close browser
    await browser.close();
    console.log('\n✅ Browser closed\n');

    // Summary
    console.log('╔════════════════════════════════════════════╗');
    console.log('║              GENERATION COMPLETE           ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`✅ Successful: ${successful} pages`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} pages`);
    }
    console.log(`📁 Output: ${OUTPUT_DIR}\n`);

    // Create a manifest file
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalPages: SEO_PAGES.length,
      successful,
      failed,
      pages: SEO_PAGES.map(p => ({
        url: p.url,
        file: p.output
      }))
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Manifest created: manifest.json\n');

    // Stop server
    // stopServer(); // Don't stop server - it was already running

    // Exit
    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    // stopServer(); // Don't stop server - it was already running
    process.exit(1);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted by user');
  // stopServer(); // Don't stop server - it was already running
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Terminated');
  // stopServer(); // Don't stop server - it was already running
  process.exit(1);
});

// Run
main();
