// client/src/pages/remove-background.tsx
// AI Background Removal Page - Dark Theme matching landing page

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Sparkles, Image as ImageIcon, Loader2, Check, X, Wand2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';

import { SEOHead } from '@/components/SEOHead';
import logoUrl from '@assets/mascot-logo-optimized.png';
import { useQuery } from '@tanstack/react-query';
import {
  UpgradePrompt,
  useUpgradePrompt,
  UsageIndicator,
  LimitReachedBanner
} from '@/components/UpgradePrompt';

// Types
interface ProcessedImage {
  id: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
  format: string;
  processingTime: number;
  downloadUrl: string;
  previewUrl?: string;
}

interface LimitsResponse {
  limit: number;
  remaining: number;
  tier: string;
}

// SEO Content
const SEO_TITLE = "Remove Background from Image - Free AI Tool | WebP & AVIF Output";
const SEO_DESCRIPTION = "Remove background from images instantly with AI. Unlike other tools, save as WebP, AVIF, JPG or PNG. Perfect for e-commerce, product photos, and web optimization.";

// Supported input formats
const SUPPORTED_INPUT_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const UNSUPPORTED_FORMATS = ['image/avif', 'image/heic', 'image/heif'];

export default function RemoveBackgroundPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Options
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'avif' | 'jpg'>('png');
  const [quality, setQuality] = useState(90);

  // Fetch usage limits
  const { data: bgLimits, refetch: refetchLimits } = useQuery<LimitsResponse>({
    queryKey: ['/api/ai/bg-removal/limits'],
    retry: false,
  }) as { data: LimitsResponse | undefined; refetch: () => void };

  // Setup upgrade prompt
  const upgradePrompt = useUpgradePrompt({
    feature: 'background_removal',
    usageStats: bgLimits ? {
      used: bgLimits.limit - bgLimits.remaining,
      remaining: bgLimits.remaining,
      limit: bgLimits.limit,
    } : null,
    tierName: bgLimits?.tier || 'free',
  });

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (UNSUPPORTED_FORMATS.includes(file.type) || ext === 'avif' || ext === 'heic' || ext === 'heif') {
      toast({
        title: "Unsupported input format",
        description: "Please upload JPG, PNG, or WebP images. AVIF/HEIC files are not supported as input.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/') && !['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setResultPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    // Check limits before processing
    if (bgLimits && bgLimits.remaining <= 0) {
      upgradePrompt.setIsOpen(true);
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('outputFormat', outputFormat);
      formData.append('quality', quality.toString());
      formData.append('model', 'standard');

      setProgress(30);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a limit or feature restriction error
        if (data.error === 'limit_reached' || data.showUpgradePrompt) {
          upgradePrompt.checkAndShowPrompt(data);
          return;
        }

        if (data.error === 'format_restricted') {
          upgradePrompt.showRestrictedFeaturePrompt(`${outputFormat.toUpperCase()} output`);
          return;
        }

        throw new Error(data.message || data.error || 'Processing failed');
      }

      setProgress(100);

      if (data.success) {
        setResult(data.result);

        const previewResponse = await fetch(data.result.downloadUrl);
        if (previewResponse.ok) {
          const blob = await previewResponse.blob();
          setResultPreview(URL.createObjectURL(blob));
        }

        // Refetch limits to update UI
        refetchLimits();

        // Check if should show upgrade prompt after successful operation
        if (data.usage?.showUpgradePrompt) {
          // Small delay so user can see the result first
          setTimeout(() => {
            upgradePrompt.checkAndShowPrompt(data.usage);
          }, 1500);
        }

        toast({
          title: "Background removed!",
          description: `Saved as ${outputFormat.toUpperCase()} (${(data.result.processedSize / 1024).toFixed(1)} KB)`,
        });
      }
    } catch (error: any) {
      console.error('Background removal error:', error);

      let errorMessage = error.message;
      if (error.message.includes('cannot identify image file')) {
        errorMessage = 'This image format is not supported. Please use JPG, PNG, or WebP.';
      } else if (error.message.includes('CUDA out of memory')) {
        errorMessage = 'Image is too large to process. Please try a smaller image.';
      }

      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `${selectedFile?.name.split('.')[0]}_no_bg.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setResultPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <SEOHead
        title={SEO_TITLE}
        description={SEO_DESCRIPTION}
        canonicalUrl="https://microjpeg.com/remove-background"
      />

      {/* Dark theme matching landing page */}
      <div className="min-h-screen bg-gray-900">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Usage Indicator */}
          {bgLimits && (
            <div className="mb-6">
              <UsageIndicator
                feature="background_removal"
                used={bgLimits.limit - bgLimits.remaining}
                limit={bgLimits.limit}
                onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
              />
            </div>
          )}

          {/* Limit Reached Banner */}
          {bgLimits && bgLimits.remaining <= 0 && (
            <LimitReachedBanner
              feature="background_removal"
              onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
            />
          )}

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-400 px-4 py-2 rounded-full mb-4 border border-teal-500/30">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered • WebP & AVIF Output</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Remove Background from Image
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Instantly remove backgrounds with AI. <strong className="text-teal-400">Unlike remove.bg</strong>,
              save directly as WebP or AVIF for smaller files and faster websites.
            </p>
          </div>

          {/* Main Tool */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload / Preview Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 text-white">
                {result ? 'Original Image' : 'Upload Image'}
              </h2>

              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? 'border-teal-500 bg-teal-500/10' 
                      : 'border-gray-600 hover:border-teal-500/50 hover:bg-gray-700/30'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-200 mb-2">
                    Drop your image here
                  </p>
                  <p className="text-sm text-gray-400">
                    or click to browse (JPG, PNG, WebP - Max 10MB)
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>AVIF/HEIC input not supported - output only</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl!}
                    alt="Original"
                    className="w-full rounded-lg max-h-96 object-contain bg-gray-700/50"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-300" />
                  </button>
                  <div className="mt-3 text-sm text-gray-400">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                </div>
              )}
            </div>

            {/* Result / Options Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 text-white">
                {result ? 'Result - Background Removed' : 'Output Options'}
              </h2>

              {result && resultPreview ? (
                <div>
                  {/* Checkered background for transparency */}
                  <div 
                    className="relative rounded-lg p-4"
                    style={{
                      backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2P8////fwYKAOOoAQyjYcAwGgYMo2HAMIEQGPURMD4cRsMAAYChFAbjoxYGAMUuH/H5JhuzAAAAAElFTkSuQmCC")`,
                      backgroundRepeat: 'repeat'
                    }}
                  >
                    <img
                      src={resultPreview}
                      alt="Result"
                      className="w-full max-h-80 object-contain"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Format:</span>
                      <span className="font-medium text-white">{result.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="font-medium text-white">{(result.processedSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Processing time:</span>
                      <span className="font-medium text-white">{(result.processingTime / 1000).toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={handleDownload} 
                      className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {outputFormat.toUpperCase()}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      New Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Output Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Output Format
                      <span className="ml-2 text-xs text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded">
                        Unique Feature!
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['png', 'webp', 'avif', 'jpg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                            outputFormat === fmt
                              ? 'border-teal-500 bg-teal-500/20 text-teal-400'
                              : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className="font-medium uppercase text-sm">{fmt}</div>
                          <div className="text-xs text-gray-500">
                            {fmt === 'png' && 'Transparent'}
                            {fmt === 'webp' && '~30% smaller'}
                            {fmt === 'avif' && '~50% smaller'}
                            {fmt === 'jpg' && 'White BG'}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Other tools only output PNG. MicroJPEG lets you save as WebP/AVIF for faster websites!
                    </p>
                    {outputFormat === 'jpg' && (
                      <p className="mt-1 text-xs text-amber-400">
                        ⚠️ JPG doesn't support transparency - background will be white
                      </p>
                    )}
                  </div>

                  {/* Quality Slider */}
                  {outputFormat !== 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-3">
                        Quality: <span className="text-teal-400 font-bold">{quality}%</span>
                      </label>
                      <div className="relative">
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(parseInt(e.target.value))}
                          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(quality - 50) * 2}%, #374151 ${(quality - 50) * 2}%, #374151 100%)`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>50% (Smaller file)</span>
                        <span>100% (Best quality)</span>
                      </div>
                    </div>
                  )}

                  {/* AI Model Info */}
                  <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span className="font-medium">AI Model: Standard</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Fast processing with excellent edge detection
                    </p>
                  </div>

                  {/* Process Button */}
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={!selectedFile || isProcessing || (bgLimits?.remaining || 0) <= 0}
                    className="w-full h-12 text-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(bgLimits?.remaining || 0) <= 0 ? (
                      'Limit Reached - Upgrade to Continue'
                    ) : isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Remove Background
                      </>
                    )}
                  </Button>

                  {/* Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-400">
                        {progress < 30 ? 'Uploading...' : progress < 80 ? 'AI processing...' : 'Finalizing...'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">AI-Powered</h3>
              <p className="text-sm text-gray-400">
                Advanced AI model for precise edge detection and clean cutouts
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">WebP & AVIF Output</h3>
              <p className="text-sm text-gray-400">
                Save up to 50% file size compared to PNG while keeping transparency
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">E-commerce Ready</h3>
              <p className="text-sm text-gray-400">
                Perfect for product photos, Shopify stores, and marketing materials
              </p>
            </div>
          </div>

          {/* SEO Content */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Why Choose MicroJPEG for Background Removal?
            </h2>
            
            <p className="text-gray-300 mb-4">
              Most background removal tools like remove.bg and Canva only output PNG files. 
              While PNG supports transparency, it creates large files that slow down your website.
            </p>
            
            <p className="text-gray-300 mb-4">
              <strong className="text-teal-400">MicroJPEG is different.</strong> We let you save your transparent images as 
              WebP or AVIF - modern formats that are 30-50% smaller than PNG while maintaining 
              perfect transparency. This means:
            </p>
            
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6 ml-4">
              <li>Faster loading product pages</li>
              <li>Better Core Web Vitals scores</li>
              <li>Lower bandwidth costs</li>
              <li>Improved SEO rankings</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-3">
              Perfect for E-commerce
            </h3>
            <p className="text-gray-300 mb-4">
              If you run a Shopify store, Amazon FBA business, or any e-commerce site, you know 
              that image optimization matters. Our background remover + WebP/AVIF conversion 
              is the perfect one-two punch for fast-loading product pages.
            </p>

            <h3 className="text-xl font-bold text-white mb-3">
              How It Works
            </h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
              <li>Upload your product photo or image (JPG, PNG, or WebP)</li>
              <li>Our AI instantly removes the background</li>
              <li>Choose your output format: PNG, WebP, AVIF, or JPG</li>
              <li>Download your optimized transparent image</li>
            </ol>
          </div>
        </main>

        {/* Footer spacing */}
        <div className="h-16"></div>
              {/* Footer */}
              <footer className="bg-gray-100 text-black py-12">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                        <span className="text-xl font-bold font-poppins">MicroJPEG</span>
                      </div>
                      <p className="text-gray-600 font-opensans">
                        The smartest way to compress and optimize your images for the web.
                      </p>
                    </div>
        
                    {/* Product */}
                    <div>
                      <h4 className="font-semibold font-poppins mb-4">Product</h4>
                      <ul className="space-y-2 text-gray-600 font-opensans">
                        <li><a href="/features" className="hover:text-black">Features</a></li>
                        <li><a href="/pricing" className="hover:text-black">Pricing</a></li>
                        <li><a href="/api-docs" className="hover:text-black">API</a></li>
                        <li><a href="/api-docs" className="hover:text-black">Documentation</a></li>
                      </ul>
                    </div>
        
                    {/* Company */}
                    <div>
                      <h4 className="font-semibold font-poppins mb-4">Company</h4>
                      <ul className="space-y-2 text-gray-600 font-opensans">
                        <li><a href="/about" className="hover:text-black">About</a></li>
                        <li><a href="/blog" className="hover:text-black">Blog</a></li>
                        <li><a href="/contact" className="hover:text-black">Contact</a></li>
                        <li><a href="/support" className="hover:text-black">Support</a></li>
                      </ul>
                    </div>
        
                    {/* Legal */}
                    <div>
                      <h4 className="font-semibold font-poppins mb-4">Legal</h4>
                      <ul className="space-y-2 text-gray-600 font-opensans">
                        <li><a href="/privacy-policy" className="hover:text-black">Privacy Policy</a></li>
                        <li><a href="/terms-of-service" className="hover:text-black">Terms of Service</a></li>
                        <li><a href="/cookie-policy" className="hover:text-black">Cookie Policy</a></li>
                        <li><a href="/cancellation-policy" className="hover:text-black">Cancellation Policy</a></li>
                        <li><a href="/privacy-policy" className="hover:text-black">GDPR</a></li>
                      </ul>
                    </div>
                  </div>
        
        
                  <div className="border-t border-gray-300 pt-8 text-center text-gray-500 font-opensans">
                    <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
                    <p className="text-xs mt-2 opacity-75">
                      Background photo by <a href="https://www.pexels.com/photo/selective-focus-photo-of-white-petaled-flowers-96627/" target="_blank" rel="noopener noreferrer" className="hover:underline">AS Photography</a>
                    </p>
                  </div>
                  
                </div>
              </footer>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt {...upgradePrompt.promptProps} />
    </>
  );
}
