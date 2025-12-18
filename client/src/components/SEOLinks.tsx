// components/SEOLinks.tsx
// 
// HOW TO USE:
// Add this component inside your existing <footer> element, just before </footer>
// 
// Example:
//   <footer className="...">
//     {/* Your existing footer content */}
//     ...
//     <SEOLinks />  {/* ← Add this line */}
//   </footer>
//

import React from 'react';

// All conversion links
const CONVERSIONS = [
  // RAW to JPG
  '/convert/cr2-to-jpg', '/convert/nef-to-jpg', '/convert/arw-to-jpg',
  '/convert/dng-to-jpg', '/convert/orf-to-jpg', '/convert/raf-to-jpg',
  '/convert/crw-to-jpg', '/convert/rw2-to-jpg',
  // RAW to PNG
  '/convert/cr2-to-png', '/convert/nef-to-png', '/convert/arw-to-png',
  '/convert/dng-to-png', '/convert/orf-to-png', '/convert/raf-to-png',
  '/convert/crw-to-png',
  // RAW to TIFF
  '/convert/cr2-to-tiff', '/convert/nef-to-tiff', '/convert/arw-to-tiff',
  '/convert/dng-to-tiff', '/convert/orf-to-tiff', '/convert/raf-to-tiff',
  '/convert/crw-to-tiff',
  // RAW to WEBP
  '/convert/cr2-to-webp', '/convert/nef-to-webp', '/convert/arw-to-webp',
  '/convert/dng-to-webp', '/convert/orf-to-webp', '/convert/raf-to-webp',
  '/convert/crw-to-webp',
  // RAW to AVIF
  '/convert/cr2-to-avif', '/convert/nef-to-avif', '/convert/arw-to-avif',
  '/convert/dng-to-avif', '/convert/orf-to-avif', '/convert/raf-to-avif',
  '/convert/crw-to-avif',
  // Web formats
  '/convert/jpg-to-webp', '/convert/png-to-webp', '/convert/tiff-to-webp',
  '/convert/jpg-to-avif', '/convert/png-to-avif', '/convert/tiff-to-avif',
  '/convert/webp-to-jpg', '/convert/webp-to-png', '/convert/webp-to-tiff',
  '/convert/avif-to-jpg', '/convert/avif-to-png', '/convert/avif-to-tiff',
  '/convert/webp-to-avif', '/convert/avif-to-webp',
  // Common
  '/convert/png-to-jpg', '/convert/jpg-to-png',
  '/convert/tiff-to-jpg', '/convert/tiff-to-png',
  '/convert/jpg-to-tiff', '/convert/png-to-tiff',
  // SVG
  '/convert/svg-to-jpg', '/convert/svg-to-png', '/convert/svg-to-tiff',
  '/convert/svg-to-webp', '/convert/svg-to-avif',
];

const COMPRESS = [
  '/compress/jpg', '/compress/png', '/compress/webp',
  '/compress/avif', '/compress/tiff',
  '/compress/jpg-to-jpg', '/compress/png-to-png',
  '/compress/webp-to-webp', '/compress/avif-to-avif',
  '/compress/tiff-to-tiff',
];

const MAIN_PAGES = [
  '/', '/about', '/contact', '/pricing', '/features',
  '/tools', '/api-docs', '/wordpress-plugin', '/blog', '/support',
  '/remove-background', '/enhance-image',
];

const LEGAL_PAGES = [
  '/legal/privacy', '/legal/terms', '/legal/cookies',
  '/legal/cancellation', '/legal/payment-protection',
];

export default function SEOLinks() {
  return (
    <>
      {/* ============================================================
          VISIBLE QUICK LINKS SECTION
          Shows popular conversions that users might want
          ============================================================ */}
      <div className="border-t border-gray-300 dark:border-gray-600 pt-6 mt-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
          Popular Conversions
        </h4>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <a href="/convert/cr2-to-jpg" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">CR2→JPG</a>
          <a href="/convert/nef-to-jpg" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">NEF→JPG</a>
          <a href="/convert/arw-to-jpg" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">ARW→JPG</a>
          <a href="/convert/png-to-jpg" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">PNG→JPG</a>
          <a href="/convert/jpg-to-webp" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">JPG→WEBP</a>
          <a href="/convert/webp-to-jpg" className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">WEBP→JPG</a>
          <a href="/compress/jpg" className="px-2 py-1 bg-teal-100 dark:bg-teal-800 rounded hover:bg-teal-200 dark:hover:bg-teal-700">Compress JPG</a>
          <a href="/compress/png" className="px-2 py-1 bg-teal-100 dark:bg-teal-800 rounded hover:bg-teal-200 dark:hover:bg-teal-700">Compress PNG</a>
          <a href="/remove-background" className="px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded hover:bg-purple-200 dark:hover:bg-purple-700">Remove BG</a>
          <a href="/enhance-image" className="px-2 py-1 bg-purple-100 dark:bg-purple-800 rounded hover:bg-purple-200 dark:hover:bg-purple-700">Enhance</a>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          <a href="/tools" className="hover:underline">View all 80+ tools →</a>
        </p>
      </div>

      {/* ============================================================
          HIDDEN SEO NAVIGATION
          Contains ALL internal links for crawler discovery.
          Visually hidden but accessible to screen readers and crawlers.
          ============================================================ */}
      <nav 
        aria-label="Complete site navigation"
        className="sr-only"
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: 'auto', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden' 
        }}
      >
        <h2>All MicroJPEG Pages</h2>
        
        {/* Main Pages */}
        <ul>
          {MAIN_PAGES.map(href => (
            <li key={href}>
              <a href={href}>{href === '/' ? 'Home' : href.replace('/', '').replace(/-/g, ' ')}</a>
            </li>
          ))}
        </ul>

        {/* Legal Pages */}
        <ul>
          {LEGAL_PAGES.map(href => (
            <li key={href}>
              <a href={href}>{href.replace('/legal/', '').replace(/-/g, ' ')}</a>
            </li>
          ))}
        </ul>

        {/* All Conversion Pages */}
        <ul>
          {CONVERSIONS.map(href => (
            <li key={href}>
              <a href={href}>{href.replace('/convert/', '').replace(/-/g, ' ').toUpperCase()}</a>
            </li>
          ))}
        </ul>

        {/* All Compression Pages */}
        <ul>
          {COMPRESS.map(href => (
            <li key={href}>
              <a href={href}>Compress {href.replace('/compress/', '').toUpperCase()}</a>
            </li>
          ))}
        </ul>

        {/* WordPress */}
        <ul>
          <li><a href="/wordpress-plugin">WordPress Plugin</a></li>
          <li><a href="/wordpress-plugin/install">WordPress Installation</a></li>
          <li><a href="/wordpress-plugin/docs">WordPress Documentation</a></li>
        </ul>
      </nav>
    </>
  );
}
