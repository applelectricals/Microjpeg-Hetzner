#!/usr/bin/env node

/**
 * SEO Static HTML Generator
 * 
 * This script generates static HTML for SEO pages by:
 * 1. Starting the production server
 * 2. Using Puppeteer to render each page
 * 3. Saving the fully-rendered HTML to dist/seo/
 * 
 * FIXED: Now properly waits for canonical URLs and meta tags to be set
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

// If SEO_BUILD=true, we're running inside a build and want localhost
// Otherwise (local dev), you can still point to your live domain if you want.
const IS_BUILD = process.env.SEO_BUILD === 'true';

const SERVER_URL = IS_BUILD
  ? `http://127.0.0.1:${SERVER_PORT}`
  : (process.env.SEO_SERVER_URL || 'https://microjpeg.com');

// Adjust as needed – this is your final build output
const OUTPUT_DIR = path.join(__dirname, '../dist/seo');

const STARTUP_DELAY = 15000; // Wait 15s for server to start (increased for build environment)
const MAX_RETRIES = 3; // Number of times to retry connecting to server

// Pages to pre-render for SEO
const SEO_PAGES = [
  {
    url: '/',
    output: 'index.html',
    name: 'Landing Page',
    expectedCanonical: 'https://microjpeg.com'
  },
  {
    url: '/about',
    output: 'about.html',
    name: 'About Page',
    expectedCanonical: 'https://microjpeg.com/about'
  },
  {
    url: '/contact',
    output: 'contact.html',
    name: 'Contact Page',
    expectedCanonical: 'https://microjpeg.com/contact'
  },
  {
    url: '/privacy-policy',
    output: 'privacy-policy.html',
    name: 'Privacy Policy',
    expectedCanonical: 'https://microjpeg.com/privacy-policy'
  },
  {
    url: '/terms-of-service',
    output: 'terms-of-service.html',
    name: 'Terms of Service',
    expectedCanonical: 'https://microjpeg.com/terms-of-service'
  },
  {
    url: '/cancellation-policy',
    output: 'cancellation-policy.html',
    name: 'Cancellation Policy',
    expectedCanonical: 'https://microjpeg.com/cancellation-policy'
  },
  {
    url: '/tools',
    output: 'tools.html',
    name: 'Tools Page',
    expectedCanonical: 'https://microjpeg.com/tools'
  },
  {
    url: '/tools/compress',
    output: 'tools-compress.html',
    name: 'Tools Compress',
    expectedCanonical: 'https://microjpeg.com/tools/compress'
  },
  {
    url: '/tools/convert',
    output: 'tools-convert.html',
    name: 'Tools Convert',
    expectedCanonical: 'https://microjpeg.com/tools/convert'
  },
  {
    url: '/tools/optimizer',
    output: 'tools-optimizer.html',
    name: 'Tools Optimizer',
    expectedCanonical: 'https://microjpeg.com/tools/optimizer'
  },
  {
    url: '/api-docs#overview',
    output: 'api-docs-overview.html',
    name: 'API Overview',
    expectedCanonical: 'https://microjpeg.com/api-docs'
  },
  {
    url: '/api-docs#how-it-works',
    output: 'api-docs-how-it-works.html',
    name: 'API How It Works',
    expectedCanonical: 'https://microjpeg.com/api-docs'
  },
  {
    url: '/api-docs#api-vs-web',
    output: 'api-docs-api-vs-web.html',
    name: 'API vs Web',
    expectedCanonical: 'https://microjpeg.com/api-docs'
  },
  {
    url: '/api-docs#documentation',
    output: 'api-docs-documentation.html',
    name: 'API Documentation',
    expectedCanonical: 'https://microjpeg.com/api-docs'
  },
  {
    url: '/wordpress-plugin',
    output: 'wordpress-plugin.html',
    name: 'WordPress Plugin',
    expectedCanonical: 'https://microjpeg.com/wordpress-plugin'
  },
  {
    url: '/wordpress-plugin/install',
    output: 'wordpress-plugin-install.html',
    name: 'WordPress Plugin Install',
    expectedCanonical: 'https://microjpeg.com/wordpress-plugin/install'
  },
  {
    url: '/wordpress-plugin/docs',
    output: 'wordpress-plugin-docs.html',
    name: 'WordPress Plugin Docs',
    expectedCanonical: 'https://microjpeg.com/wordpress-plugin/docs'
  },
  {
    url: '/pricing',
    output: 'pricing.html',
    name: 'Pricing',
    expectedCanonical: 'https://microjpeg.com/pricing'
  },
  {
    url: '/features',
    output: 'features.html',
    name: 'Features',
    expectedCanonical: 'https://microjpeg.com/features'
  },
  {
    url: '/legal/cookies',
    output: 'legal-cookies.html',
    name: 'Cookie Policy',
    expectedCanonical: 'https://microjpeg.com/legal/cookies'
  },
  // ========================================
  // AI TOOLS PAGES - NEW
  // ========================================
  {
    url: '/remove-background',
    output: 'remove-background.html',
    name: 'AI Background Remover',
    expectedCanonical: 'https://microjpeg.com/remove-background'
  },
  {
    url: '/enhance-image',
    output: 'enhance-image.html',
    name: 'AI Image Enhancer',
    expectedCanonical: 'https://microjpeg.com/enhance-image'
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
    name: `Blog: ${slug}`,
    expectedCanonical: `https://microjpeg.com/blog/${slug}`
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

  const pagePath = isSelfCompression ? '/compress/' : '/convert/';

  // Extract format name from conversion (e.g., 'jpg-to-jpg' -> 'jpg')
  const format = isSelfCompression ? conversion.split('-')[0] : null;
  const outputFile = isSelfCompression ? `compress-${format}.html` : `convert-${conversion}.html`;
  
  // Build the expected canonical URL
  const expectedCanonical = isSelfCompression 
    ? `https://microjpeg.com/compress/${format}`
    : `https://microjpeg.com/convert/${conversion}`;

  SEO_PAGES.push({
    url: `${pagePath}${conversion}`,
    output: outputFile,
    name: `${isSelfCompression ? 'Compress' : 'Convert'}: ${conversion}`,
    expectedCanonical: expectedCanonical
  });
});

console.log(`\n📊 Total SEO pages to generate: ${SEO_PAGES.length}`);
console.log(`   - Core pages: 22 (includes tools, pricing, features, WordPress, API docs, legal, AI tools)`);
console.log(`   - Blog posts: ${BLOG_POSTS.length}`);
console.log(`   - Conversion pages: 60 (includes svg-to-tiff)`);
console.log(`   - Compression pages: 5`);
console.log(`   - AI Tool pages: 2 (remove-background, enhance-image)`);
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
    console.log('🚀 Starting local server...');
    
    // Use npm run dev or your production server command
    serverProcess = spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: {
        ...process.env,
        PORT: SERVER_PORT
      }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('listening') || output.includes('ready') || output.includes('started')) {
        console.log(`   ✅ Server started on port ${SERVER_PORT}`);
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      // Don't log all stderr, just errors
      const output = data.toString();
      if (output.includes('Error') || output.includes('error')) {
        console.error(`   Server error: ${output}`);
      }
    });

    serverProcess.on('error', (error) => {
      console.error(`   ❌ Failed to start server: ${error.message}`);
      reject(error);
    });

    // Give server time to start
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
 * Wait for React to render the page AND for SEO tags to be set
 * IMPROVED: Now specifically waits for canonical URL to match expected value
 */
async function waitForReactRender(page, pageConfig) {
  // Wait for common React render indicators
  try {
    // Wait for the root div to have content
    await page.waitForSelector('#root > *', { timeout: 10000 });
  } catch (e) {
    console.log(`   ⚠️  Root element not found, continuing anyway...`);
  }

  // Wait for SEO tags to be set (canonical URL is critical)
  const expectedCanonical = pageConfig.expectedCanonical;
  
  if (expectedCanonical) {
    let canonicalCorrect = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!canonicalCorrect && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      canonicalCorrect = await page.evaluate((expected) => {
        const canonical = document.querySelector('link[rel="canonical"]');
        return canonical && canonical.getAttribute('href') === expected;
      }, expectedCanonical);
      
      attempts++;
    }
    
    if (!canonicalCorrect) {
      console.log(`   ⚠️  Canonical URL not set correctly after ${maxAttempts} attempts`);
      console.log(`      Expected: ${expectedCanonical}`);
      
      // Get actual canonical for debugging
      const actualCanonical = await page.evaluate(() => {
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.getAttribute('href') : 'NOT FOUND';
      });
      console.log(`      Actual: ${actualCanonical}`);
      
      // FORCE FIX: Inject correct canonical if it's wrong
      await page.evaluate((correctCanonical) => {
        // Remove all existing canonicals
        document.querySelectorAll('link[rel="canonical"]').forEach(l => l.remove());
        
        // Add correct one
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = correctCanonical;
        document.head.appendChild(link);
      }, expectedCanonical);
      
      console.log(`   ✅ Injected correct canonical URL`);
    }
  }

  // Additional wait for other dynamic content
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Check if the page has meaningful content (not just empty shell)
  const hasContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return false;
    
    // Check if root has substantial content
    const textContent = root.innerText || '';
    const childCount = root.querySelectorAll('*').length;
    
    // Page should have more than just a header
    return textContent.length > 100 && childCount > 10;
  });

  if (!hasContent) {
    console.log(`   ⚠️  Page appears to have minimal content, waiting longer...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return hasContent;
}

/**
 * Generate HTML for a single page
 */
async function generatePageHTML(browser, page, pageConfig) {
  const fullUrl = `${SERVER_URL}${pageConfig.url}`;

  console.log(`\n📄 Generating: ${pageConfig.name}`);
  console.log(`   URL: ${fullUrl}`);

  let html = null;

  // Navigate to page with proper wait conditions
  try {
    // KEY FIX: Use 'networkidle0' or 'networkidle2' instead of 'domcontentloaded'
    // networkidle0: Wait until there are no network connections for 500ms
    // networkidle2: Wait until there are ≤2 network connections for 500ms
    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',  // Changed from 'domcontentloaded'
      timeout: 30000              // Increased timeout to 30s
    });

    // Wait for React to fully render the page content AND SEO tags
    const hasContent = await waitForReactRender(page, pageConfig);
    
    if (!hasContent) {
      console.log(`   ⚠️  Content may be incomplete`);
    }

    // Get the fully rendered HTML
    html = await page.content();

  } catch (navError) {
    console.log(`   ⚠️  Navigation warning: ${navError.message}`);
    
    // Try to get whatever content is available
    try {
      // Even if navigation failed, wait a bit and try to get content
      await new Promise(resolve => setTimeout(resolve, 5000));
      html = await page.content();
    } catch (contentError) {
      console.log(`   ⚠️  Could not get page content: ${contentError.message}`);
    }
  }

  // Validate the HTML has actual content
  if (html) {
    const contentLength = html.length;
    const hasBody = html.includes('<main') || html.includes('<article') || 
                    html.includes('class="content"') || html.includes('<h1');
    
    // Verify canonical URL in final HTML
    const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/);
    const actualCanonical = canonicalMatch ? canonicalMatch[1] : 'NOT FOUND';
    
    if (pageConfig.expectedCanonical && actualCanonical !== pageConfig.expectedCanonical) {
      console.log(`   ⚠️  Final HTML has wrong canonical: ${actualCanonical}`);
      console.log(`      Expected: ${pageConfig.expectedCanonical}`);
      
      // Fix the HTML directly
      if (canonicalMatch) {
        html = html.replace(canonicalMatch[0], `<link rel="canonical" href="${pageConfig.expectedCanonical}">`);
      } else {
        // No canonical found, inject one in head
        html = html.replace('</head>', `<link rel="canonical" href="${pageConfig.expectedCanonical}">\n</head>`);
      }
      console.log(`   ✅ Fixed canonical in output HTML`);
    }
    
    if (contentLength < 5000 || !hasBody) {
      console.log(`   ⚠️  HTML seems incomplete (${contentLength} bytes, hasBody: ${hasBody})`);
      console.log(`   🔄 Retrying with longer wait...`);
      
      // Retry with longer wait
      try {
        await page.goto(fullUrl, {
          waitUntil: 'networkidle0',
          timeout: 45000
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        html = await page.content();
        console.log(`   ✅ Retry successful (${html.length} bytes)`);
      } catch (retryError) {
        console.log(`   ⚠️  Retry failed: ${retryError.message}`);
      }
    }
  }

  // If still no good HTML, create fallback
  if (!html || html.length < 1000) {
    console.log(`   ❌ Failed to get valid HTML, creating fallback`);
    html = `<!DOCTYPE html>
<html>
<head>
  <title>${pageConfig.name} - MicroJPEG</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="${pageConfig.expectedCanonical || fullUrl}">
</head>
<body>
  <h1>${pageConfig.name}</h1>
  <p>Page loaded from: ${fullUrl}</p>
  <p>Please visit <a href="${fullUrl}">${fullUrl}</a> for the full content.</p>
</body>
</html>`;
  }

  // Save to file
  const outputPath = path.join(OUTPUT_DIR, pageConfig.output);

  try {
    fs.writeFileSync(outputPath, html, 'utf8');

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

    if (IS_BUILD) {
      // Start local server inside the build container
      await startServer();
      console.log('✅ Local server started for SEO generation\n');
    } else {
      console.log('🔗 Connecting to existing server...');
      console.log(`   URL: ${SERVER_URL}\n`);
    }

    // Wait for server to be ready
    await waitForServer();
    console.log('✅ Server is responding\n');

    // Launch Puppeteer with optimized settings
    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',  // Allow cross-origin requests
        '--disable-features=IsolateOrigins,site-per-process'  // Faster rendering
      ]
    });
    console.log('✅ Browser launched\n');

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });

    // Set a realistic user agent (some sites block headless browsers)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Enable JavaScript (should be on by default, but explicit is good)
    await page.setJavaScriptEnabled(true);

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
        file: p.output,
        canonical: p.expectedCanonical
      }))
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Manifest created: manifest.json\n');

    // Stop server
    if (IS_BUILD) {
      stopServer();
    }

    // Exit
    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    if (IS_BUILD) {
      stopServer();
    }
    process.exit(1);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted by user');
  if (IS_BUILD) {
    stopServer();
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Terminated');
  if (IS_BUILD) {
    stopServer();
  }
  process.exit(1);
});

// Run
main();
