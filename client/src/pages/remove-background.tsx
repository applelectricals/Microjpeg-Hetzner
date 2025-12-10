// client/src/pages/remove-background.tsx
// AI Background Removal Page - UNIQUE: Output to WebP/AVIF!

import React, { useState, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Upload, Download, Sparkles, Image as ImageIcon, Loader2, Check, X, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';

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
const SEO_DESCRIPTION = "Remove background from images instantly with AI. Unlike other tools, save as WebP, AVIF, or PNG. Perfect for e-commerce, product photos, and web optimization.";

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
  
  // Options
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'avif'>('png');
  const [quality, setQuality] = useState(90);
  const [model, setModel] = useState<'standard' | 'enhanced'>('standard');

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, WebP)",
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
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
      formData.append('model', model);

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
      toast({
        title: "Processing failed",
        description: error.message,
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
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href="https://microjpeg.com/remove-background" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered • WebP & AVIF Output</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Remove Background from Image
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Instantly remove backgrounds with AI. <strong>Unlike remove.bg</strong>, 
              save directly as WebP or AVIF for smaller files and faster websites.
            </p>
          </div>

          {/* Main Tool */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload / Preview Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {result ? 'Original Image' : 'Upload Image'}
              </h2>

              {!selectedFile ? (
                /* Drop Zone */
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drop your image here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse (JPG, PNG, WebP - Max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                    className="w-full rounded-lg max-h-96 object-contain bg-gray-100"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-3 text-sm text-gray-600">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                </div>
              )}
            </Card>

            {/* Result / Options Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {result ? 'Result - Background Removed' : 'Output Options'}
              </h2>

              {result && resultPreview ? (
                /* Result Preview */
                <div>
                  <div className="relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAE/xGY/MABDApgYmQEaUeHOMDAwMDAwMDAwMDAwMDAwMDAwAAAQUABI1vBI/EAAAAASUVORK5CYII=')] rounded-lg p-4">
                    <img
                      src={resultPreview}
                      alt="Result"
                      className="w-full max-h-80 object-contain"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="font-medium">{result.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{(result.processedSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing time:</span>
                      <span className="font-medium">{(result.processingTime / 1000).toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button onClick={handleDownload} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download {outputFormat.toUpperCase()}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      New Image
                    </Button>
                  </div>
                </div>
              ) : (
                /* Options Form */
                <div className="space-y-6">
                  {/* Output Format - OUR UNIQUE FEATURE! */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Format
                      <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                        Unique Feature!
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['png', 'webp', 'avif'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`p-3 rounded-lg border-2 text-center transition-colors ${
                            outputFormat === fmt
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium uppercase">{fmt}</div>
                          <div className="text-xs text-gray-500">
                            {fmt === 'png' && 'Best quality'}
                            {fmt === 'webp' && '~30% smaller'}
                            {fmt === 'avif' && '~50% smaller'}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Other tools only output PNG. MicroJPEG lets you save as WebP/AVIF for faster websites!
                    </p>
                  </div>

                  {/* Quality Slider */}
                  {outputFormat !== 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality: {quality}%
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Model
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setModel('standard')}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          model === 'standard'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Standard</div>
                        <div className="text-xs text-gray-500">Fast • Good quality</div>
                      </button>
                      <button
                        onClick={() => setModel('enhanced')}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          model === 'enhanced'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">Enhanced</div>
                        <div className="text-xs text-gray-500">Slower • Best quality</div>
                      </button>
                    </div>
                  </div>

                  {/* Process Button */}
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={!selectedFile || isProcessing}
                    className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700"
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
                    <Progress value={progress} className="h-2" />
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Advanced AI model for precise edge detection and clean cutouts
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">WebP & AVIF Output</h3>
              <p className="text-sm text-gray-600">
                Save up to 50% file size compared to PNG while keeping transparency
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">E-commerce Ready</h3>
              <p className="text-sm text-gray-600">
                Perfect for product photos, Shopify stores, and marketing materials
              </p>
            </Card>
          </div>

          {/* SEO Content */}
          <div className="mt-16 prose max-w-4xl mx-auto">
            <h2>Why Choose MicroJPEG for Background Removal?</h2>
            
            <p>
              Most background removal tools like remove.bg and Canva only output PNG files. 
              While PNG supports transparency, it creates large files that slow down your website.
            </p>
            
            <p>
              <strong>MicroJPEG is different.</strong> We let you save your transparent images as 
              WebP or AVIF - modern formats that are 30-50% smaller than PNG while maintaining 
              perfect transparency. This means:
            </p>
            
            <ul>
              <li>Faster loading product pages</li>
              <li>Better Core Web Vitals scores</li>
              <li>Lower bandwidth costs</li>
              <li>Improved SEO rankings</li>
            </ul>

            <h3>Perfect for E-commerce</h3>
            <p>
              If you run a Shopify store, Amazon FBA business, or any e-commerce site, you know 
              that image optimization matters. Our background remover + WebP/AVIF conversion 
              is the perfect one-two punch for fast-loading product pages.
            </p>

            <h3>How It Works</h3>
            <ol>
              <li>Upload your product photo or image</li>
              <li>Our AI instantly removes the background</li>
              <li>Choose your output format: PNG, WebP, or AVIF</li>
              <li>Download your optimized transparent image</li>
            </ol>
          </div>
        </main>
      </div>
    </>
  );
}
