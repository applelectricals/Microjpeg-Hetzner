// components/ButtonsSection.tsx
// SEO-OPTIMIZED VERSION - All links always in DOM and crawlable

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
  { name: "Compress JPG", sub: "Lossy", href: "/compress/jpg" },
  { name: "Compress PNG", sub: "Lossless", href: "/compress/png" },
  { name: "Compress WEBP", sub: "Lossy", href: "/compress/webp" },
  { name: "Compress AVIF", sub: "Lossy", href: "/compress/avif" },
  { name: "Compress TIFF", sub: "Lossy", href: "/compress/tiff" },
];

/* AI Tools - 2 pages */
const AI_TOOLS = [
  { name: "Remove Background", sub: "AI Tool", href: "/remove-background" },
  { name: "Enhance Image", sub: "AI Upscaler", href: "/enhance-image" },
];

/* ---------------------------
   Component
   --------------------------- */
export default function ButtonsSection() {
  const [isOpen, setIsOpen] = useState(false);

  // Styling classes
  const cardBase =
    "group relative flex items-center justify-center p-3 rounded-lg border border-teal-700/30 bg-gradient-to-br from-teal-900/20 to-gray-900/40 hover:from-teal-800/30 hover:to-gray-800/50 hover:border-teal-500/50 transition-all duration-200 cursor-pointer";

  const cardBaseLarge =
    "group relative flex items-center justify-center p-4 md:p-6 rounded-xl border border-teal-700/30 bg-gradient-to-br from-teal-900/20 to-gray-900/40 hover:from-teal-800/30 hover:to-gray-800/50 hover:border-teal-500/50 transition-all duration-200 cursor-pointer min-h-[100px]";

  const titleClass = "text-sm font-semibold text-white";
  const subClass = "text-xs text-gray-400";

  // Section header component for consistency
  const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
      {icon}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <span className="text-xs text-gray-400">({subtitle})</span>
    </div>
  );

  // Link grid component
  const LinkGrid = ({ items }: { items: Array<{ name: string; sub: string; href: string }> }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      {items.map((item) => (
        <a key={item.href} href={item.href} className={cardBase}>
          <div className="text-center">
            <div className={titleClass + " mb-1"}>{item.name}</div>
            <div className={subClass}>{item.sub}</div>
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <section className="py-12 bg-gradient-to-b from-gray-900 via-[#0a1a1a] to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            All Conversion & Compression Tools
          </h2>
          <p className="text-gray-400">
            Professional image processing for every format
          </p>
        </div>

        {/* Popular Conversions - Always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
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
                  className="w-12 h-12 rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110"
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

        {/* AI Tools Section - Always visible for promotion */}
        <div className="mb-8">
          <SectionHeader
            icon={
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="AI-Powered Tools"
            subtitle="New"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {AI_TOOLS.map((item) => (
              <a key={item.href} href={item.href} className={cardBase + " border-purple-700/30 hover:border-purple-500/50"}>
                <div className="text-center">
                  <div className={titleClass + " mb-1"}>{item.name}</div>
                  <div className={subClass}>{item.sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 
          SEO-CRITICAL: Using native <details>/<summary> HTML elements
          - Content is ALWAYS in the DOM (crawlable by Google/Ahrefs)
          - Works without JavaScript
          - Accessible by default
          - The 'open' attribute controls visibility
        */}
        <details 
          className="group"
          open={isOpen}
          onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary 
            className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-700/12 hover:bg-teal-700/22 border border-teal-500/20 rounded-lg transition cursor-pointer list-none mx-auto w-fit"
          >
            <span className="text-sm font-medium text-teal-100">
              {isOpen ? "Show Less" : "Show All 65 Tools"}
            </span>
            <svg 
              className={`w-4 h-4 text-teal-200 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          {/* 
            ALL LINKS BELOW ARE ALWAYS IN THE DOM
            Even when collapsed, they are crawlable by search engines
          */}
          <div className="space-y-8 pt-6 mt-4">
            
            {/* RAW Camera Files */}
            <div>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                }
                title="RAW Camera Files"
                subtitle="Professional Photography"
              />
              <LinkGrid items={RAW_BUTTONS} />
            </div>

            {/* Web-Optimized Formats */}
            <div>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
                  </svg>
                }
                title="Web-Optimized Formats"
                subtitle="Next-Gen Web"
              />
              <LinkGrid items={WEB_OPTIMIZED} />
            </div>

            {/* Common Conversions */}
            <div>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 17h12M4 7h.01M4 17h.01" />
                  </svg>
                }
                title="Common Conversions"
                subtitle="Most Popular"
              />
              <LinkGrid items={COMMON_CONVERSIONS} />
            </div>

            {/* SVG Vector Conversions */}
            <div>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" />
                  </svg>
                }
                title="SVG Vector Conversions"
                subtitle="Vector to Raster"
              />
              <LinkGrid items={SVG_CONVERSIONS} />
            </div>

            {/* Compression Tools */}
            <div>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" />
                  </svg>
                }
                title="Compression Tools"
                subtitle="Reduce File Size"
              />
              <LinkGrid items={COMPRESSION} />
            </div>

          </div>
        </details>

        <p className="text-center mt-6 text-xs text-gray-400">
          {isOpen ? "Showing all 65+ conversion & compression tools" : "65+ conversion & compression tools available"}
        </p>

        {/* 
          SEO FALLBACK: Hidden nav element with all links
          This ensures ALL internal links are in the DOM even if details is collapsed
          The 'sr-only' class hides it visually but keeps it accessible and crawlable
        */}
        <nav className="sr-only" aria-label="All conversion tools">
          <h3>RAW Camera Conversions</h3>
          <ul>
            {RAW_BUTTONS.map(item => (
              <li key={item.href}><a href={item.href}>{item.name}</a></li>
            ))}
          </ul>
          <h3>Web Format Conversions</h3>
          <ul>
            {WEB_OPTIMIZED.map(item => (
              <li key={item.href}><a href={item.href}>{item.name}</a></li>
            ))}
          </ul>
          <h3>Common Conversions</h3>
          <ul>
            {COMMON_CONVERSIONS.map(item => (
              <li key={item.href}><a href={item.href}>{item.name}</a></li>
            ))}
          </ul>
          <h3>SVG Conversions</h3>
          <ul>
            {SVG_CONVERSIONS.map(item => (
              <li key={item.href}><a href={item.href}>{item.name}</a></li>
            ))}
          </ul>
          <h3>Compression Tools</h3>
          <ul>
            {COMPRESSION.map(item => (
              <li key={item.href}><a href={item.href}>{item.name}</a></li>
            ))}
          </ul>
          <h3>AI Tools</h3>
          <ul>
            {AI_TOOLS.map(item => (
              <li key={item.href}><a href={item.href}>{item.name}</a></li>
            ))}
          </ul>
        </nav>

      </div>
    </section>
  );
}
