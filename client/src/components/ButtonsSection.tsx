// components/ButtonsSection.tsx
import { useState } from "react";

/* ---------------------------
   Data: declare before component
   --------------------------- */
const VISIBLE_CONVERSIONS = [
  { label: "CR2 → JPG", sub: "Canon RAW", href: "/convert/cr2-to-jpg" },
  { label: "NEF → JPG", sub: "Nikon RAW", href: "/convert/nef-to-jpg" },
  { label: "PNG → JPG", sub: "Lossless", href: "/convert/png-to-jpg" },
  { label: "JPG → WEBP", sub: "Web Ready", href: "/convert/jpg-to-webp" },
  { label: "WEBP → JPG", sub: "Universal", href: "/convert/webp-to-jpg" },
];

const RAW_BUTTONS = [
  { name: "CR2→JPG", sub: "Canon", href: "/convert/cr2-to-jpg" },
  { name: "CR2→PNG", sub: "", href: "/convert/cr2-to-png" },
  { name: "CR2→TIFF", sub: "", href: "/convert/cr2-to-tiff" },
  { name: "CR2→WEBP", sub: "", href: "/convert/cr2-to-webp" },
  { name: "CR2→AVIF", sub: "", href: "/convert/cr2-to-avif" },

  { name: "NEF→JPG", sub: "Nikon", href: "/convert/nef-to-jpg" },
  { name: "NEF→PNG", href: "/convert/nef-to-png" },
  { name: "NEF→TIFF", href: "/convert/nef-to-tiff" },
  { name: "NEF→WEBP", href: "/convert/nef-to-webp" },
  { name: "NEF→AVIF", href: "/convert/nef-to-avif" },

  { name: "ARW→JPG", sub: "Sony", href: "/convert/arw-to-jpg" },
  { name: "ARW→PNG", href: "/convert/arw-to-png" },
  { name: "ARW→TIFF", href: "/convert/arw-to-tiff" },
  { name: "ARW→WEBP", href: "/convert/arw-to-webp" },
  { name: "ARW→AVIF", href: "/convert/arw-to-avif" },

  { name: "DNG→JPG", sub: "Adobe", href: "/convert/dng-to-jpg" },
  { name: "DNG→PNG", href: "/convert/dng-to-png" },
  { name: "DNG→TIFF", href: "/convert/dng-to-tiff" },
  { name: "DNG→WEBP", href: "/convert/dng-to-webp" },
  { name: "DNG→AVIF", href: "/convert/dng-to-avif" },

  { name: "ORF→JPG", sub: "Olympus", href: "/convert/orf-to-jpg" },
  { name: "ORF→PNG", href: "/convert/orf-to-png" },
  { name: "ORF→TIFF", href: "/convert/orf-to-tiff" },
  { name: "ORF→WEBP", href: "/convert/orf-to-webp" },
  { name: "ORF→AVIF", href: "/convert/orf-to-avif" },

  { name: "RAF→JPG", sub: "Fujifilm", href: "/convert/raf-to-jpg" },
  { name: "RAF→PNG", href: "/convert/raf-to-png" },
  { name: "RAF→TIFF", href: "/convert/raf-to-tiff" },
  { name: "RAF→WEBP", href: "/convert/raf-to-webp" },
  { name: "RAF→AVIF", href: "/convert/raf-to-avif" },

  { name: "CRW→JPG", sub: "Canon (old)", href: "/convert/crw-to-jpg" },
  { name: "CRW→PNG", href: "/convert/crw-to-png" },
  { name: "CRW→TIFF", href: "/convert/crw-to-tiff" },
  { name: "CRW→WEBP", href: "/convert/crw-to-webp" },
  { name: "CRW→AVIF", href: "/convert/crw-to-avif" },

  { name: "RW2→JPG", sub: "Panasonic", href: "/convert/rw2-to-jpg" },
];

const WEB_OPTIMIZED = [
  { name: "JPG→WEBP", sub: "Web ready", href: "/convert/jpg-to-webp" },
  { name: "PNG→WEBP", sub: "Smaller", href: "/convert/png-to-webp" },
  { name: "JPG→AVIF", sub: "Next-gen", href: "/convert/jpg-to-avif" },
  { name: "PNG→AVIF", sub: "Next-gen", href: "/convert/png-to-avif" },
  { name: "WEBP→JPG", sub: "Universal", href: "/convert/webp-to-jpg" },
  { name: "WEBP→PNG", sub: "Lossless", href: "/convert/webp-to-png" },
  { name: "AVIF→JPG", sub: "Compatible", href: "/convert/avif-to-jpg" },
  { name: "AVIF→PNG", sub: "Quality", href: "/convert/avif-to-png" },

  { name: "WEBP→TIFF", href: "/convert/webp-to-tiff" },
  { name: "WEBP→AVIF", href: "/convert/webp-to-avif" },
];

const COMMON_CONVERSIONS = [
  { name: "PNG→JPG", sub: "Reduce size", href: "/convert/png-to-jpg" },
  { name: "JPG→PNG", sub: "Transparency", href: "/convert/jpg-to-png" },
  { name: "TIFF→JPG", sub: "Web ready", href: "/convert/tiff-to-jpg" },
  { name: "TIFF→PNG", sub: "Maintain quality", href: "/convert/tiff-to-png" },
  { name: "JPG→TIFF", sub: "Print quality", href: "/convert/jpg-to-tiff" },
  { name: "PNG→TIFF", sub: "Archive", href: "/convert/png-to-tiff" },

  { name: "PNG→JPG (alt)", href: "/convert/png-to-jpg" },
  { name: "PNG→AVIF", href: "/convert/png-to-avif" },
  { name: "PNG→WEBP (alt)", href: "/convert/png-to-webp" },
];

const COMPRESSION = [
  { name: "Compress JPG", sub: "Reduce size", href: "/compress/jpg" },
  { name: "Compress PNG", sub: "Reduce size", href: "/compress/png" },
  { name: "Compress WEBP", sub: "Reduce size", href: "/compress/webp" },
  { name: "Compress AVIF", sub: "Reduce size", href: "/compress/avif" },
  { name: "Compress TIFF", sub: "Reduce size", href: "/compress/tiff" },

  { name: "Compress WEBP→WEBP", href: "/compress/webp-to-webp" },
  { name: "Compress TIFF→TIFF", href: "/compress/tiff-to-tiff" },
  { name: "Compress PNG→PNG", href: "/compress/png-to-png" },
  { name: "Compress JPG→JPG", href: "/compress/jpg-to-jpg" },
  { name: "Compress AVIF→AVIF", href: "/compress/avif-to-avif" },
];

const OTHER_CONVERSIONS = [
  { name: "CR2→AVIF", href: "/convert/cr2-to-avif" },
  { name: "CR2→PNG", href: "/convert/cr2-to-png" },
  { name: "CR2→TIFF", href: "/convert/cr2-to-tiff" },

  { name: "ARW→PNG", href: "/convert/arw-to-png" },
  { name: "ARW→TIFF", href: "/convert/arw-to-tiff" },

  { name: "DNG→PNG", href: "/convert/dng-to-png" },
  { name: "DNG→TIFF", href: "/convert/dng-to-tiff" },
  { name: "DNG→WEBP", href: "/convert/dng-to-webp" },
  { name: "DNG→AVIF", href: "/convert/dng-to-avif" },

  { name: "ORF→PNG", href: "/convert/orf-to-png" },
  { name: "ORF→TIFF", href: "/convert/orf-to-tiff" },
  { name: "ORF→WEBP", href: "/convert/orf-to-webp" },
  { name: "ORF→AVIF", href: "/convert/orf-to-avif" },

  { name: "RAF→PNG", href: "/convert/raf-to-png" },
  { name: "RAF→TIFF", href: "/convert/raf-to-tiff" },
  { name: "RAF→WEBP", href: "/convert/raf-to-webp" },
  { name: "RAF→AVIF", href: "/convert/raf-to-avif" },

  { name: "CRW→PNG", href: "/convert/crw-to-png" },
  { name: "CRW→TIFF", href: "/convert/crw-to-tiff" },
  { name: "CRW→WEBP", href: "/convert/crw-to-webp" },
  { name: "CRW→AVIF", href: "/convert/crw-to-avif" },

  { name: "NEF→WEBP", href: "/convert/nef-to-webp" },
  { name: "NEF→AVIF", href: "/convert/nef-to-avif" },

  { name: "PNG→AVIF", href: "/convert/png-to-avif" },

  { name: "AVIF→WEBP", href: "/convert/avif-to-webp" },
  { name: "AVIF→TIFF", href: "/convert/avif-to-tiff" },
  { name: "AVIF→JPG", href: "/convert/avif-to-jpg" },
  { name: "AVIF→PNG", href: "/convert/avif-to-png" },
];

/* ---------------------------
   Component
   --------------------------- */
export default function ButtonsSection() {
  const [showAll, setShowAll] = useState(false);

  const cardBase =
    "group p-3 bg-[#0e1a1f]/70 hover:bg-[#102329]/95 border border-teal-500/25 hover:border-teal-400 rounded-xl transition-all hover:scale-105 shadow-[0_0_10px_rgba(0,200,180,0.06)]";
  const cardBaseLarge =
    "group p-4 bg-[#0e1a1f]/70 hover:bg-[#102329]/95 border border-teal-500/25 hover:border-teal-400 rounded-xl transition-all hover:scale-105 shadow-[0_0_10px_rgba(0,200,180,0.08)]";
  const titleClass = "text-xs font-medium text-teal-200 group-hover:text-white transition-colors";
  const subClass = "text-[10px] text-gray-300";

  return (
    <section className="py-10 bg-gray-900/20 border-y border-gray-800/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Need a Specific Format?</h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            We have dedicated pages for professional workflows and specialized conversions
          </p>
        </div>

        {/* Popular Conversions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto mb-6">
          {VISIBLE_CONVERSIONS.map((b) => (
            <a key={b.href} href={b.href} className={cardBaseLarge} aria-label={b.label}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 bg-gradient-to-br from-teal-500/10 to-teal-300/10 border border-teal-400/20 rounded-lg 
                             flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <svg className="w-5 h-5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className={titleClass}>{b.label}</div>
                  <div className={subClass}>{b.sub}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Expand button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowAll((s) => !s)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0e1a1f]/60 hover:bg-[#102329]/90 border border-teal-500/25 rounded-lg transition"
            aria-expanded={showAll}
          >
            <span className="text-sm font-medium text-teal-200 group-hover:text-white">{showAll ? "Show Less" : "Show All Formats"}</span>

            {showAll ? (
              <svg className="w-4 h-4 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {!showAll && <span className="text-xs text-gray-400 ml-1">(80+ tools)</span>}
          </button>
        </div>

        {/* Expandable area */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAll ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="space-y-8 pt-4">
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
                    <div className={titleClass + " mb-1 text-center"}>{item.name}</div>
                    <div className={subClass + " text-center"}>{item.sub}</div>
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
                    <div className={titleClass + " mb-1 text-center"}>{item.name}</div>
                    <div className={subClass + " text-center"}>{item.sub}</div>
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
                  <a key={item.href || item.name} href={item.href || "#"} className={cardBase}>
                    <div className={titleClass + " mb-1 text-center"}>{item.name}</div>
                    <div className={subClass + " text-center"}>{item.sub}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Other Conversions */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
                <svg className="w-5 h-5 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <h3 className="text-sm font-semibold text-white">Other Conversions</h3>
                <span className="text-xs text-gray-400">(All formats)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {OTHER_CONVERSIONS.map((item) => (
                  <a key={item.href} href={item.href} className={cardBase}>
                    <div className={titleClass + " mb-1 text-center"}>{item.name}</div>
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
                    <div className={titleClass + " mb-1 text-center"}>{item.name}</div>
                    <div className={subClass + " text-center"}>{item.sub}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">{showAll ? "Showing all conversion tools" : "80+ conversion combinations available"}</p>
      </div>
    </section>
  );
}
