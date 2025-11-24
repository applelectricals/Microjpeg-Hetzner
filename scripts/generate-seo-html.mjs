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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVER_PORT = 10000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const OUTPUT_DIR = path.join(__dirname, '../dist/seo');
const STARTUP_DELAY = 5000; // Wait 5s for server to start

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

let serverProcess = null;

/**
 * Start the production server
 */
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting production server...');
    
    // Start the server
    serverProcess = spawn('node', ['dist/index.js'], {
      env: { ...process.env, PORT: SERVER_PORT },
      stdio: 'pipe'
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
    await startServer();
    console.log('✅ Server started\n');

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
    stopServer();

    // Exit
    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    stopServer();
    process.exit(1);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted by user');
  stopServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Terminated');
  stopServer();
  process.exit(1);
});

// Run
main();
