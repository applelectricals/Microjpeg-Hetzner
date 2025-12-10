// client/src/pages/remove-background.tsx
// AI Background Removal Page - UNIQUE: Output to WebP/AVIF/JPG!

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Sparkles, Image as ImageIcon, Loader2, Check, X, Wand2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';

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
  
  // Options - Added 'jpg' to output formats
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'avif' | 'jpg'>('png');
  const [quality, setQuality] = useState(90);
  // Removed 'enhanced' model option since it causes CUDA memory errors

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    // Check for unsupported formats (AVIF, HEIC from other converters)
    if (UNSUPPORTED_FORMATS.includes(file.type) || ext === 'avif' || ext === 'heic' || ext === 'heif') {
      toast({
        title: "Unsupported input format",
        description: "Please upload JPG, PNG, or WebP images. AVIF/HEIC files are not supported as input.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  // Handle drag and drop
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

  // Process image
  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('outputFormat', outputFormat);
      formData.append('quality', quality.toString());
      formData.append('model', 'standard'); // Always use standard model (enhanced has memory issues)

      setProgress(30);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setResult(data.result);
        
        // Fetch preview of result
        const previewResponse = await fetch(data.result.downloadUrl);
        if (previewResponse.ok) {
          const blob = await previewResponse.blob();
          setResultPreview(URL.createObjectURL(blob));
        }

        toast({
          title: "Background removed!",
          description: `Saved as ${outputFormat.toUpperCase()} (${(data.result.processedSize / 1024).toFixed(1)} KB)`,
        });
      }
    } catch (error: any) {
      console.error('Background removal error:', error);
      
      // Better error messages
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

  // Download result
  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `${selectedFile?.name.split('.')[0]}_no_bg.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset
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
        canonical="https://microjpeg.com/remove-background"
      />

      {/* Dark mode support: bg changes based on system preference */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered • WebP & AVIF Output</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Remove Background from Image
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Instantly remove backgrounds with AI. <strong className="text-gray-900 dark:text-white">Unlike remove.bg</strong>, 
              save directly as WebP or AVIF for smaller files and faster websites.
            </p>
          </div>

          {/* Main Tool */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload / Preview Section */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {result ? 'Original Image' : 'Upload Image'}
              </h2>

              {!selectedFile ? (
                /* Drop Zone */
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Drop your image here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse (JPG, PNG, WebP - Max 10MB)
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
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
                /* Preview */
                <div className="relative">
                  <img
                    src={previewUrl!}
                    alt="Original"
                    className="w-full rounded-lg max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                </div>
              )}
            </Card>

            {/* Result / Options Section */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {result ? 'Result - Background Removed' : 'Output Options'}
              </h2>

              {result && resultPreview ? (
                /* Result Preview */
                <div>
                  {/* Checkered background to show transparency */}
                  <div 
                    className="relative rounded-lg p-4"
                    style={{
                      backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAE/xGY/MABDApgYmQEaUeHOMDAwMDAwMDAwMDAwMDAwMDAwAAAQUABI1vBI/EAAAAASUVORK5CYII=")`,
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
                      <span className="text-gray-600 dark:text-gray-400">Format:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{result.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(result.processedSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Processing time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(result.processingTime / 1000).toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button onClick={handleDownload} className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download {outputFormat.toUpperCase()}
                    </Button>
                    <Button variant="outline" onClick={handleReset} className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      New Image
                    </Button>
                  </div>
                </div>
              ) : (
                /* Options Form */
                <div className="space-y-6">
                  {/* Output Format - Now includes JPG */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Output Format
                      <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
                        Unique Feature!
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['png', 'webp', 'avif', 'jpg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`p-3 rounded-lg border-2 text-center transition-colors ${
                            outputFormat === fmt
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="font-medium uppercase text-sm">{fmt}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {fmt === 'png' && 'Transparent'}
                            {fmt === 'webp' && '~30% smaller'}
                            {fmt === 'avif' && '~50% smaller'}
                            {fmt === 'jpg' && 'White BG'}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      💡 Other tools only output PNG. MicroJPEG lets you save as WebP/AVIF for faster websites!
                    </p>
                    {outputFormat === 'jpg' && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ JPG doesn't support transparency - background will be white
                      </p>
                    )}
                  </div>

                  {/* Quality Slider - Fixed styling */}
                  {outputFormat !== 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                        Quality: <span className="text-purple-600 dark:text-purple-400 font-bold">{quality}%</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(quality - 50) * 2}%, #e5e7eb ${(quality - 50) * 2}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>50% (Smaller)</span>
                        <span>100% (Best)</span>
                      </div>
                    </div>
                  )}

                  {/* Removed Enhanced model option - it causes CUDA memory errors */}
                  {/* Just show info about the AI model */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">AI Model: Standard</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Fast processing with excellent edge detection
                    </p>
                  </div>

                  {/* Process Button */}
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={!selectedFile || isProcessing}
                    className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isProcessing ? (
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
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                        {progress < 30 ? 'Uploading...' : progress < 80 ? 'AI processing...' : 'Finalizing...'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">AI-Powered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced AI model for precise edge detection and clean cutouts
              </p>
            </Card>

            <Card className="p-6 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">WebP & AVIF Output</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save up to 50% file size compared to PNG while keeping transparency
              </p>
            </Card>

            <Card className="p-6 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">E-commerce Ready</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Perfect for product photos, Shopify stores, and marketing materials
              </p>
            </Card>
          </div>

          {/* SEO Content */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="prose dark:prose-invert prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose MicroJPEG for Background Removal?
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Most background removal tools like remove.bg and Canva only output PNG files. 
                While PNG supports transparency, it creates large files that slow down your website.
              </p>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                <strong className="text-gray-900 dark:text-white">MicroJPEG is different.</strong> We let you save your transparent images as 
                WebP or AVIF - modern formats that are 30-50% smaller than PNG while maintaining 
                perfect transparency. This means:
              </p>
              
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                <li>Faster loading product pages</li>
                <li>Better Core Web Vitals scores</li>
                <li>Lower bandwidth costs</li>
                <li>Improved SEO rankings</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Perfect for E-commerce
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you run a Shopify store, Amazon FBA business, or any e-commerce site, you know 
                that image optimization matters. Our background remover + WebP/AVIF conversion 
                is the perfect one-two punch for fast-loading product pages.
              </p>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                How It Works
              </h3>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Upload your product photo or image (JPG, PNG, or WebP)</li>
                <li>Our AI instantly removes the background</li>
                <li>Choose your output format: PNG, WebP, AVIF, or JPG</li>
                <li>Download your optimized transparent image</li>
              </ol>
            </div>
          </div>
        </main>

        {/* Footer spacing */}
        <div className="h-16"></div>
      </div>
    </>
  );
}
