// components/SEOFooter.tsx
// This footer provides comprehensive internal linking for SEO
// It should be included on EVERY page to solve orphan page issues

import React from 'react';

// Popular conversion links - always visible
const POPULAR_CONVERSIONS = [
  { name: 'CR2 to JPG', href: '/convert/cr2-to-jpg' },
  { name: 'NEF to JPG', href: '/convert/nef-to-jpg' },
  { name: 'ARW to JPG', href: '/convert/arw-to-jpg' },
  { name: 'PNG to JPG', href: '/convert/png-to-jpg' },
  { name: 'JPG to WEBP', href: '/convert/jpg-to-webp' },
  { name: 'WEBP to JPG', href: '/convert/webp-to-jpg' },
  { name: 'JPG to PNG', href: '/convert/jpg-to-png' },
  { name: 'PNG to WEBP', href: '/convert/png-to-webp' },
];

const COMPRESSION_TOOLS = [
  { name: 'Compress JPG', href: '/compress/jpg' },
  { name: 'Compress PNG', href: '/compress/png' },
  { name: 'Compress WEBP', href: '/compress/webp' },
  { name: 'Compress AVIF', href: '/compress/avif' },
  { name: 'Compress TIFF', href: '/compress/tiff' },
];

const AI_TOOLS = [
  { name: 'Remove Background', href: '/remove-background' },
  { name: 'Enhance Image', href: '/enhance-image' },
];

const PRODUCT_LINKS = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'API Documentation', href: '/api-docs' },
  { name: 'WordPress Plugin', href: '/wordpress-plugin' },
  { name: 'All Tools', href: '/tools' },
];

const COMPANY_LINKS = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Blog', href: '/blog' },
  { name: 'Support', href: '/support' },
];

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '/legal/privacy' },
  { name: 'Terms of Service', href: '/legal/terms' },
  { name: 'Cookie Policy', href: '/legal/cookies' },
  { name: 'Cancellation Policy', href: '/legal/cancellation' },
  { name: 'Payment Protection', href: '/legal/payment-protection' },
];

// ALL conversion links for SEO (hidden but crawlable)
const ALL_CONVERSIONS = [
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

const ALL_COMPRESS = [
  '/compress/jpg', '/compress/png', '/compress/webp',
  '/compress/avif', '/compress/tiff',
  '/compress/jpg-to-jpg', '/compress/png-to-png',
  '/compress/webp-to-webp', '/compress/avif-to-avif',
  '/compress/tiff-to-tiff',
];

export default function SEOFooter() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/mascot-logo-optimized-BdORzE_N.png" 
                alt="MicroJPEG Logo" 
                className="w-10 h-10"
              />
              <span className="text-xl font-bold font-poppins">MicroJPEG</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-opensans text-sm">
              The smartest way to compress, convert, and optimize your images for the web.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold font-poppins mb-4">Product</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans text-sm">
              {PRODUCT_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-black dark:hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Conversions */}
          <div>
            <h4 className="font-semibold font-poppins mb-4">Popular Conversions</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans text-sm">
              {POPULAR_CONVERSIONS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-black dark:hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold font-poppins mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans text-sm">
              {COMPANY_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-black dark:hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold font-poppins mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans text-sm">
              {LEGAL_LINKS.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-black dark:hover:text-white">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tools Section - Visible Links */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-8 mb-8">
          <h4 className="font-semibold font-poppins mb-4 text-center">
            Image Tools
          </h4>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {COMPRESSION_TOOLS.map(link => (
              <a 
                key={link.href}
                href={link.href} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {link.name}
              </a>
            ))}
            {AI_TOOLS.map(link => (
              <a 
                key={link.href}
                href={link.href} 
                className="px-3 py-1 bg-teal-100 dark:bg-teal-800 rounded hover:bg-teal-200 dark:hover:bg-teal-700 transition"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-8 text-center text-gray-500 dark:text-gray-400 font-opensans">
          <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
        </div>

        {/* ============================================================
            HIDDEN SEO NAVIGATION
            Contains ALL internal links for crawler discovery.
            This ensures every page has outgoing links to every other page.
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
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/features">Features</a></li>
            <li><a href="/tools">All Tools</a></li>
            <li><a href="/api-docs">API Documentation</a></li>
            <li><a href="/wordpress-plugin">WordPress Plugin</a></li>
            <li><a href="/wordpress-plugin/install">WordPress Installation</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/support">Support</a></li>
          </ul>

          {/* Legal Pages */}
          <ul>
            <li><a href="/legal/privacy">Privacy Policy</a></li>
            <li><a href="/legal/terms">Terms of Service</a></li>
            <li><a href="/legal/cookies">Cookie Policy</a></li>
            <li><a href="/legal/cancellation">Cancellation Policy</a></li>
            <li><a href="/legal/payment-protection">Payment Protection</a></li>
          </ul>

          {/* AI Tools */}
          <ul>
            <li><a href="/remove-background">Remove Background</a></li>
            <li><a href="/enhance-image">Enhance Image</a></li>
          </ul>

          {/* All Conversion Pages */}
          <ul>
            {ALL_CONVERSIONS.map(href => (
              <li key={href}>
                <a href={href}>{href.replace('/convert/', '').replace(/-/g, ' ').toUpperCase()}</a>
              </li>
            ))}
          </ul>

          {/* All Compression Pages */}
          <ul>
            {ALL_COMPRESS.map(href => (
              <li key={href}>
                <a href={href}>Compress {href.replace('/compress/', '').toUpperCase()}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
