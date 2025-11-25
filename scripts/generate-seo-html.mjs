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
// const SERVER_PORT = 10000; // Not needed for production
const SERVER_URL = 'https://microjpeg.com'; // Use production server
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
    url: '/convert',
    output: 'convert.html',
    name: 'Conversion Tool'
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

// Conversion pages - ALL format-to-format conversions
const CONVERSION_PAGES = [
  // Web format compressions/conversions (16 conversions)
  'jpg-to-png', 'jpg-to-webp', 'jpg-to-avif', 'jpg-to-tiff',
  'png-to-jpg', 'png-to-webp', 'png-to-avif', 'png-to-tiff',
  'webp-to-jpg', 'webp-to-png', 'webp-to-avif', 'webp-to-tiff',
  'avif-to-jpg', 'avif-to-png', 'avif-to-webp', 'avif-to-tiff',

  // Self compressions (4 conversions)
  'jpg-to-jpg', 'png-to-png', 'webp-to-webp', 'avif-to-avif',

  // RAW to Web formats (40 conversions)
  'cr2-to-jpg', 'cr2-to-png', 'cr2-to-webp', 'cr2-to-avif',
  'nef-to-jpg', 'nef-to-png', 'nef-to-webp', 'nef-to-avif',
  'arw-to-jpg', 'arw-to-png', 'arw-to-webp', 'arw-to-avif',
  'dng-to-jpg', 'dng-to-png', 'dng-to-webp', 'dng-to-avif',
  'orf-to-jpg', 'orf-to-png', 'orf-to-webp', 'orf-to-avif',
  'raf-to-jpg', 'raf-to-png', 'raf-to-webp', 'raf-to-avif',
  'crw-to-jpg', 'crw-to-png', 'crw-to-webp', 'crw-to-avif',

  // TIFF conversions (5 conversions)
  'tiff-to-jpg', 'tiff-to-png', 'tiff-to-webp', 'tiff-to-avif', 'tiff-to-tiff',

  // SVG conversions (5 conversions)
  'svg-to-jpg', 'svg-to-png', 'svg-to-webp', 'svg-to-avif', 'svg-to-tiff'
];

// Add conversion pages to SEO pages
CONVERSION_PAGES.forEach(conversion => {
  // Self-compressions use /compress/ path, others use /convert/
  const isSelfCompression = conversion === 'jpg-to-jpg' || conversion === 'png-to-png' ||
                           conversion === 'webp-to-webp' || conversion === 'avif-to-avif' ||
                           conversion === 'tiff-to-tiff';

  const path = isSelfCompression ? '/compress/' : '/convert/';

  SEO_PAGES.push({
    url: `${path}${conversion}`,
    output: `convert-${conversion}.html`,
    name: `Convert: ${conversion}`
  });
});

console.log(`\n📊 Total SEO pages to generate: ${SEO_PAGES.length}`);
console.log(`   - Core pages: 7`);
console.log(`   - Blog posts: ${BLOG_POSTS.length}`);
console.log(`   - Conversion pages: ${CONVERSION_PAGES.length}`);
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
  
  try {
    // Navigate to page
    await page.goto(fullUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for React to render
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the fully rendered HTML
    const html = await page.content();

    // Verify content was rendered
    if (html.includes('<div id="root"></div>') && !html.includes('MicroJPEG')) {
      console.warn(`   ⚠️  Warning: Page may not have rendered properly`);
    }

    // Save to file
    const outputPath = path.join(OUTPUT_DIR, pageConfig.output);
    fs.writeFileSync(outputPath, html, 'utf8');
    
    // Get file size
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`   ✅ Saved: ${pageConfig.output} (${sizeMB} MB)`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
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
