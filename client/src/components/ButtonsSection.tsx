// components/ButtonsSection.tsx
// SEO-OPTIMIZED VERSION - Links are always in DOM for crawlers

import { useState } from "react";

/* ---------------------------
   Data: declare before component
   --------------------------- */

const VISIBLE_CONVERSIONS = [
  {
    label: "CR2 → JPG",
    sub: "Canon RAW",
    href: "/convert/cr2-to-jpg",
    icon: (
      <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      </svg>
    ),
  },
  {
    label: "NEF → JPG",
    sub: "Nikon RAW",
    href: "/convert/nef-to-jpg",
    icon: (
      <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3-1.343-3-3S10.343 2 12 2s3 1.343 3 3-1.343 3-3 3zM3 20v-2a4 4 0 014-4h10a4 4 0 014 4v2" />
      </svg>
    ),
  },
  {
    label: "PNG → JPG",
    sub: "Raster Image",
    href: "/convert/png-to-jpg",
    icon: (
      <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l3-3 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "JPG → WEBP",
    sub: "Web Optimized",
    href: "/convert/jpg-to-webp",
    icon: (
      <svg className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 3v18" />
      </svg>
    ),
  },
  {
    label: "WEBP → JPG",
    sub: "Universal",
    href: "/convert/webp-to-jpg",
    icon: (
      <svg className="w-5 h-5 text-lime-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l3-4 3 4h4v10H3z" />
      </svg>
    ),
  },
];

/* RAW Camera Files - All 35 RAW conversions */
const RAW_BUTTONS = [
  // Canon CR2
  { name: "CR2 → JPG", sub: "Canon", href: "/convert/cr2-to-jpg" },
  { name: "CR2 → PNG", sub: "Canon", href: "/convert/cr2-to-png" },
  { name: "CR2 → TIFF", sub: "Canon", href: "/convert/cr2-to-tiff" },
  { name: "CR2 → WEBP", sub: "Canon", href: "/convert/cr2-to-webp" },
  { name: "CR2 → AVIF", sub: "Canon", href: "/convert/cr2-to-avif" },

  // Canon CRW (legacy)
  { name: "CRW → JPG", sub: "Canon (old)", href: "/convert/crw-to-jpg" },
  { name: "CRW → PNG", sub: "Canon (old)", href: "/convert/crw-to-png" },
  { name: "CRW → TIFF", sub: "Canon (old)", href: "/convert/crw-to-tiff" },
  { name: "CRW → WEBP", sub: "Canon (old)", href: "/convert/crw-to-webp" },
  { name: "CRW → AVIF", sub: "Canon (old)", href: "/convert/crw-to-avif" },

  // Nikon NEF
  { name: "NEF → JPG", sub: "Nikon", href: "/convert/nef-to-jpg" },
  { name: "NEF → PNG", sub: "Nikon", href: "/convert/nef-to-png" },
  { name: "NEF → TIFF", sub: "Nikon", href: "/convert/nef-to-tiff" },
  { name: "NEF → WEBP", sub: "Nikon", href: "/convert/nef-to-webp" },
  { name: "NEF → AVIF", sub: "Nikon", href: "/convert/nef-to-avif" },

  // Sony ARW
  { name: "ARW → JPG", sub: "Sony", href: "/convert/arw-to-jpg" },
  { name: "ARW → PNG", sub: "Sony", href: "/convert/arw-to-png" },
  { name: "ARW → TIFF", sub: "Sony", href: "/convert/arw-to-tiff" },
  { name: "ARW → WEBP", sub: "Sony", href: "/convert/arw-to-webp" },
  { name: "ARW → AVIF", sub: "Sony", href: "/convert/arw-to-avif" },

  // Adobe DNG
  { name: "DNG → JPG", sub: "Adobe DNG", href: "/convert/dng-to-jpg" },
  { name: "DNG → PNG", sub: "Adobe DNG", href: "/convert/dng-to-png" },
  { name: "DNG → TIFF", sub: "Adobe DNG", href: "/convert/dng-to-tiff" },
  { name: "DNG → WEBP", sub: "Adobe DNG", href: "/convert/dng-to-webp" },
  { name: "DNG → AVIF", sub: "Adobe DNG", href: "/convert/dng-to-avif" },

  // Olympus ORF
  { name: "ORF → JPG", sub: "Olympus", href: "/convert/orf-to-jpg" },
  { name: "ORF → PNG", sub: "Olympus", href: "/convert/orf-to-png" },
  { name: "ORF → TIFF", sub: "Olympus", href: "/convert/orf-to-tiff" },
  { name: "ORF → WEBP", sub: "Olympus", href: "/convert/orf-to-webp" },
  { name: "ORF → AVIF", sub: "Olympus", href: "/convert/orf-to-avif" },

  // Fujifilm RAF
  { name: "RAF → JPG", sub: "Fujifilm", href: "/convert/raf-to-jpg" },
  { name: "RAF → PNG", sub: "Fujifilm", href: "/convert/raf-to-png" },
  { name: "RAF → TIFF", sub: "Fujifilm", href: "/convert/raf-to-tiff" },
  { name: "RAF → WEBP", sub: "Fujifilm", href: "/convert/raf-to-webp" },
  { name: "RAF → AVIF", sub: "Fujifilm", href: "/convert/raf-to-avif" },
];

/* Web-Optimized Format Conversions - 14 pages */
const WEB_OPTIMIZED = [
  // To WebP
  { name: "JPG → WEBP", sub: "Web", href: "/convert/jpg-to-webp" },
  { name: "PNG → WEBP", sub: "Web", href: "/convert/png-to-webp" },
  { name: "TIFF → WEBP", sub: "Web", href: "/convert/tiff-to-webp" },
  
  // To AVIF
  { name: "JPG → AVIF", sub: "Web", href: "/convert/jpg-to-avif" },
  { name: "PNG → AVIF", sub: "Web", href: "/convert/png-to-avif" },
  { name: "TIFF → AVIF", sub: "Web", href: "/convert/tiff-to-avif" },
  
  // From WebP
  { name: "WEBP → JPG", sub: "Web", href: "/convert/webp-to-jpg" },
  { name: "WEBP → PNG", sub: "Web", href: "/convert/webp-to-png" },
  { name: "WEBP → TIFF", sub: "Web", href: "/convert/webp-to-tiff" },
  { name: "WEBP → AVIF", sub: "Web", href: "/convert/webp-to-avif" },
  
  // From AVIF
  { name: "AVIF → JPG", sub: "Web", href: "/convert/avif-to-jpg" },
  { name: "AVIF → PNG", sub: "Web", href: "/convert/avif-to-png" },
  { name: "AVIF → TIFF", sub: "Web", href: "/convert/avif-to-tiff" },
  { name: "AVIF → WEBP", sub: "Web", href: "/convert/avif-to-webp" },
];

/* Common Standard Format Conversions - 6 pages */
const COMMON_CONVERSIONS = [
  { name: "PNG → JPG", sub: "General", href: "/convert/png-to-jpg" },
  { name: "JPG → PNG", sub: "General", href: "/convert/jpg-to-png" },
  { name: "TIFF → JPG", sub: "General", href: "/convert/tiff-to-jpg" },
  { name: "TIFF → PNG", sub: "General", href: "/convert/tiff-to-png" },
  { name: "JPG → TIFF", sub: "General", href: "/convert/jpg-to-tiff" },
  { name: "PNG → TIFF", sub: "General", href: "/convert/png-to-tiff" },
];

/* SVG Vector Conversions - 5 pages */
const SVG_CONVERSIONS = [
  { name: "SVG → JPG", sub: "Vector", href: "/convert/svg-to-jpg" },
  { name: "SVG → PNG", sub: "Vector", href: "/convert/svg-to-png" },
  { name: "SVG → TIFF", sub: "Vector", href: "/convert/svg-to-tiff" },
  { name: "SVG → WEBP", sub: "Vector", href: "/convert/svg-to-webp" },
  { name: "SVG → AVIF", sub: "Vector", href: "/convert/svg-to-avif" },
];

/* Compression Tools - 5 pages */
const COMPRESSION = [
  { name: "Compress JPG", sub: "Lossy", href: "/compress/jpg-to-jpg" },
  { name: "Compress PNG", sub: "Lossless", href: "/compress/png-to-png" },
  { name: "Compress WEBP", sub: "Lossy", href: "/compress/webp-to-webp" },
  { name: "Compress AVIF", sub: "Lossy", href: "/compress/avif-to-avif" },
  { name: "Compress TIFF", sub: "Lossy", href: "/compress/tiff-to-tiff" },
];

// Combine all links for SEO nav
const ALL_CONVERSION_LINKS = [
  ...RAW_BUTTONS,
  ...WEB_OPTIMIZED,
  ...COMMON_CONVERSIONS,
  ...SVG_CONVERSIONS,
  ...COMPRESSION,
];

/* ---------------------------
   Component
   --------------------------- */
export default function ButtonsSection() {
  const [showAll, setShowAll] = useState(false);

  // lighter teal backgrounds so buttons pop
  const cardBase =
    "group flex items-center justify-center px-3 py-3 bg-gray-800/50 hover:bg-teal-700/30 border border-gray-700/50 hover:border-teal-500/40 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10";
  const cardBaseLarge =
    "group flex items-center justify-center px-4 py-4 bg-gray-800/60 hover:bg-teal-700/30 border border-gray-700/50 hover:border-teal-500/50 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10";
  const titleClass = "text-sm font-medium text-white group-hover:text-teal-100";
  const subClass = "text-[10px] text-gray-400";

  return (
    <section className="relative py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-900/95">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-6">
          Image Conversion Tools
        </h2>

        {/* Always-visible popular conversions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {VISIBLE_CONVERSIONS.map((b) => (
            <a
              key={b.href}
              href={b.href}
              className={cardBaseLarge}
              aria-label={b.label}
              title={b.label}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                  }}
                >
                  {b.icon}
                </div>

                <div className="text-center">
                  <div className={titleClass}>{b.label}</div>
                  <div className={subClass}>{b.sub}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* ============================================================
            SEO-FRIENDLY EXPANDABLE SECTION
            Uses native <details>/<summary> which is:
            1. Accessible by default
            2. Content is in DOM and crawlable
            3. Works without JavaScript
            ============================================================ */}
        <details 
          className="group"
          open={showAll}
          onToggle={(e) => setShowAll((e.target as HTMLDetailsElement).open)}
        >
          <summary 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-700/12 hover:bg-teal-700/22 border border-teal-500/20 rounded-lg transition cursor-pointer list-none mx-auto w-fit"
          >
            <span className="text-sm font-medium text-teal-100">
              {showAll ? "Show Less" : "Show All Formats"}
            </span>
            <svg 
              className={`w-4 h-4 text-teal-200 transition-transform ${showAll ? 'rotate-180' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {!showAll && <span className="text-xs text-gray-400 ml-1">(65 tools)</span>}
          </summary>

          {/* Content - Always in DOM, visibility controlled by <details> */}
          <div className="space-y-8 pt-6">
            {/* RAW Camera Files */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <h3 className="text-sm font-semibold text-white">RAW Camera Files</h3>
                <span className="text-xs text-gray-400">(Professional Photography)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {RAW_BUTTONS.map((item) => (
                  <a key={item.href} href={item.href} className={cardBase}>
                    <div className="text-center">
                      <div className={titleClass + " mb-1"}>{item.name}</div>
                      <div className={subClass}>{item.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Web-Optimized Formats */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Web-Optimized Formats</h3>
                <span className="text-xs text-gray-400">(Next-Gen Web)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {WEB_OPTIMIZED.map((item) => (
                  <a key={item.href} href={item.href} className={cardBase}>
                    <div className="text-center">
                      <div className={titleClass + " mb-1"}>{item.name}</div>
                      <div className={subClass}>{item.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Common Conversions */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 17h12M4 7h.01M4 17h.01" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Common Conversions</h3>
                <span className="text-xs text-gray-400">(Most Popular)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {COMMON_CONVERSIONS.map((item) => (
                  <a key={item.href} href={item.href} className={cardBase}>
                    <div className="text-center">
                      <div className={titleClass + " mb-1"}>{item.name}</div>
                      <div className={subClass}>{item.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* SVG Vector Conversions */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" />
                </svg>
                <h3 className="text-sm font-semibold text-white">SVG Vector Conversions</h3>
                <span className="text-xs text-gray-400">(Vector to Raster)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {SVG_CONVERSIONS.map((item) => (
                  <a key={item.href} href={item.href} className={cardBase}>
                    <div className="text-center">
                      <div className={titleClass + " mb-1"}>{item.name}</div>
                      <div className={subClass}>{item.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Compression Tools */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Compression Tools</h3>
                <span className="text-xs text-gray-400">(Reduce File Size)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {COMPRESSION.map((item) => (
                  <a key={item.href} href={item.href} className={cardBase}>
                    <div className="text-center">
                      <div className={titleClass + " mb-1"}>{item.name}</div>
                      <div className={subClass}>{item.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </details>

        <p className="text-center mt-6 text-xs text-gray-400">
          {showAll ? "Showing all 65 conversion tools" : "65 conversion & compression tools available"}
        </p>

        {/* ============================================================
            HIDDEN SEO NAV - Always in DOM, visually hidden
            This ensures crawlers can ALWAYS find all links even if
            the <details> element behavior varies across bots.
            ============================================================ */}
        <nav 
          aria-label="All conversion tools" 
          className="sr-only"
          style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
        >
          <h2>All Image Conversion Tools</h2>
          <ul>
            {ALL_CONVERSION_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.name} - {link.sub}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
