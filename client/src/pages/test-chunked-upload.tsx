import React from 'react';
import Header from '@/components/header';
import ChunkedUploader from '@/components/ChunkedUploader';
import { SEOHead } from '@/components/SEOHead';

export default function TestChunkedUploadPage() {
  return (
    <>
      <SEOHead
        title="Test Chunked Upload - MicroJPEG"
        description="Test the new tus.io chunked upload for large files"
      />
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Test Chunked Upload
              </h1>
              <p className="text-xl text-gray-400">
                Upload large files (75MB+) with resumable progress
              </p>
            </div>

            <ChunkedUploader />

            <div className="mt-12 bg-gray-800/50 border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-3">Features</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span>
                      Upload files up to 250MB
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span>
                      10MB chunks (works with Cloudflare timeout)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span>
                      Pause and resume uploads
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span>
                      Real-time progress with speed/ETA
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span>
                      Supports CR2, RAW, JPEG, PNG, WebP
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-400">✓</span>
                      Multiple concurrent uploads
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-3">Expected Performance</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span>1MB file:</span>
                      <span className="font-semibold">2-3 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>10MB file:</span>
                      <span className="font-semibold">5-8 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>55MB CR2:</span>
                      <span className="font-semibold">30-45 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>100MB+ file:</span>
                      <span className="font-semibold">60-90 seconds</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-teal-400 mb-3">Test Cases</h3>
                <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                  <li>Upload a 1MB JPG - should complete in 2-3 seconds</li>
                  <li>Upload a 55MB CR2 file - should complete in 30-45 seconds</li>
                  <li>Try pause/resume during upload - upload should continue from where it stopped</li>
                  <li>Upload 2-3 files simultaneously - each should have independent progress</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
