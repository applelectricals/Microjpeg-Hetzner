// client/src/pages/enhance-image.tsx
// AI Image Enhancer Page with Full-Width Before/After Comparison
// Updated: Larger image display, single column layout, restored SEO content

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Loader2, X, ZoomIn, User, AlertCircle, AlertTriangle, Info, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  originalDimensions: { width: number; height: number };
  inputDimensions?: { width: number; height: number };
  newDimensions: { width: number; height: number };
  format: string;
  scale: number;
  wasResized?: boolean;
  processingTime: number;
  downloadUrl: string;
}

interface LimitsResponse {
  limit: number;
  remaining: number;
  tier: string;
}

// Before/After Comparison Slider Component - Full Width Version
interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

function ComparisonSlider({ beforeImage, afterImage, beforeLabel = "Before", afterLabel = "After" }: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden cursor-ew-resize select-none bg-gray-800"
      style={{ height: 'min(70vh, 600px)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image (Full width, behind) */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <img 
          src={afterImage} 
          alt="Enhanced" 
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
        {/* After label */}
        <div className="absolute top-4 right-4 bg-yellow-500 text-black text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
          {afterLabel}
        </div>
      </div>
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div 
          className="h-full flex items-center justify-center bg-gray-900"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100vw' }}
        >
          <img 
            src={beforeImage} 
            alt="Original" 
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
        {/* Before label */}
        <div className="absolute top-4 left-4 bg-gray-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
          {beforeLabel}
        </div>
      </div>
      
      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-gray-200">
          <GripVertical className="w-6 h-6 text-gray-600" />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
        ← Drag to compare →
      </div>
    </div>
  );
}

// SEO Content
const SEO_TITLE = "AI Image Enhancer - Upscale to 4K & 8K Free Online | MicroJPEG";
const SEO_DESCRIPTION = "Enhance and upscale images to 4K or 8K resolution with AI. Real-ESRGAN powered upscaler with face enhancement. Save as WebP, AVIF, PNG or JPG.";

// Limits
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_INPUT_PIXELS = 2000000;
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

  // Fetch usage limits
  const { data: enhanceLimits, refetch: refetchLimits } = useQuery<LimitsResponse>({
    queryKey: ['/api/ai/enhance/limits'],
    retry: false,
  }) as { data: LimitsResponse | undefined; refetch: () => void };

  // Setup upgrade prompt
  const upgradePrompt = useUpgradePrompt({
    feature: 'image_enhancement',
    usageStats: enhanceLimits ? {
      used: enhanceLimits.limit - enhanceLimits.remaining,
      remaining: enhanceLimits.remaining,
      limit: enhanceLimits.limit,
    } : null,
    tierName: enhanceLimits?.tier || 'free',
  });

  // Calculate preview dimensions
  const calculatePreview = () => {
    if (!originalDimensions) return null;

    const { width, height } = originalDimensions;
    const pixels = width * height;
    
    let inputWidth = width;
    let inputHeight = height;
    let needsResize = false;

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

    return { needsResize, inputWidth, inputHeight, outputWidth, outputHeight, megapixels };
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

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 15MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setResultPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      
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

    // Check limits before processing
    if (enhanceLimits && enhanceLimits.remaining <= 0) {
      upgradePrompt.setIsOpen(true);
      return;
    }

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

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 3, 85));
      }, 1500);

      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(90);

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

        if (data.error === 'scale_restricted') {
          upgradePrompt.showRestrictedFeaturePrompt(`${scale}x upscale`);
          return;
        }

        if (data.error === 'feature_restricted') {
          upgradePrompt.showRestrictedFeaturePrompt('Face Enhancement');
          return;
        }

        throw new Error(data.error || data.message || 'Processing failed');
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
          title: "Image enhanced!",
          description: `Upscaled ${scale}x to ${data.result.newDimensions.width}x${data.result.newDimensions.height}`,
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
        canonicalUrl="https://microjpeg.com/enhance-image"
      />

      <div className="min-h-screen bg-gray-900">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Usage Indicator */}
          {enhanceLimits && (
            <div className="mb-6">
              <UsageIndicator
                feature="image_enhancement"
                used={enhanceLimits.limit - enhanceLimits.remaining}
                limit={enhanceLimits.limit}
                onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
              />
            </div>
          )}

          {/* Limit Reached Banner */}
          {enhanceLimits && enhanceLimits.remaining <= 0 && (
            <LimitReachedBanner
              feature="image_enhancement"
              onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
            />
          )}

          {/* Hero Section */}
          <div className="text-center mb-8">
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

          {/* Main Tool - Full Width Single Column */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            
            {/* Result View - Full Width Comparison */}
            {result && resultPreview && previewUrl ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white text-center">
                  Before & After Comparison
                </h2>
                
                {/* Large Comparison Slider */}
                <ComparisonSlider 
                  beforeImage={previewUrl}
                  afterImage={resultPreview}
                  beforeLabel="Original"
                  afterLabel={`${result.scale}x Enhanced`}
                />
                
                {/* Stats and Download - Below the image */}
                <div className="mt-6 max-w-3xl mx-auto">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-gray-400 text-xs mb-1">Original Size</div>
                      <div className="text-white font-medium">
                        {result.originalDimensions.width} × {result.originalDimensions.height}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                      <div className="text-gray-400 text-xs mb-1">Original File</div>
                      <div className="text-white font-medium">
                        {(result.originalSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-4 text-center border border-yellow-500/30">
                      <div className="text-yellow-400 text-xs mb-1">Enhanced Size</div>
                      <div className="text-white font-medium">
                        {result.newDimensions.width} × {result.newDimensions.height}
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-4 text-center border border-yellow-500/30">
                      <div className="text-yellow-400 text-xs mb-1">Enhanced File</div>
                      <div className="text-white font-medium">
                        {(result.processedSize / 1024).toFixed(0)} KB • {result.format}
                      </div>
                    </div>
                  </div>

                  {result.wasResized && result.inputDimensions && (
                    <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-sm text-amber-400 text-center">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      Input was resized to {result.inputDimensions.width}×{result.inputDimensions.height} before enhancement (GPU memory limit)
                    </div>
                  )}

                  <div className="text-sm text-gray-500 text-center mb-4">
                    Processing time: {(result.processingTime / 1000).toFixed(1)} seconds
                  </div>

                  {/* Download Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={handleDownload} 
                      size="lg"
                      className="px-8 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download {result.scale}x {result.format}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleReset}
                      className="px-8 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Enhance Another Image
                    </Button>
                  </div>
                </div>
              </div>
            ) : !selectedFile ? (
              /* Upload Zone - Full Width */
              <div
                className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-gray-600 hover:border-yellow-500/50 hover:bg-gray-700/30'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-500 mx-auto mb-6" />
                <p className="text-2xl font-medium text-gray-200 mb-2">
                  Drop your image here
                </p>
                <p className="text-gray-400 mb-4">
                  or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WebP • Max 15MB
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Best results with images under 1500×1500px</span>
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
              /* Preview and Options - Before Processing */
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white text-center">
                  Configure Enhancement
                </h2>

                {/* Large Preview Image */}
                <div className="relative mb-6 bg-gray-900 rounded-xl overflow-hidden" style={{ height: 'min(50vh, 400px)' }}>
                  <img
                    src={previewUrl!}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-4 right-4 p-2 bg-gray-800/80 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg">
                    {selectedFile.name} • {originalDimensions?.width} × {originalDimensions?.height}px
                  </div>
                </div>

                {previewInfo?.needsResize && (
                  <div className="mb-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 max-w-2xl mx-auto">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-amber-400 font-medium">Large image detected</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Image will be resized to {previewInfo.inputWidth}×{previewInfo.inputHeight}px before enhancement (GPU memory limit). 
                          Final output: {previewInfo.outputWidth}×{previewInfo.outputHeight}px
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Options Grid - Centered Below Image */}
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Scale Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-3 text-center">
                      Upscale Factor
                    </label>
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
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
                    
                    {previewInfo && (
                      <div className="mt-3 text-center">
                        <span className="text-gray-400">Output: </span>
                        <span className="text-yellow-400 font-medium">
                          {previewInfo.outputWidth} × {previewInfo.outputHeight}px
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({previewInfo.megapixels} MP)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Options Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Face Enhancement */}
                    <button
                      onClick={() => setFaceEnhance(!faceEnhance)}
                      className={`p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
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
                          <div className="text-xs text-gray-500">GFPGAN for portraits</div>
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

                    {/* Output Format */}
                    <div className="p-4 rounded-lg border-2 border-gray-600">
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Output Format
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['png', 'webp', 'avif', 'jpg'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setOutputFormat(fmt)}
                            className={`p-2 rounded text-center transition-all text-sm ${
                              outputFormat === fmt
                                ? 'bg-yellow-500/20 text-yellow-400 font-medium'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quality Slider */}
                  {outputFormat !== 'png' && (
                    <div className="max-w-md mx-auto">
                      <label className="block text-sm font-medium text-gray-200 mb-3 text-center">
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
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Smaller file</span>
                        <span>Best quality</span>
                      </div>
                    </div>
                  )}

                  {/* Process Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleEnhanceImage}
                      disabled={!selectedFile || isProcessing || (enhanceLimits?.remaining || 0) <= 0}
                      size="lg"
                      className="px-12 h-14 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold disabled:opacity-50"
                    >
                      {(enhanceLimits?.remaining || 0) <= 0 ? (
                        'Limit Reached - Upgrade to Continue'
                      ) : isProcessing ? (
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
                      <div className="mt-4 max-w-md mx-auto">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-center text-gray-400 mt-2">
                          {progress < 20 ? 'Uploading...' : progress < 85 ? 'AI enhancing your image...' : 'Finalizing...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ZoomIn className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Up to 8x Upscale</h3>
              <p className="text-sm text-gray-400">
                Transform small images into stunning high resolution with AI-powered super-resolution technology
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Face Enhancement</h3>
              <p className="text-sm text-gray-400">
                GFPGAN integration to restore and enhance facial details in portraits and group photos
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Modern Formats</h3>
              <p className="text-sm text-gray-400">
                Save enhanced images as PNG, WebP, AVIF, or JPG for optimal quality and file size
              </p>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              AI-Powered Image Enhancement
            </h2>
            
            <p className="text-gray-300 mb-4">
              MicroJPEG's AI Image Enhancer uses <strong className="text-yellow-400">Real-ESRGAN</strong>, 
              the same technology trusted by professionals for upscaling low-resolution images to stunning 
              4K and 8K quality without losing detail.
            </p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">
              Perfect For:
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Upscaling old photos and memories</li>
              <li>Enhancing product images for e-commerce</li>
              <li>Preparing images for large prints and posters</li>
              <li>Restoring low-quality social media downloads</li>
              <li>Improving AI-generated images</li>
              <li>Enhancing screenshots and graphics</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">
              How It Works
            </h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2 ml-4">
              <li>Upload your image (JPG, PNG, or WebP up to 15MB)</li>
              <li>Choose your upscale factor (2x, 4x, or 8x)</li>
              <li>Enable face enhancement for portraits (optional)</li>
              <li>Select your preferred output format and quality</li>
              <li>Download your enhanced high-resolution image</li>
            </ol>

            <h3 className="text-xl font-bold text-white mb-3 mt-6">
              Why Choose MicroJPEG's AI Enhancer?
            </h3>
            <p className="text-gray-300 mb-4">
              Unlike other online image enhancers, MicroJPEG lets you save your upscaled images in 
              <strong className="text-yellow-400"> WebP or AVIF format</strong> - modern formats that are 
              30-50% smaller than PNG while maintaining excellent quality. This means faster loading 
              times for your website and lower storage costs.
            </p>

            <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h4 className="text-lg font-semibold text-white mb-3">Technical Specifications</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">AI Model:</span>
                  <span className="text-white ml-2">Real-ESRGAN + GFPGAN</span>
                </div>
                <div>
                  <span className="text-gray-400">Max Upload Size:</span>
                  <span className="text-white ml-2">15MB</span>
                </div>
                <div>
                  <span className="text-gray-400">Supported Inputs:</span>
                  <span className="text-white ml-2">JPG, PNG, WebP</span>
                </div>
                <div>
                  <span className="text-gray-400">Output Formats:</span>
                  <span className="text-white ml-2">PNG, WebP, AVIF, JPG</span>
                </div>
                <div>
                  <span className="text-gray-400">Max Upscale:</span>
                  <span className="text-white ml-2">8x (up to 8K resolution)</span>
                </div>
                <div>
                  <span className="text-gray-400">Processing Time:</span>
                  <span className="text-white ml-2">10-30 seconds</span>
                </div>
              </div>
            </div>
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

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt {...upgradePrompt.promptProps} />
    </>
  );
}
