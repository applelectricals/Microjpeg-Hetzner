// scripts/generate-sitemap.js
// Run at build-time to generate public/sitemap.xml
const fs = require('fs');
const path = require('path');

const HOST = 'https://microjpeg.com';

// --- List of all convert/compress pages you supplied (kept canonical, no trailing slash) ---
const PATHS = [
  '/', '/blog',
  // Webp conversions
  '/convert/webp-to-tiff','/convert/webp-to-jpg','/convert/webp-to-png','/compress/webp-to-webp','/convert/webp-to-avif',
  // TIFF conversions
  '/compress/tiff-to-tiff','/convert/tiff-to-jpg','/convert/tiff-to-png','/convert/tiff-to-webp','/convert/tiff-to-avif',
  // SVG conversions
  '/convert/svg-to-tiff','/convert/svg-to-jpg','/convert/svg-to-png','/convert/svg-to-webp','/convert/svg-to-avif',
  // RAF
  '/convert/raf-to-jpg','/convert/raf-to-png','/convert/raf-to-tiff','/convert/raf-to-webp','/convert/raf-to-avif',
  // ORF
  '/convert/orf-to-jpg','/convert/orf-to-png','/convert/orf-to-tiff','/convert/orf-to-webp','/convert/orf-to-avif',
  // NEF
  '/convert/nef-to-jpg','/convert/nef-to-png','/convert/nef-to-tiff','/convert/nef-to-webp','/convert/nef-to-avif',
  // DNG
  '/convert/dng-to-jpg','/convert/dng-to-png','/convert/dng-to-tiff','/convert/dng-to-webp','/convert/dng-to-avif',
  // CRW
  '/convert/crw-to-jpg','/convert/crw-to-png','/convert/crw-to-tiff','/convert/crw-to-webp','/convert/crw-to-avif',
  // CR2
  '/convert/cr2-to-jpg','/convert/cr2-to-png','/convert/cr2-to-tiff','/convert/cr2-to-webp','/convert/cr2-to-avif',
  // ARW
  '/convert/arw-to-jpg','/convert/arw-to-png','/convert/arw-to-tiff','/convert/arw-to-webp','/convert/arw-to-avif',
  // PNG/JPG/AVIF conversions
  '/convert/png-to-tiff','/convert/png-to-jpg','/compress/png-to-png','/convert/png-to-webp','/convert/png-to-avif',
  '/convert/jpg-to-tiff','/compress/jpg-to-jpg','/convert/jpg-to-png','/convert/jpg-to-webp','/convert/jpg-to-avif',
  '/convert/avif-to-tiff','/compress/avif-to-avif','/convert/avif-to-jpg','/convert/avif-to-png','/convert/avif-to-webp',

  // compress pages - canonical
  '/compress/jpg','/compress/png','/compress/webp','/compress/avif','/compress/tiff',
  // other helpful pages (adjust to your site)
  '/features','/contact','/about','/pricing','/tools','/tools/convert','/tools/compress'
];

// Optional: dedupe just in case
const uniquePaths = Array.from(new Set(PATHS));

// Build XML
const urlset = uniquePaths.map(p => {
  return `
  <url>
    <loc>${HOST}${p}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

// Write to public/sitemap.xml
const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log('Generated sitemap at', outPath);
