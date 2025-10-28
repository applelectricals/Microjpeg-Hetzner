import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { sessionManager } from '@/lib/sessionManager';
import Header from '@/components/header';
import mascotUrl from '@/assets/mascot.webp';
import avifIcon from '@/assets/format-icons/avif.jpg';
import jpegIcon from '@/assets/format-icons/jpeg.jpg';
import pngIcon from '@/assets/format-icons/png.jpg';
import webpIcon from '@/assets/format-icons/webp.jpg';

// ============================================
// TYPES
// ============================================
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
  originalFormat: string;
  outputFormat: string;
  wasConverted: boolean;
}

interface SessionData {
  compressions: number;
  conversions: number;
  uploadedFiles: FileWithPreview[];
  results: CompressionResult[];
  showPricingProbability: number;
  activityScore: number;
  batchDownloadUrl?: string;
}

interface TierInfo {
  tierName: string;
  tierDisplay: string;
  maxFileSize: number;
  maxRawFileSize: number;
  maxBatchSize: number;
  operationsLimit: number;
  pageIdentifier: string;
}

interface TierResponse {
  authenticated: boolean;
  tier: TierInfo;
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
    paymentAmount: number;
    daysRemaining: number;
  };
  user?: {
    email: string;
    userId: string;
  };
}

// ============================================
// CONSTANTS
// ============================================
const SUPPORTED_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif',
  'image/tiff', 'image/tif', 'image/x-tiff', 'image/x-tif', 'image/svg+xml',
  '', '.cr2', '.arw', '.dng', '.nef', '.orf', '.raf', '.rw2'
];

const OUTPUT_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'tiff'];

// ============================================
// TIER CONFIGURATION
// ============================================
const getTierLimits = (tier: string) => {
  const limits: Record<string, { regular: number; raw: number; batch: number }> = {
    'starter-m': { regular: 75, raw: 75, batch: 5 },
    'starter-y': { regular: 75, raw: 75, batch: 5 },
    'pro-m': { regular: 150, raw: 150, batch: 10 },
    'pro-y': { regular: 150, raw: 150, batch: 10 },
    'business-m': { regular: 200, raw: 200, batch: 20 },
    'business-y': { regular: 200, raw: 200, batch: 20 },
  };
  
  return limits[tier] || limits['starter-m'];
};

// Maps new tiers to legacy backend identifiers
const getTierPageIdentifier = (tier: string): string => {
  const tierMap: Record<string, string> = {
    'starter-m': 'premium-29',
    'starter-y': 'premium-29',
    'pro-m': 'premium-29',
    'pro-y': 'premium-29',
    'business-m': 'enterprise-99',
    'business-y': 'enterprise-99',
  };
  
  const identifier = tierMap[tier];
  
  console.log(`🔍 getTierPageIdentifier: tier="${tier}" → identifier="${identifier}"`);
  
  return identifier || 'premium-29';
};

const getTierDisplayName = (tier: string) => {
  const names: Record<string, string> = {
    'starter-m': 'Starter ($9/month)',
    'starter-y': 'Starter ($49/year)',
    'pro-m': 'Pro ($19/month)',
    'pro-y': 'Pro ($149/year)',
    'business-m': 'Business ($49/month)',
    'business-y': 'Business ($399/year)',
  };
  
  return names[tier] || 'Starter Plan';
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const groupResultsByOriginalName = (results: CompressionResult[]) => {
  const groups = new Map<string, CompressionResult[]>();
  
  results.forEach(result => {
    const key = result.originalName;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(result);
  });
  
  return Array.from(groups.entries()).map(([originalName, results]) => ({
    originalName,
    results: results.sort((a, b) => (a.outputFormat || '').localeCompare(b.outputFormat || ''))
  }));
};

const getFormatInfo = (format: string) => {
  const formatMap: Record<string, { icon: string; color: string }> = {
    'avif': { icon: avifIcon, color: '#F59E0B' },
    'jpeg': { icon: jpegIcon, color: '#10B981' },
    'jpg': { icon: jpegIcon, color: '#10B981' },
    'png': { icon: pngIcon, color: '#3B82F6' },
    'webp': { icon: webpIcon, color: '#F97316' }
  };
  
  return formatMap[format] || { icon: jpegIcon, color: '#6B7280' };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function DynamicCompressPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [userTier, setUserTier] = useState<string>('');
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  
  const [session, setSession] = useState<SessionData>(() => sessionManager.getSession());
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState<FileWithPreview[]>([]);
  const [fileObjectUrls, setFileObjectUrls] = useState<Map<string, string>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['jpeg']);
  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<'processing' | 'complete'>('processing');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // AUTHENTICATION & TIER CHECK
  // ============================================
  useEffect(() => {
    console.log('🔐 Auth check:', { isAuthenticated, user: user?.email });
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated → Redirecting to landing page');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchTierInfo = async () => {
      if (!isAuthenticated) {
        console.log('⚠️ Not authenticated, skipping tier fetch');
        return;
      }

      try {
        console.log('📡 Fetching tier info for user:', user?.email);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/user/tier-info', {
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error('❌ Tier API returned error:', response.status);
          window.location.href = '/';
          return;
        }
        
        const data: TierResponse = await response.json();
        console.log('📦 Tier API response:', data);
        
        // CRITICAL: Check if free tier
        const isFree = data.tier.tierName === 'free' || 
                      data.tier.tierName === 'free_registered' ||
                      data.tier.tierName === 'free_anonymous';
        
        if (isFree) {
          console.log('🚫 Free tier detected → Redirecting to landing page');
          window.location.href = '/';
          return;
        }
        
        // Check if subscription is active
        if (data.subscription && data.subscription.status !== 'active') {
          console.log('⚠️ Subscription not active:', data.subscription.status);
          window.location.href = '/';
          return;
        }
        
        // Paid tier confirmed
        console.log('✅ PAID TIER CONFIRMED:', {
          tierName: data.tier.tierName,
          maxFileSize: data.tier.maxFileSize,
          maxRawFileSize: data.tier.maxRawFileSize,
          maxBatchSize: data.tier.maxBatchSize,
          subscriptionStatus: data.subscription?.status
        });
        
        setTierInfo(data.tier);
        setSubscription(data.subscription);
        setUserTier(data.tier.tierName);
        setIsLoadingTier(false);
        
      } catch (error) {
        console.error('❌ Tier fetch failed:', error);
        window.location.href = '/';
      }
    };

    fetchTierInfo();
  }, [isAuthenticated, user]);

  // ============================================
  // FILE VALIDATION
  // ============================================
  const tierLimits = getTierLimits(userTier);
  const MAX_FILE_SIZE = tierLimits.regular * 1024 * 1024;
  const MAX_RAW_FILE_SIZE = tierLimits.raw * 1024 * 1024;
  const MAX_BATCH_SIZE = tierLimits.batch;

  console.log('📊 Current tier limits:', {
    userTier,
    regularMB: tierLimits.regular,
    rawMB: tierLimits.raw,
    batchSize: tierLimits.batch,
    MAX_FILE_SIZE,
    MAX_RAW_FILE_SIZE
  });

  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    const isRawFormat = ['.cr2', '.arw', '.dng', '.nef', '.orf', '.rw2'].some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!SUPPORTED_FORMATS.includes(file.type.toLowerCase()) && !isRawFormat) {
      return `${file.name}: Unsupported format`;
    }
    
    const maxSize = isRawFormat ? MAX_RAW_FILE_SIZE : MAX_FILE_SIZE;
    const sizeLabel = `${isRawFormat ? tierLimits.raw : tierLimits.regular}MB`;
    
    console.log('🔍 Validating file:', {
      name: file.name,
      size: file.size,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
      isRaw: isRawFormat,
      maxSize,
      maxSizeMB: (maxSize / 1024 / 1024).toFixed(2)
    });
    
    if (file.size > maxSize) {
      const error = `${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: ${sizeLabel}`;
      console.log('❌ Validation failed:', error);
      return error;
    }
    
    console.log('✅ File validation passed');
    return null;
  }, [tierLimits, MAX_FILE_SIZE, MAX_RAW_FILE_SIZE]);

  // ============================================
  // FILE HANDLING
  // ============================================
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    console.log('📁 Processing files:', fileArray.length);

    if (fileArray.length > MAX_BATCH_SIZE) {
      toast({
        title: "Batch limit exceeded",
        description: `Your ${getTierDisplayName(userTier)} plan allows up to ${MAX_BATCH_SIZE} files at once`,
        variant: "destructive",
      });
      return;
    }

    for (const file of fileArray) {
      const error = await validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        const isDuplicate = selectedFiles.some(
          existing => existing.name === file.name && existing.size === file.size
        );
        
        if (!isDuplicate) {
          const fileWithPreview = Object.assign(file, {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }) as FileWithPreview;
          validFiles.push(fileWithPreview);
        }
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Validation errors",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setFileObjectUrls(prev => {
        const newMap = new Map(prev);
        validFiles.forEach(file => {
          if (!newMap.has(file.name)) {
            newMap.set(file.name, URL.createObjectURL(file));
          }
        });
        return newMap;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setNewlyAddedFiles(validFiles);
      setSelectedFormats(['jpeg']);
      
      toast({
        title: "Files added",
        description: `${validFiles.length} file(s) ready for compression`,
      });
    }
  }, [selectedFiles, toast, validateFile, MAX_BATCH_SIZE, userTier]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // ============================================
  // COMPRESSION PROCESSING
  // ============================================
  const startProcessing = useCallback(async () => {
    const filesToProcess = newlyAddedFiles.length > 0 ? newlyAddedFiles : selectedFiles;
    if (filesToProcess.length === 0) return;

    console.log('🚀 Starting compression for', filesToProcess.length, 'files');

    setIsProcessing(true);
    setShowModal(true);
    setModalState('processing');
    setProcessingProgress(0);
    setProcessingStatus('Preparing files...');

    let progressInterval: NodeJS.Timeout | undefined;
    
    try {
      const formData = new FormData();
      filesToProcess.forEach((file) => {
        console.log('➕ Adding file to FormData:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        formData.append('files', file as File);
      });

      // ⚠️ CRITICAL: Use the correct pageIdentifier from tier
      const pageIdentifier = getTierPageIdentifier(userTier);
      
      const settings = {
        quality: 80,
        outputFormat: selectedFormats.length > 0 ? selectedFormats : 'keep-original',
        resizeOption: 'keep-original',
        compressionAlgorithm: 'standard',
        sessionId: sessionManager.getSessionId(),
        pageIdentifier: pageIdentifier, // ← Correct tier-based identifier
      };

      console.log('⚙️ Compression settings:', settings);
      console.log('🎯 Using pageIdentifier:', pageIdentifier, 'for tier:', userTier);

      formData.append('settings', JSON.stringify(settings));

      const totalSize = filesToProcess.reduce((sum, file) => sum + file.size, 0);
      const estimatedDuration = Math.max(1000, Math.min(5000, filesToProcess.length * 800 + totalSize / 1024 / 1024 * 100));
      
      setProcessingProgress(15);
      setProcessingStatus('Compressing images...');
      
      let currentProgress = 15;
      progressInterval = setInterval(() => {
        const increment = Math.random() * 8 + 2;
        currentProgress = Math.min(currentProgress + increment, 85);
        setProcessingProgress(Math.floor(currentProgress));
      }, Math.max(estimatedDuration / 20, 200));

      console.log('📤 Sending request to /api/compress');
      
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Compression successful:', data);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.results && data.results.length > 0) {
        console.log('📊 Processed', data.results.length, 'results');
        window.dispatchEvent(new Event('refreshUniversalCounter'));
      }

      const latestSession = sessionManager.getSession();
      const newSession: SessionData = {
        ...latestSession,
        results: [...latestSession.results, ...(data.results || [])],
        batchDownloadUrl: data.batchDownloadUrl,
      };
      
      setSession(newSession);
      sessionManager.updateSession(newSession);

      setProcessingProgress(100);
      setProcessingStatus('Compression complete!');
      setModalState('complete');
      setIsProcessing(false);
      setNewlyAddedFiles([]);

    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      
      console.error('❌ Compression failed:', error);
      
      toast({
        title: "Compression failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      
      setIsProcessing(false);
      setShowModal(false);
      setNewlyAddedFiles([]);
    }
  }, [selectedFiles, newlyAddedFiles, selectedFormats, userTier, toast]);

  // Auto-start processing
  useEffect(() => {
    if (newlyAddedFiles.length > 0 && !isProcessing && selectedFormats.length > 0) {
      const timer = setTimeout(() => startProcessing(), 200);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedFiles.length, isProcessing, selectedFormats, startProcessing]);

  // ============================================
  // DOWNLOAD FUNCTIONS
  // ============================================
  const downloadAllResults = useCallback(async () => {
    if (session.results.length === 0) {
      toast({
        title: "No files to download",
        description: "Please compress some images first",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultIds = session.results.map(result => result.id);
      
      const response = await fetch('/api/create-session-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultIds }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      window.open(data.batchDownloadUrl, '_blank');

      toast({
        title: "Download started",
        description: `Creating ZIP with ${data.fileCount} files...`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to create download",
        variant: "destructive",
      });
    }
  }, [session.results, toast]);

  // ============================================
  // FORMAT SELECTION
  // ============================================
  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => {
      if (prev.includes(format)) {
        if (format === 'jpeg') return prev;
        return prev.filter(f => f !== format);
      }
      return [...prev, format];
    });
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoadingTier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Verifying subscription...</div>
          {user?.email && (
            <div className="text-gray-400 text-sm mt-2">Logged in as: {user.email}</div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-900">
        {/* Hero Section */}
        <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left - Title */}
              <div className="space-y-6 text-center lg:text-left">
                {tierInfo && subscription && (
                  <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 text-base font-semibold shadow-lg">
                    {getTierDisplayName(userTier)}
                    {subscription.daysRemaining && (
                      <span className="ml-2 opacity-90">• {subscription.daysRemaining} days left</span>
                    )}
                  </Badge>
                )}
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
                  Professional Image Compression
                </h1>
                
                <p className="text-lg text-gray-300">
                  Compress JPG, PNG, WEBP, AVIF, TIFF, and RAW files without quality loss
                </p>

                {/* Plan Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                      <Check className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-gray-300 font-semibold text-sm">Up to {tierLimits.regular}MB files</div>
                      <div className="text-gray-500 text-xs">Regular & RAW formats</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center border border-teal-500/30">
                      <Check className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-gray-300 font-semibold text-sm">{tierLimits.batch} concurrent uploads</div>
                      <div className="text-gray-500 text-xs">Batch processing</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Upload Interface */}
              <div className="relative">
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                  <div 
                    className={`
                      relative border-3 border-dashed rounded-xl p-8 text-center transition-all
                      aspect-[4/3] w-full flex flex-col justify-center
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : dragActive ? 'border-teal-400 bg-teal-500/10' : 'border-gray-600 hover:border-teal-500 cursor-pointer'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-teal-500/20 rounded-xl mx-auto flex items-center justify-center">
                        <Upload className="w-8 h-8 text-teal-400" />
                      </div>
                      
                      <div>
                        <p className="text-base font-medium text-white">Drop images or click to upload</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Up to {tierLimits.regular}MB per file • Max {tierLimits.batch} files
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, WEBP, AVIF, TIFF, RAW (CR2, NEF, ARW, DNG)
                        </p>
                      </div>

                      {/* Format Selection */}
                      <div className="space-y-3 pt-2" onClick={(e) => e.stopPropagation()}>
                        <p className="text-sm font-medium text-gray-300">Output format:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {OUTPUT_FORMATS.map((format) => (
                            <Button
                              key={format}
                              variant={selectedFormats.includes(format) ? "default" : "outline"}
                              size="sm"
                              disabled={isProcessing}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isProcessing) toggleFormat(format);
                              }}
                              className={`text-xs ${
                                selectedFormats.includes(format)
                                  ? "bg-teal-500 text-white"
                                  : "bg-gray-700/50 text-gray-300"
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
                      accept="image/*,.cr2,.arw,.dng,.nef,.orf,.raf,.rw2"
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* Mascot */}
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 animate-float">
                    <img src={mascotUrl} alt="Mascot" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Output Modal */}
        {showModal && (
          <div className="w-full max-w-6xl mx-auto mt-4 mb-8 px-4">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-gray-900 p-4 rounded-t-2xl -m-6 mb-4">
                  <div className="text-lg font-semibold text-white">
                    {isProcessing ? processingStatus : 'Your images are ready!'}
                  </div>
                  
                  {session.results.length > 0 && (
                    <Button 
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                      onClick={downloadAllResults}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-center">{processingProgress}%</p>
                  </div>
                )}

                {/* Results */}
                {selectedFiles.length > 0 && session.results.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {groupResultsByOriginalName(session.results).map((group) => (
                      <div key={group.originalName} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {(() => {
                                const originalFile = selectedFiles.find(f => f.name === group.originalName);
                                const objectUrl = originalFile ? fileObjectUrls.get(originalFile.name) : null;
                                
                                if (objectUrl) {
                                  return (
                                    <img 
                                      src={objectUrl}
                                      alt={group.originalName}
                                      className="w-full h-full object-cover"
                                    />
                                  );
                                }
                                
                                return (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                );
                              })()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {group.originalName.length > 30 ? `${group.originalName.substring(0, 30)}...` : group.originalName}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {formatFileSize(group.results[0].originalSize)} • {group.results.length} format(s)
                              </p>
                            </div>
                          </div>
                          
                          {/* Format Results */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {group.results.map((result) => {
                              const formatInfo = getFormatInfo((result.outputFormat || 'unknown').toLowerCase());
                              return (
                                <div key={result.id} className="flex items-center gap-1">
                                  <div className="text-right mr-1">
                                    <div className="text-sm font-bold text-gray-700">
                                      {result.compressedSize > result.originalSize ? '+' : '-'}{Math.abs(result.compressionRatio)}%
                                    </div>
                                    <div className="text-xs text-gray-500">{formatFileSize(result.compressedSize)}</div>
                                  </div>
                                  
                                  <div 
                                    className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: formatInfo.color }}
                                    onClick={() => window.open(result.downloadUrl, '_blank')}
                                    title="Click to download"
                                  >
                                    <img 
                                      src={formatInfo.icon} 
                                      alt={result.outputFormat} 
                                      className="w-3 h-3 object-contain"
                                    />
                                    <span className="text-white text-xs font-bold">
                                      {(result.outputFormat || 'unknown').toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Processing State */}
                {isProcessing && selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file) => (
                      <div key={file.id} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                              <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{file.name}</h4>
                              <p className="text-xs text-gray-600">Processing...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 text-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-xl font-bold">MicroJPEG</span>
              <p className="text-gray-600">Professional image compression for photographers and developers</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/features" className="hover:text-black">Features</a></li>
                <li><a href="/pricing" className="hover:text-black">Pricing</a></li>
                <li><a href="/api-docs" className="hover:text-black">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/about" className="hover:text-black">About</a></li>
                <li><a href="/contact" className="hover:text-black">Contact</a></li>
                <li><a href="/support" className="hover:text-black">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/privacy-policy" className="hover:text-black">Privacy</a></li>
                <li><a href="/terms-of-service" className="hover:text-black">Terms</a></li>
                <li><a href="/cancellation-policy" className="hover:text-black">Cancellation</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-gray-500">
            <p>© 2025 MicroJPEG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}