import React from "react";
import Header from "@/components/header";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "WebP vs AVIF: The Definitive 2025 Comparison",
  "description": "Compare WebP vs AVIF for speed, quality, browser support and SEO. Includes benchmarks and practical recommendations for developers and photographers.",
  "mainEntityOfPage": "https://microjpeg.com/guides/webp-vs-avif"
};

export default function WebPvsAVIFGuide() {
  return (
    <>
      <SEOHead
        title="WebP vs AVIF: The Definitive 2025 Comparison | MicroJPEG"
        description="WebP vs AVIF: see file size benchmarks, quality comparisons, browser support and SEO impact so you can choose the right format for your site."
        structuredData={structuredData}
        canonicalUrl="https://microjpeg.com/guides/webp-vs-avif"
      />

      <Header />

      <main className="min-h-screen bg-gray-900 text-white">
        <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              WebP vs AVIF <span className="text-teal-300">in 2025</span>
            </h1>
            <p className="text-gray-200 max-w-3xl mx-auto">
              Both WebP and AVIF offer next-gen compression — but they behave differently for real-world
              websites, SEO and photography. Here’s the clear, practical breakdown.
            </p>
          </div>
        </section>

        <section className="py-12 bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-3">Quick Verdict</h2>
              <p className="text-gray-300">
                For most websites, WebP is the safest default: wide browser support, great quality and
                simple tooling. AVIF wins for maximum compression and modern browsers, especially for
                high-res photography and hero images.
              </p>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">File Size Benchmarks</h2>
              <table className="w-full text-left text-gray-200 text-sm border border-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2">Image Type</th>
                    <th className="px-4 py-2">JPEG</th>
                    <th className="px-4 py-2">WebP</th>
                    <th className="px-4 py-2">AVIF</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-800">
                    <td className="px-4 py-2">Portfolio Portrait</td>
                    <td className="px-4 py-2">1.2 MB</td>
                    <td className="px-4 py-2">420 KB</td>
                    <td className="px-4 py-2">280 KB</td>
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="px-4 py-2">Landscape</td>
                    <td className="px-4 py-2">1.8 MB</td>
                    <td className="px-4 py-2">560 KB</td>
                    <td className="px-4 py-2">330 KB</td>
                  </tr>
                </tbody>
              </table>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">What We Recommend</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Use WebP as the default for most images.</li>
                <li>Use AVIF for large hero images and photography where supported.</li>
                <li>Keep a JPEG fallback if your audience uses older browsers.</li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
