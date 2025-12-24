// client/src/pages/enhance-image.tsx
// AI Image Enhancer Page with Full-Width Before/After Comparison
// Updated: Larger image display, single column layout, restored SEO content

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Loader2, X, ZoomIn, User, AlertCircle, AlertTriangle, Info, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';

import { SEOHead } from '@/components/SEOHead';
import SEOFooter from '@/components/SEOFooter';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import logoUrl from '@assets/mascot-logo-optimized.png';
import samplePortrait from '@assets/sample-portrait.png';
import sampleLandscape from '@assets/sample-landscape.png';
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

// Sample Data
const SAMPLES = [
  {
    id: 'portrait',
    name: 'Portrait',
    thumb: samplePortrait,
    before: samplePortrait,
    after: samplePortrait, // In a real app these would be different, here we demo the feel
    label: 'Face Enhance'
  },
  {
    id: 'landscape',
    name: 'Landscape',
    thumb: sampleLandscape,
    before: sampleLandscape,
    after: sampleLandscape,
    label: '4K Upscale'
  }
];

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
  const videoInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<any | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [demoSample, setDemoSample] = useState(SAMPLES[0]);

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

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Unsupported format",
        description: "Please upload a valid video file (MP4, MOV, etc).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit for video
      toast({
        title: "File too large",
        description: `Maximum video size is 100MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setVideoResult(null);
    setVideoPreviewUrl(URL.createObjectURL(file));
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

  const handleEnhanceVideo = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(5);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('scale', scale.toString());
      formData.append('faceEnhance', faceEnhance.toString());

      // Simulate initial progress while starting Replicate
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 95));
      }, 3000);

      const response = await fetch('/api/enhance-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Processing failed');
      }

      setProgress(100);

      if (data.success) {
        setVideoResult(data.result);
        refetchLimits();

        toast({
          title: "Video enhanced!",
          description: "Your video is ready for download.",
        });
      }
    } catch (error: any) {
      console.error('Video enhancement error:', error);
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

        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Usage Alerts */}
          {enhanceLimits && (
            <div className="mb-8 space-y-4">
              <UsageIndicator
                feature="image_enhancement"
                used={enhanceLimits.limit - enhanceLimits.remaining}
                limit={enhanceLimits.limit}
                onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
              />
              {enhanceLimits.remaining <= 0 && (
                <LimitReachedBanner
                  feature="image_enhancement"
                  onUpgradeClick={() => upgradePrompt.setIsOpen(true)}
                />
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-800 p-1.5 rounded-2xl flex gap-1 border border-gray-700/50 shadow-2xl">
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'image'
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <ZoomIn className="w-5 h-5" />
                Image Enhancer
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'video'
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Loader2 className="w-5 h-5" />
                Video Enhancer
              </button>
            </div>
          </div>

          {activeTab === 'image' && !selectedFile ? (
            /* Split Hero Section - Only shown when no file is selected */
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 animate-in fade-in duration-700">
              <div className="text-left space-y-8">
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/20">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Powered by Real-ESRGAN</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Upscale Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500">
                    Images to 8K
                  </span>
                </h1>

                <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                  Transform blurry, low-resolution photos into stunning high-definition masterpieces. Professional AI enhancement in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold h-16 px-10 text-lg rounded-2xl shadow-xl shadow-yellow-500/20 group transition-all"
                  >
                    <Upload className="w-6 h-6 mr-3 group-hover:-translate-y-1 transition-transform" />
                    Upload Image
                  </Button>
                </div>

                <div className="pt-8 space-y-4">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Or try these samples:</p>
                  <div className="flex gap-4">
                    {SAMPLES.map(sample => (
                      <button
                        key={sample.id}
                        onClick={() => setDemoSample(sample)}
                        className={`group relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${demoSample.id === sample.id ? 'border-yellow-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                      >
                        <img src={sample.thumb} alt={sample.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-3xl opacity-30 rounded-full" />
                <ComparisonSlider
                  beforeImage={demoSample.before}
                  afterImage={demoSample.after}
                  beforeLabel="Low Res"
                  afterLabel={demoSample.label}
                  className="aspect-square shadow-3xl"
                />
              </div>
            </div>
          ) : activeTab === 'video' ? (
            /* Video Enhancer Section */
            <div className="max-w-5xl mx-auto mb-24 animate-in fade-in zoom-in duration-500">
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-[3rem] border border-gray-700/50 p-8 lg:p-12 shadow-3xl">
                {!selectedFile ? (
                  <div className="text-center space-y-8 py-12">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full border border-yellow-500/20 font-bold text-xs uppercase tracking-widest">
                      Live Feature
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-bold text-white">
                      AI Video <span className="text-yellow-500">Upscaler</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-xl mx-auto">
                      Upscale videos to 4K resolution with AI. Professional frame interpolation and face enhancement.
                    </p>
                    <div className="pt-8">
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoSelect}
                        accept="video/*"
                        className="hidden"
                      />
                      <Button
                        size="lg"
                        onClick={() => videoInputRef.current?.click()}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold h-20 px-12 text-xl rounded-2xl shadow-xl shadow-yellow-500/20 group transition-all"
                      >
                        <Upload className="w-8 h-8 mr-4 group-hover:-translate-y-1 transition-transform" />
                        Select Video File
                      </Button>
                      <p className="mt-4 text-gray-500 text-sm">Supports MP4, MOV, AVI up to 100MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white">
                        {videoResult ? 'Enhanced Video' : 'Video Preview'}
                      </h2>
                      <Button variant="ghost" onClick={handleReset} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5 mr-2" /> Cancel
                      </Button>
                    </div>

                    <div className="relative aspect-video bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-700/30">
                      {videoResult ? (
                        <video
                          src={videoResult.downloadUrl}
                          controls
                          className="w-full h-full"
                          autoPlay
                          loop
                        />
                      ) : (
                        <video
                          src={videoPreviewUrl!}
                          controls
                          className="w-full h-full"
                        />
                      )}

                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20">
                          <div className="w-24 h-24 rounded-full border-4 border-yellow-500/10 border-t-yellow-500 animate-spin mb-6" />
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Upscaling Video...</h3>
                            <p className="text-gray-400 max-w-xs">{progress < 95 ? 'Analyzing frames and enhancing resolution' : 'Finalizing video file...'}</p>
                            <div className="w-64 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">
                              <div
                                className="h-full bg-yellow-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-yellow-500 font-bold mt-2">{progress}%</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {!videoResult && !isProcessing && (
                      <div className="max-w-md mx-auto space-y-8">
                        <div className="space-y-4">
                          <label className="text-center block text-sm font-bold text-gray-400 uppercase tracking-widest font-mono">Upscale Target</label>
                          <div className="grid grid-cols-2 gap-4">
                            {([2, 4] as const).map(s => (
                              <button
                                key={s}
                                onClick={() => setScale(s)}
                                className={`p-6 rounded-2xl border-2 transition-all ${scale === s ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                  }`}
                              >
                                <div className="text-3xl font-black">{s}x</div>
                                <div className="text-xs font-bold opacity-60 uppercase">{s === 2 ? 'HD' : '4K'}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={handleEnhanceVideo}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold h-16 rounded-2xl shadow-xl shadow-yellow-500/20"
                        >
                          Enhance This Video
                        </Button>
                      </div>
                    )}

                    {videoResult && (
                      <div className="flex flex-col items-center gap-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Original</p>
                            <p className="text-white font-medium">{(videoResult.originalSize / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Enhanced</p>
                            <p className="text-yellow-500 font-bold">{(videoResult.processedSize / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Format</p>
                            <p className="text-white font-medium">{videoResult.format}</p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Scale</p>
                            <p className="text-white font-medium">{scale}x</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = videoResult.downloadUrl;
                            link.download = `enhanced_${selectedFile?.name}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          size="lg"
                          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl px-12 h-16 shadow-lg shadow-yellow-500/20"
                        >
                          <Download className="w-6 h-6 mr-3" /> Download Video
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Active Image Tool (When file is selected OR result exists) */
            <div className="max-w-5xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="bg-gray-800/80 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-gray-700/50 shadow-3xl">
                {result && resultPreview && previewUrl ? (
                  /* Result Comparison */
                  <div className="space-y-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white">Enhanced Result</h2>
                      <Button variant="ghost" onClick={handleReset} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5 mr-2" /> Start Over
                      </Button>
                    </div>

                    <ComparisonSlider
                      beforeImage={previewUrl}
                      afterImage={resultPreview}
                      beforeLabel="Original"
                      afterLabel={`${result.scale}x Enhanced`}
                      className="aspect-video"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Original</p>
                        <p className="text-white font-medium">{result.originalDimensions.width}×{result.originalDimensions.height}</p>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Enhanced</p>
                        <p className="text-yellow-500 font-bold">{result.newDimensions.width}×{result.newDimensions.height}</p>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Time</p>
                        <p className="text-white font-medium">{(result.processingTime / 1000).toFixed(1)}s</p>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/30">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Size</p>
                        <p className="text-white font-medium">{(result.processedSize / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button onClick={handleDownload} size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl px-12 h-16 shadow-lg shadow-yellow-500/20">
                        <Download className="w-6 h-6 mr-3" /> Download Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Configuration & Processing Zone */
                  <div className="space-y-12">
                    {/* Preview Image */}
                    <div className="relative aspect-video bg-gray-900/50 rounded-3xl overflow-hidden border border-gray-700/30 group">
                      <img src={previewUrl!} alt="Preview" className="w-full h-full object-contain" />
                      <button onClick={handleReset} className="absolute top-6 right-6 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="max-w-3xl mx-auto space-y-10">
                      <div className="space-y-4">
                        <label className="text-center block text-sm font-bold text-gray-400 uppercase tracking-widest">Upscale Factor</label>
                        <div className="grid grid-cols-3 gap-4">
                          {([2, 4, 8] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => setScale(s)}
                              className={`p-6 rounded-2xl border-2 transition-all ${scale === s ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                                }`}
                            >
                              <div className="text-3xl font-black">{s}x</div>
                              <div className="text-xs font-bold opacity-60 uppercase">{s === 4 ? 'Best' : s === 8 ? 'Ultra' : 'Fast'}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <button
                          onClick={() => setFaceEnhance(!faceEnhance)}
                          className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${faceEnhance ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-gray-700 text-gray-400'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <User className="w-6 h-6" />
                            <div className="text-left">
                              <p className="font-bold">Face Enhance</p>
                              <p className="text-xs opacity-60">AI restoration</p>
                            </div>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative ${faceEnhance ? 'bg-yellow-500' : 'bg-gray-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${faceEnhance ? 'right-1' : 'left-1'}`} />
                          </div>
                        </button>

                        <div className="p-6 rounded-2xl border-2 border-gray-700 bg-gray-900/30">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Format</p>
                          <div className="grid grid-cols-4 gap-2">
                            {['PNG', 'WEBP', 'AVIF', 'JPG'].map(f => (
                              <button
                                onClick={() => setOutputFormat(f.toLowerCase() as any)}
                                key={f}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${outputFormat === f.toLowerCase() ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-center pt-4">
                        <Button
                          onClick={handleEnhanceImage}
                          disabled={isProcessing}
                          size="lg"
                          className="w-full h-20 text-xl font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-3xl shadow-2xl shadow-yellow-500/20"
                        >
                          {isProcessing ? (
                            <><Loader2 className="w-8 h-8 mr-4 animate-spin" /> Processing AI...</>
                          ) : (
                            <><ZoomIn className="w-8 h-8 mr-4" /> Enhance Now</>
                          )}
                        </Button>
                        {isProcessing && (
                          <div className="mt-6 space-y-3">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest animate-pulse">
                              {progress < 80 ? 'Sharpening pixels...' : 'Finalizing quality...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 py-24 border-t border-gray-800/50">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-3xl flex items-center justify-center mx-auto">
                <ZoomIn className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Super Resolution</h3>
              <p className="text-gray-400">Upscale images up to 8x with state-of-the-art AI technology.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Portrait Restore</h3>
              <p className="text-gray-400">Integrated GFPGAN model to restore faces in blurry or old photos.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Modern Exports</h3>
              <p className="text-gray-400">Export in high-quality WebP or AVIF for the best web performance.</p>
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="max-w-4xl mx-auto py-24 border-t border-gray-800/50 space-y-12">
            <section className="space-y-6">
              <h2 className="text-4xl font-bold text-white">AI-Powered Image Enhancement</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                MicroJPEG's AI Image Enhancer uses <strong className="text-yellow-500">Real-ESRGAN</strong>, the same technology trusted by professionals for upscaling low-resolution images to stunning 4K and 8K quality without losing detail.
              </p>
            </section>

            <section className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Perfect For:</h3>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Upscaling old photos</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> E-commerce product shots</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Large format printing</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Social media restoration</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Why MicroJPEG?</h3>
                <p className="text-gray-400 leading-relaxed">
                  Unlike other online tools, we prioritize speed and modern formats. Save your upscaled images as <strong>WebP or AVIF</strong> to keep file sizes small while maintaining maximum clarity.
                </p>
              </div>
            </section>
          </div>
        </main>

        <SEOFooter />
      </div>

      <UpgradePrompt {...upgradePrompt.promptProps} />
    </>
  );
}
