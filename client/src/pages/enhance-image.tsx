// client/src/pages/enhance-image.tsx
// AI Image Enhancer Page with Before/After Comparison Slider
// Updated: 15MB limit, vertical comparison slider

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Loader2, X, ZoomIn, User, AlertCircle, AlertTriangle, Info, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';

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

// Before/After Comparison Slider Component
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
      className="relative w-full h-80 rounded-lg overflow-hidden cursor-ew-resize select-none bg-gray-800"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After Image (Full width, behind) */}
      <div className="absolute inset-0">
        <img 
          src={afterImage} 
          alt="Enhanced" 
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* After label */}
        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
          {afterLabel}
        </div>
      </div>
      
      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Original" 
          className="w-full h-full object-contain"
          style={{ 
            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
            maxWidth: 'none'
          }}
          draggable={false}
        />
        {/* Before label */}
        <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
          {beforeLabel}
        </div>
      </div>
      
      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <GripVertical className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
        Drag to compare
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Processing failed');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setResult(data.result);
        
        const previewResponse = await fetch(data.result.downloadUrl);
        if (previewResponse.ok) {
          const blob = await previewResponse.blob();
          setResultPreview(URL.createObjectURL(blob));
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
                {result ? 'Before & After Comparison' : 'Upload Image'}
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
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : result && resultPreview && previewUrl ? (
                /* Before/After Comparison Slider */
                <div>
                  <ComparisonSlider 
                    beforeImage={previewUrl}
                    afterImage={resultPreview}
                    beforeLabel="Original"
                    afterLabel={`${result.scale}x Enhanced`}
                  />
                  
                  {/* Stats below slider */}
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

                  {result.wasResized && result.inputDimensions && (
                    <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-400">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Input was resized to {result.inputDimensions.width}×{result.inputDimensions.height} before enhancement
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Processing time: {(result.processingTime / 1000).toFixed(1)}s
                  </div>
                </div>
              ) : (
                /* Preview before processing */
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
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    {originalDimensions && (
                      <span>{originalDimensions.width} × {originalDimensions.height}px</span>
                    )}
                  </div>
                  
                  {previewInfo?.needsResize && (
                    <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="text-amber-400 font-medium">Large image detected</p>
                          <p className="text-gray-400 mt-1">
                            Will be resized to {previewInfo.inputWidth}×{previewInfo.inputHeight}px before enhancement
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Options / Download Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold mb-4 text-white">
                {result ? 'Download Enhanced Image' : 'Enhancement Options'}
              </h2>

              {result && resultPreview ? (
                /* Download Section */
                <div className="space-y-6">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <ZoomIn className="w-5 h-5" />
                      <span className="font-semibold">Enhancement Complete!</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Your image has been upscaled {result.scale}x from {result.originalDimensions.width}×{result.originalDimensions.height} to {result.newDimensions.width}×{result.newDimensions.height} pixels.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleDownload} 
                      className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download {result.format}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="h-12 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      New Image
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Drag the slider on the left to compare before & after
                  </div>
                </div>
              ) : (
                /* Options Form */
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
                      </div>
                    )}
                  </div>

                  {/* Face Enhancement */}
                  <button
                    onClick={() => setFaceEnhance(!faceEnhance)}
                    className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
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
                        <div className="text-xs text-gray-500">GFPGAN for facial details</div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Output Format
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['png', 'webp', 'avif', 'jpg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`p-2 rounded-lg border-2 text-center transition-all ${
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
                    </div>
                  )}

                  {/* Process Button */}
                  <Button
                    onClick={handleEnhanceImage}
                    disabled={!selectedFile || isProcessing}
                    className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold disabled:opacity-50"
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
                      Large images (&gt;1500px) are automatically resized before processing. Max file size: 15MB.
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
                Transform small images into stunning high resolution with AI
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Face Enhancement</h3>
              <p className="text-sm text-gray-400">
                GFPGAN to restore and enhance facial details in portraits
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-700/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white">Modern Formats</h3>
              <p className="text-sm text-gray-400">
                Save as PNG, WebP, AVIF, or JPG for optimal quality
              </p>
            </div>
          </div>
        </main>

        <div className="h-16"></div>
      </div>
    </>
  );
}
