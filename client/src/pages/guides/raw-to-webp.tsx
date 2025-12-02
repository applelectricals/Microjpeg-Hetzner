import React from "react";
import Header from "@/components/header";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import mascotUrl from "@/assets/mascot.webp";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "RAW to WebP Conversion Guide (2025)",
  "description": "Professional workflow for converting RAW (CR2, NEF, ARW, DNG) images to WebP using MicroJPEG. Includes benchmarks, quality tips and SEO benefits.",
  "author": {
    "@type": "Organization",
    "name": "MicroJPEG"
  },
  "mainEntityOfPage": "https://microjpeg.com/guides/raw-to-webp"
};

export default function RawToWebPGuide() {
  return (
    <>
      <SEOHead
        title="RAW to WebP Conversion Guide (2025) | MicroJPEG"
        description="Convert RAW (CR2, NEF, ARW, DNG) to WebP in a pro-grade workflow. Learn best settings, quality tips, benchmarks and SEO benefits."
        structuredData={structuredData}
        canonicalUrl="https://microjpeg.com/guides/raw-to-webp"
      />

      <Header />

      <main className="min-h-screen bg-gray-900 text-white">
        {/* Hero */}
        <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.25),transparent_60%)]" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <img src={mascotUrl} alt="MicroJPEG Mascot" className="w-16 h-16 rounded-full shadow-lg" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                RAW to WebP Conversion Guide <span className="text-teal-300">(2025)</span>
              </h1>
              <p className="text-gray-200 max-w-2xl">
                Learn how to convert bulky RAW files (CR2, NEF, ARW, DNG and more) into lightweight WebP
                images that load instantly while keeping stunning visual quality.
              </p>
              <Button size="lg" className="mt-2" asChild>
                <a href="/convert/raw-to-webp">Convert RAW to WebP Now</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-3">Why convert RAW to WebP?</h2>
              <p className="text-gray-300">
                RAW files are perfect for editing but terrible for the web: huge file sizes, slow load times,
                and no native browser support. WebP gives you dramatically smaller files with excellent visual
                fidelity and browser support.
              </p>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Typical File Size Savings</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="font-semibold">CR2 → WebP</p>
                  <p className="text-2xl text-teal-300 font-bold">≈ 80% smaller</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="font-semibold">NEF → WebP</p>
                  <p className="text-2xl text-teal-300 font-bold">≈ 78% smaller</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="font-semibold">ARW → WebP</p>
                  <p className="text-2xl text-teal-300 font-bold">≈ 82% smaller</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4">Recommended Workflow</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Export edited photos from Lightroom/Capture One as high-quality RAW or TIFF.</li>
                <li>Upload them to MicroJPEG’s RAW → WebP converter.</li>
                <li>Use balanced WebP quality (80–90) for the best mix of sharpness and size.</li>
                <li>Download the WebP set and upload to your portfolio or website.</li>
              </ol>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
