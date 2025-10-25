/**
 * DYNAMIC TIER-AWARE COMPRESS PAGE
 * 
 * Reuses exact design from micro-jpeg-landing.tsx but with:
 * - Dynamic tier-based validations (file size, batch, operations)
 * - Dynamic hero text based on tier
 * - Dynamic feature labels
 * - Same professional layout and glow effects
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Loader2, Download, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/header';
import logoUrl from '@assets/mascot-logo-optimized.png';
import mascotUrl from '@/assets/mascot.webp';
import avifIcon from '@/assets/format-icons/avif.jpg';
import jpegIcon from '@/assets/format-icons/jpeg.jpg';
import pngIcon from '@/assets/format-icons/png.jpg';
import webpIcon from '@/assets/format-icons/webp.jpg';

// Types
interface FileWithPreview extends File {
  id: string;
  preview?: string;
}

interface CompressionResult {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  downloadUrl: string;
  outputFormat: string;
}

interface TierConfig {
  tierName: string;
  tierDisplay: string;
  maxFileSize: number; // in MB
  maxRawFileSize: number; // in MB
  maxBatchSize: number;
  operationsLimit: number; // 99999 = unlimited
  heroTitle: string;
  heroSubtitle: string;
  heroHighlight: string;
  uploadText: string;
  features: Array<{ icon: string; title: string; subtitle: string }>;
}

// Tier configurations - fetched from API or hardcoded
const TIER_CONFIGS: Record<string, TierConfig> = {
  'free': {
    tierName: 'free',
    tierDisplay: 'Free',
    maxFileSize: 7,
    maxRawFileSize: 15,
    maxBatchSize: 3,
    operationsLimit: 200,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'For Photographers & Developers',
    heroHighlight: 'Free Forever',
    uploadText: 'Each image up to 15MB for RAW & 7MB for Regular',
    features: [
      { icon: 'zap', title: 'Free Operations', subtitle: 'No Sign In, No credit card needed' },
      { icon: 'camera', title: 'RAW Camera Files', subtitle: 'CR2, NEF, ARW, DNG, ORF, RAF' },
      { icon: 'check', title: 'No Watermarks Ever', subtitle: 'Clean output. Your images, your way' },
      { icon: 'images', title: 'Batch Processing', subtitle: 'Upload 3 files at once' }
    ]
  },
  'starter-m': {
    tierName: 'starter-m',
    tierDisplay: 'Starter Monthly',
    maxFileSize: 75,
    maxRawFileSize: 75,
    maxBatchSize: 10,
    operationsLimit: 99999,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'Starter Plan - Perfect for Individual Use',
    heroHighlight: '$9/month',
    uploadText: 'Each image up to 75MB - Unlimited compressions',
    features: [
      { icon: 'zap', title: 'Unlimited Operations', subtitle: 'Compress as much as you need' },
      { icon: 'camera', title: 'RAW Files up to 75MB', subtitle: 'Professional RAW support' },
      { icon: 'check', title: 'Priority Processing', subtitle: 'Faster compression queue' },
      { icon: 'images', title: 'Batch Upload 10 Files', subtitle: 'Process multiple at once' }
    ]
  },
  'starter-y': {
    tierName: 'starter-y',
    tierDisplay: 'Starter Yearly',
    maxFileSize: 75,
    maxRawFileSize: 75,
    maxBatchSize: 10,
    operationsLimit: 99999,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'Starter Plan - Best Value',
    heroHighlight: '$49/year',
    uploadText: 'Each image up to 75MB - Unlimited compressions',
    features: [
      { icon: 'zap', title: 'Unlimited Operations', subtitle: 'Compress as much as you need' },
      { icon: 'camera', title: 'RAW Files up to 75MB', subtitle: 'Professional RAW support' },
      { icon: 'check', title: 'Priority Processing', subtitle: 'Faster compression queue' },
      { icon: 'images', title: 'Batch Upload 10 Files', subtitle: 'Process multiple at once' }
    ]
  },
  'pro-m': {
    tierName: 'pro-m',
    tierDisplay: 'PRO Monthly',
    maxFileSize: 150,
    maxRawFileSize: 150,
    maxBatchSize: 20,
    operationsLimit: 99999,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'PRO Plan - For Professionals',
    heroHighlight: '$19/month',
    uploadText: 'Each image up to 150MB - Unlimited compressions',
    features: [
      { icon: 'zap', title: 'Unlimited Operations', subtitle: 'No limits on compressions' },
      { icon: 'camera', title: 'RAW Files up to 150MB', subtitle: 'Large professional files' },
      { icon: 'check', title: 'Priority Processing', subtitle: 'Lightning fast queue' },
      { icon: 'images', title: 'Batch Upload 20 Files', subtitle: 'Bulk processing power' }
    ]
  },
  'pro-y': {
    tierName: 'pro-y',
    tierDisplay: 'PRO Yearly',
    maxFileSize: 150,
    maxRawFileSize: 150,
    maxBatchSize: 20,
    operationsLimit: 99999,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'PRO Plan - Best Value',
    heroHighlight: '$149/year',
    uploadText: 'Each image up to 150MB - Unlimited compressions',
    features: [
      { icon: 'zap', title: 'Unlimited Operations', subtitle: 'No limits on compressions' },
      { icon: 'camera', title: 'RAW Files up to 150MB', subtitle: 'Large professional files' },
      { icon: 'check', title: 'Priority Processing', subtitle: 'Lightning fast queue' },
      { icon: 'images', title: 'Batch Upload 20 Files', subtitle: 'Bulk processing power' }
    ]
  },
  'business-m': {
    tierName: 'business-m',
    tierDisplay: 'BUSINESS Monthly',
    maxFileSize: 200,
    maxRawFileSize: 200,
    maxBatchSize: 50,
    operationsLimit: 99999,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'BUSINESS Plan - Enterprise Grade',
    heroHighlight: '$49/month',
    uploadText: 'Each image up to 200MB - Unlimited compressions',
    features: [
      { icon: 'zap', title: 'Unlimited Operations', subtitle: 'Enterprise scale processing' },
      { icon: 'camera', title: 'RAW Files up to 200MB', subtitle: 'Maximum file support' },
      { icon: 'check', title: 'Priority Processing', subtitle: 'Highest priority queue' },
      { icon: 'images', title: 'Batch Upload 50 Files', subtitle: 'Maximum batch power' }
    ]
  },
  'business-y': {
    tierName: 'business-y',
    tierDisplay: 'BUSINESS Yearly',
    maxFileSize: 200,
    maxRawFileSize: 200,
    maxBatchSize: 50,
    operationsLimit: 99999,
    heroTitle: 'Professional Image Compression',
    heroSubtitle: 'BUSINESS Plan - Best Value',
    heroHighlight: '$399/year',
    uploadText: 'Each image up to 200MB - Unlimited compressions',
    features: [
      { icon: 'zap', title: 'Unlimited Operations', subtitle: 'Enterprise scale processing' },
      { icon: 'camera', title: 'RAW Files up to 200MB', subtitle: 'Maximum file support' },
      { icon: 'check', title: 'Priority Processing', subtitle: 'Highest priority queue' },
      { icon: 'images', title: 'Batch Upload 50 Files', subtitle: 'Maximum batch power' }
    ]
  }
};

const FORMATS = ['jpeg', 'png', 'webp', 'avif'];

export default function DynamicCompressPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Fetch user tier from API
  const [tierConfig, setTierConfig] = useState<TierConfig>(TIER_CONFIGS['starter-m']);
  const [loading, setLoading] = useState(true);
  
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['jpeg']);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user tier on mount
  useEffect(() => {
    const fetchTier = async () => {
      try {
        const response = await fetch('/api/user/tier-info', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const userTier = data.tier.name;
          
          if (TIER_CONFIGS[userTier]) {
            setTierConfig(TIER_CONFIGS[userTier]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch tier:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTier();
    } else {
      setTierConfig(TIER_CONFIGS['free']);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const isRaw = /\.(cr2|nef|arw|dng|orf|raf|rw2)$/i.test(file.name);
    const maxSize = isRaw ? tierConfig.maxRawFileSize : tierConfig.maxFileSize;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds ${maxSize}MB limit for your ${tierConfig.tierDisplay} plan`
      };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Check batch size
    if (selectedFiles.length > tierConfig.maxBatchSize) {
      toast({
        title: "Batch size limit exceeded",
        description: `Your ${tierConfig.tierDisplay} plan allows up to ${tierConfig.maxBatchSize} files per batch`,
        variant: "destructive",
      });
      return;
    }

    const newFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const validation = validateFile(file);
      
      if (validation.valid) {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${Date.now()}-${Math.random()}`,
          preview: URL.createObjectURL(file)
        });
        newFiles.push(fileWithPreview);
      } else {
        errors.push(validation.error!);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Some files were rejected",
        description: errors[0],
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setFiles(newFiles);
      processFiles(newFiles);
    }
  }, [tierConfig, toast]);

  // Process files
  const processFiles = async (filesToProcess: FileWithPreview[]) => {
    setIsProcessing(true);
    setShowModal(true);
    setProcessingProgress(0);
    
    const newResults: CompressionResult[] = [];
    const totalOperations = filesToProcess.length * selectedFormats.length;
    let completed = 0;

    for (const file of filesToProcess) {
      for (const format of selectedFormats) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('format', format);
          formData.append('quality', '85');
          formData.append('pageIdentifier', 'paid-user-compress');
          
          const response = await fetch('/api/compress', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!response.ok) throw new Error('Compression failed');

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          newResults.push({
            id: `${file.id}-${format}`,
            originalName: file.name,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: ((file.size - blob.size) / file.size) * 100,
            downloadUrl: url,
            outputFormat: format.toUpperCase()
          });

          completed++;
          setProcessingProgress(Math.round((completed / totalOperations) * 100));
        } catch (error) {
          toast({
            title: "Compression failed",
            description: `Failed to compress ${file.name} to ${format.toUpperCase()}`,
            variant: "destructive",
          });
        }
      }
    }
    
    setResults(newResults);
    setIsProcessing(false);
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadFile = (result: CompressionResult) => {
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `${result.originalName.split('.')[0]}-${result.outputFormat.toLowerCase()}.${result.outputFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      {/* Hero Section - Exact design from micro-jpeg-landing */}
      <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Hero Text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  <span className="text-white">{tierConfig.heroTitle.split(' ')[0]} {tierConfig.heroTitle.split(' ')[1]}</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-yellow-400">
                    {tierConfig.heroTitle.split(' ').slice(2).join(' ')}
                  </span>
                  <br />
                  <span className="text-white">{tierConfig.heroSubtitle}</span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    {tierConfig.heroHighlight}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Compress JPG, PNG, WEBP, AVIF, TIFF, and RAW files without sacrificing quality.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    View Plans
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Dashboard
                  </Button>
                </div>

                {/* Feature Highlights - Dynamic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {tierConfig.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 justify-center lg:justify-start">
                      <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                        <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {feature.icon === 'zap' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                          {feature.icon === 'camera' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />}
                          {feature.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                          {feature.icon === 'images' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                        </svg>
                      </div>
                      <div>
                        <div className="text-gray-300 font-semibold text-sm">{feature.title}</div>
                        <div className="text-gray-500 text-xs">{feature.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Upload Interface */}
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[500px]">
                <div 
                  className={`
                    relative border-3 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300
                    aspect-[4/3] w-full flex flex-col justify-center
                    ${isProcessing 
                      ? 'cursor-not-allowed opacity-50 bg-gray-900/50 border-gray-700' 
                      : dragActive 
                      ? 'border-teal-400 bg-teal-500/10 scale-105 cursor-pointer' 
                      : 'border-gray-600 hover:border-teal-500 hover:bg-gray-700/30 cursor-pointer'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-teal-500/20 rounded-xl mx-auto flex items-center justify-center border border-teal-500/30">
                      <Upload className="w-8 h-8 text-teal-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-base font-medium text-white">
                        Drop images here or click to upload
                      </p>
                      <p className="text-sm text-gray-400">
                        {tierConfig.uploadText}
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, WEBP, AVIF, SVG, TIFF, RAW (CR2, ARW, DNG, NEF, ORF, RAF, RW2)
                      </p>
                    </div>

                    {/* Format Selection Buttons */}
                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-medium text-gray-300">Select output format:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" onClick={(e) => e.stopPropagation()}>
                        {FORMATS.map((format) => (
                          <Button
                            key={format}
                            variant={selectedFormats.includes(format) ? "default" : "outline"}
                            size="sm"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isProcessing) toggleFormat(format);
                            }}
                            className={`h-8 sm:h-9 text-xs font-medium transition-all ${
                              selectedFormats.includes(format)
                                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/50" 
                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600"
                            }`}
                          >
                            {format.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.cr2,.arw,.crw,.dng,.nef,.orf,.raf,.rw2"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Mascot */}
                <div className="hidden sm:block absolute -bottom-4 -right-4 w-16 h-16 lg:w-24 lg:h-24 animate-float">
                  <img src={mascotUrl} alt="MicroJPEG Mascot" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Processing Modal - Below Hero */}
      {showModal && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between bg-gray-900 p-4 rounded-t-2xl -m-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-white">
                    {isProcessing ? 'Processing your images...' : 'Your optimized images are ready!'}
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                      <Badge className="bg-teal-500">{processingProgress}%</Badge>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {isProcessing && (
                <Progress value={processingProgress} className="mb-6" />
              )}

              {/* Results Grid */}
              {results.length > 0 && (
                <div className="grid gap-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{result.originalName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <Badge className="bg-teal-500/20 text-teal-400">
                            {result.outputFormat}
                          </Badge>
                          <span>{formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}</span>
                          <span className="text-green-400">-{result.compressionRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => downloadFile(result)}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
