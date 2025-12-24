
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_URL = 'https://microjpeg.com';
const OUTPUT_DIR = path.join(__dirname, '../dist/seo-debug');

// Only test one page
const PAGE = { url: '/convert/jpg-to-png', output: 'debug-convert-jpg-to-png.html', name: 'Debug Page' };

function fixHeadSection(html, pageConfig) {
    const pageUrl = pageConfig.url;
    const fullUrl = `https://microjpeg.com${pageUrl === '/' ? '' : pageUrl}`;

    // CHECK: Does the page already have a good title?
    const existingTitle = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const hasGoodTitle = existingTitle && !existingTitle.includes('Vite') && !existingTitle.includes('React');

    // CHECK: Does it have a description?
    const hasDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(html);

    // If we have good metadata from React, TRUST IT! 
    // Only normalize the Canonical URL.
    if (hasGoodTitle && hasDescription) {
        // Just ensure canonical is correct and absolute
        html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, '');
        const canonicalTag = `<link rel="canonical" href="${fullUrl}">`;
        html = html.replace(/<\/head>/i, `${canonicalTag}\n</head>`);
        return html;
    }
    return html;
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log(`Connecting to ${SERVER_URL}...`);
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    try {
        await page.goto(`${SERVER_URL}${PAGE.url}`, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting for footer...');
        try {
            await page.waitForSelector('footer', { timeout: 10000 });
            console.log('✅ Footer found');
        } catch {
            console.log('❌ Footer NOT found');
        }

        const content = await page.content();
        const fixed = fixHeadSection(content, PAGE);

        fs.writeFileSync(path.join(OUTPUT_DIR, PAGE.output), fixed);
        console.log(`Saved to ${path.join(OUTPUT_DIR, PAGE.output)}`);

        // Check links
        const linkCount = (fixed.match(/href/g) || []).length;
        console.log(`Total links in HTML: ${linkCount}`);

    } catch (e) {
        console.error(e);
    }

    await browser.close();
}

main();
