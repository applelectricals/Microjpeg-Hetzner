import React from "react";
import Header from "@/components/header";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Code } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Image Optimization for Websites – Developer Handbook (2025)",
  "description": "End-to-end image optimization guide for developers: formats, compression, CDNs, Core Web Vitals, and MicroJPEG API examples.",
  "mainEntityOfPage": "https://microjpeg.com/guides/image-optimization-for-web"
};

export default function ImageOptimizationDevGuide() {
  return (
    <>
      <SEOHead
        title="Image Optimization for Websites – Developer Handbook (2025) | MicroJPEG"
        description="Step-by-step image optimization guide for developers using WebP/AVIF, compression and MicroJPEG API. Improve Core Web Vitals and page speed."
        structuredData={structuredData}
        canonicalUrl="https://microjpeg.com/guides/image-optimization-for-web"
      />
      <Header />

      <main className="min-h-screen bg-gray-900 text-white">
        <section className="relative pt-12 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Image Optimization for Websites <span className="text-teal-300">Developer Handbook</span>
            </h1>
            <p className="text-gray-200 max-w-3xl">
              A practical, copy-paste friendly handbook for developers who want to fix slow images,
              improve Core Web Vitals and ship fast websites without guessing.
            </p>
          </div>
        </section>

        <section className="py-12 bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-3">1. Choose the right format</h2>
              <p className="text-gray-300 mb-2">
                For most modern sites, WebP and AVIF are your primary formats. Keep JPEG/PNG only for
                legacy compatibility or special cases (logos, line art, etc.).
              </p>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-teal-300" /> 2. Use MicroJPEG API in Node.js
              </h2>
              <pre className="bg-gray-950 text-xs p-4 rounded-lg overflow-x-auto border border-gray-800">
{`import fetch from "node-fetch";
import fs from "fs";

async function optimizeImage(path: string) {
  const formData = new FormData();
  formData.append("files", fs.createReadStream(path));
  formData.append("settings", JSON.stringify({
    quality: 85,
    outputFormat: ["webp"],
    resizeOption: "keep-original",
    compressionAlgorithm: "standard"
  }));

  const res = await fetch("https://microjpeg.com/api/compress", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  console.log(data.results);
}`}
              </pre>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-800">
              <h2 className="text-2xl font-semibold mb-3">3. Integrate with your build pipeline</h2>
              <p className="text-gray-300">
                You can run MicroJPEG optimizations as part of CI/CD or a one-time pre-deployment step
                for static sites (Next.js, Gatsby, Astro, etc.), so production assets are always optimized.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
