// client/src/pages/enhance-image.tsx
// AI Image Enhancer Page - Upscale to 4K/8K with Real-ESRGAN
// Updated: Shows resize warnings for large images

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Loader2, X, ZoomIn, User, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import logoUrl from '@assets/mascot-logo-optimized.png';

// Types
interface ProcessedImage {
  id: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
  originalDimensions: { width: number; height: number };
  inputDimensions?: { width: number; height: number };
  newDimensions: { width: number; height: number };
  format: string;
  scale: number;
  wasResized?: boolean;
  processingTime: number;
  downloadUrl: string;
}

// SEO Content
const SEO_TITLE = "AI Image Enhancer - Upscale to 4K & 8K Free Online | MicroJPEG";
const SEO_DESCRIPTION = "Enhance and upscale images to 4K or 8K resolution with AI. Real-ESRGAN powered upscaler with face enhancement. Save as WebP, AVIF, PNG or JPG.";

// Limits (must match backend)
const MAX_INPUT_PIXELS = 2000000; // 2 megapixels
const MAX_INPUT_DIMENSION = 1500;

// Supported formats
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function EnhanceImagePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Options
  const [scale, setScale] = useState<2 | 4 | 8>(2);
  const [faceEnhance, setFaceEnhance] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'avif' | 'jpg'>('png');
  const [quality, setQuality] = useState(90);

  // Calculate if image needs resize and preview dimensions
  const calculatePreview = () => {
    if (!originalDimensions) return null;

    const { width, height } = originalDimensions;
    const pixels = width * height;
    
    let inputWidth = width;
    let inputHeight = height;
    let needsResize = false;

    // Check if resize will be needed
    if (pixels > MAX_INPUT_PIXELS || width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) {
      needsResize = true;
      
      if (width > MAX_INPUT_DIMENSION || height > MAX_INPUT_DIMENSION) {
        const ratio = Math.min(MAX_INPUT_DIMENSION / width, MAX_INPUT_DIMENSION / height);
        inputWidth = Math.floor(width * ratio);
        inputHeight = Math.floor(height * ratio);
      }
      
      const newPixels = inputWidth * inputHeight;
      if (newPixels > MAX_INPUT_PIXELS) {
        const ratio = Math.sqrt(MAX_INPUT_PIXELS / newPixels);
        inputWidth = Math.floor(inputWidth * ratio);
        inputHeight = Math.floor(inputHeight * ratio);
      }
    }

    const outputWidth = inputWidth * scale;
    const outputHeight = inputHeight * scale;
    const megapixels = ((outputWidth * outputHeight) / 1000000).toFixed(1);

    return {
      needsResize,
      inputWidth,
      inputHeight,
      outputWidth,
      outputHeight,
      megapixels
    };
  };

  const previewInfo = calculatePreview();

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!SUPPORTED_FORMATS.includes(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
      toast({
        title: "Unsupported format",
        description: "Please upload JPG, PNG, or WebP images.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 15MB for enhancement",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setResultPreview(null);

    // Create preview and get dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
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

  const handleEnhanceImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('scale', scale.toString());
      formData.append('faceEnhance', faceEnhance.toString());
      formData.append('outputFormat', outputFormat);
      formData.append('quality', quality.toString());

      setProgress(20);

      // Enhancement takes longer, simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 3, 85));
      }, 1500);

      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(90);

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

        const wasResized = data.result.wasResized;
        toast({
          title: "Image enhanced!",
          description: wasResized 
            ? `Image was resized before enhancement. Output: ${data.result.newDimensions.width}x${data.result.newDimensions.height}`
            : `Upscaled ${scale}x to ${data.result.newDimensions.width}x${data.result.newDimensions.height}`,
        });
      }
    } catch (error: any) {
      console.error('Enhancement error:', error);
      
      toast({
        title: "Enhancement failed",
        description: error.message,
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
    link.download = `${selectedFile?.name.split('.')[0]}_${scale}x_enhanced.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setOriginalDimensions(null);
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
        canonical="https://microjpeg.com/enhance-image"
      />

      <div className="min-h-screen bg-gray-900">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full mb-4 border border-yellow-500/30">
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered • Up to 8x Upscale</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Image Enhancer
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Upscale your images to <strong className="text-yellow-400">4K or 8K resolution</strong> using 
              Real-ESRGAN AI. Enhance faces, sharpen details, and save in modern formats.
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
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-gray-600 hover:border-yellow-500/50 hover:bg-gray-700/30'
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
                    JPG, PNG, or WebP - Max 15MB
                  </p>
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                      <Info className="w-3 h-3" />
                      <span>Best results with images under 1500×1500px</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Larger images will be automatically resized before enhancement
                    </p>
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
                  <div className="mt-3 flex justify-between text-sm text-gray-400">
                    <span>{selectedFile.name}</span>
                    {originalDimensions && (
                      <span>{originalDimensions.width} × {originalDimensions.height}px</span>
                    )}
                  </div>
                  
                  {/* Size warning */}
                  {previewInfo?.needsResize && (
                    <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="text-amber-400 font-medium">Large image detected</p>
                          <p className="text-gray-400 mt-1">
                            Image will be resized to {previewInfo.inputWidth}×{previewInfo.inputHeight}px before enhancement 
                            (GPU memory limit). Final output: {previewInfo.outputWidth}×{previewInfo.outputHeight}px
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result / Options Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 text-white">
                {result ? 'Enhanced Result' : 'Enhancement Options'}
              </h2>

              {result && resultPreview ? (
                <div>
                  <div className="relative rounded-lg overflow-hidden bg-gray-700/50">
                    <img
                      src={resultPreview}
                      alt="Enhanced"
                      className="w-full max-h-80 object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                      {result.scale}x ENHANCED
                    </div>
                  </div>
                  
                  {/* Show resize info if applicable */}
                  {result.wasResized && result.inputDimensions && (
                    <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-400">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Image was resized from {result.originalDimensions.width}×{result.originalDimensions.height} 
                      to {result.inputDimensions.width}×{result.inputDimensions.height} before enhancement
                    </div>
                  )}
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Original</div>
                      <div className="text-white font-medium">
                        {result.originalDimensions.width} × {result.originalDimensions.height}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {(result.originalSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                      <div className="text-yellow-400 text-xs mb-1">Enhanced</div>
                      <div className="text-white font-medium">
                        {result.newDimensions.width} × {result.newDimensions.height}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {(result.processedSize / 1024).toFixed(0)} KB • {result.format}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Processing time: {(result.processingTime / 1000).toFixed(1)}s
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={handleDownload} 
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {result.scale}x {outputFormat.toUpperCase()}
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
                  {/* Scale Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Upscale Factor
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {([2, 4, 8] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setScale(s)}
                          className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                            scale === s
                              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                              : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-2xl">{s}x</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {s === 2 && 'Fast'}
                            {s === 4 && 'Recommended'}
                            {s === 8 && 'Maximum'}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Preview dimensions */}
                    {previewInfo && (
                      <div className={`mt-3 p-3 rounded-lg text-center ${
                        previewInfo.needsResize 
                          ? 'bg-amber-500/10 border border-amber-500/20' 
                          : 'bg-gray-700/30'
                      }`}>
                        <span className="text-gray-400 text-sm">Output: </span>
                        <span className="text-yellow-400 font-medium">
                          {previewInfo.outputWidth} × {previewInfo.outputHeight}px
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({previewInfo.megapixels} MP)
                        </span>
                        {previewInfo.needsResize && (
                          <p className="text-xs text-amber-400 mt-1">
                            Input will be resized to {previewInfo.inputWidth}×{previewInfo.inputHeight}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Face Enhancement Toggle */}
                  <div>
                    <button
                      onClick={() => setFaceEnhance(!faceEnhance)}
                      className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all duration-200 ${
                        faceEnhance
                          ? 'border-yellow-500 bg-yellow-500/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className={`w-5 h-5 ${faceEnhance ? 'text-yellow-400' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${faceEnhance ? 'text-yellow-400' : 'text-gray-200'}`}>
                            Face Enhancement
                          </div>
                          <div className="text-xs text-gray-500">
                            Use GFPGAN to improve facial details
                          </div>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        faceEnhance ? 'bg-yellow-500' : 'bg-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          faceEnhance ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                    </button>
                  </div>

                  {/* Output Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Output Format
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['png', 'webp', 'avif', 'jpg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`p-2 rounded-lg border-2 text-center transition-all duration-200 ${
                            outputFormat === fmt
                              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                              : 'border-gray-600 hover:border-gray-500 text-gray-300'
                          }`}
                        >
                          <div className="font-medium uppercase text-sm">{fmt}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Slider */}
                  {outputFormat !== 'png' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-3">
                        Quality: <span className="text-yellow-400 font-bold">{quality}%</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #eab308 0%, #eab308 ${(quality - 50) * 2}%, #374151 ${(quality - 50) * 2}%, #374151 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>50% (Smaller)</span>
                        <span>100% (Best)</span>
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  <Button
                    onClick={handleEnhanceImage}
                    disabled={!selectedFile || isProcessing}
                    className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enhancing... (10-30s)
                      </>
                    ) : (
                      <>
                        <ZoomIn className="w-5 h-5 mr-2" />
                        Enhance {scale}x
                      </>
                    )}
                  </Button>

                  {/* Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-400">
                        {progress < 20 ? 'Uploading...' : progress < 85 ? 'AI enhancing...' : 'Finalizing...'}
                      </p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex items-start gap-2 p-3 bg-gray-700/30 rounded-lg text-xs text-gray-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Enhancement uses Real-ESRGAN AI. Large images (&gt;1500px) are automatically resized 
                      to fit GPU memory limits before processing.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ZoomIn className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Up to 8x Upscale</h3>
              <p className="text-sm text-gray-400">
                Transform small images into stunning high resolution with AI-powered super-resolution
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Face Enhancement</h3>
              <p className="text-sm text-gray-400">
                GFPGAN integration to restore and enhance facial details in portraits
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Modern Formats</h3>
              <p className="text-sm text-gray-400">
                Save enhanced images as PNG, WebP, AVIF, or JPG for optimal quality
              </p>
            </div>
          </div>

          {/* SEO Content */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              AI-Powered Image Enhancement
            </h2>
            
            <p className="text-gray-300 mb-4">
              MicroJPEG's AI Image Enhancer uses <strong className="text-yellow-400">Real-ESRGAN</strong>, 
              the same technology trusted by professionals for upscaling images while preserving detail.
            </p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">
              Perfect For:
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Upscaling old photos and memories</li>
              <li>Enhancing product images for e-commerce</li>
              <li>Preparing images for large prints</li>
              <li>Restoring low-quality social media downloads</li>
              <li>Improving AI-generated images</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">
              How It Works
            </h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
              <li>Upload your image (JPG, PNG, or WebP)</li>
              <li>Choose your upscale factor (2x, 4x, or 8x)</li>
              <li>Enable face enhancement for portraits (optional)</li>
              <li>Select output format and quality</li>
              <li>Download your enhanced high-resolution image</li>
            </ol>
          </div>
        </main>

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
    </>
  );
}
