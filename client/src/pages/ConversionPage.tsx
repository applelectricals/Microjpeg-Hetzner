import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, X, Check, Crown, Plus, Minus, Moon, Sun, Settings, Zap, Shield, Sparkles, ArrowRight, ImageIcon, ChevronDown, ChevronUp, Menu, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { sessionManager } from '@/lib/sessionManager';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import { useLocation, useParams } from 'wouter';
import ConversionOutputModal from '@/components/ConversionOutputModal';
import ButtonsSection from "@/components/ButtonsSection";
import { getHowToSchema, getSoftwareAppSchema, getFaqSchema } from "@/data/conversionSchema";


import { getConversionPageContent, hasConversionContent, PageContent } from '@/data/conversionContent';
import { getConversionFAQ, FAQItem } from '@/data/conversionFAQs';
import { getFAQSchema, getBreadcrumbSchema, getWebPageSchema } from '@/data/conversionSchema';

// Import conversion matrix and utilities
import {
  CONVERSIONS,
  FORMATS,
  getConversionByPair,
  getFormatInfo, 
  validateFile as validateFileFromMatrix,
  type ConversionConfig,
  type FormatInfo
} from '@/data/conversionMatrix';

// Import format icons
import avifIcon from '@/assets/format-icons/avif.jpg';
import jpegIcon from '@/assets/format-icons/jpeg.jpg';
import pngIcon from '@/assets/format-icons/png.jpg';
import webpIcon from '@/assets/format-icons/webp.jpg';
import logoUrl from '@assets/mascot-logo-optimized.png';


// Dark mode hook - defaults to dark mode for conversion pages
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      // If user has a saved preference, use it
      if (saved !== null) {
        return saved === 'true';
      }
      // Default to dark mode for conversion pages
      return true;
    }
    return true; // Default to dark mode
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return { isDark, setIsDark: toggleDark };
}


// File size limits for free pages
// ============================================================================
// FREE TIER LIMITS - Conversion Pages (ConversionPage.tsx)
// - 7MB for Regular files (JPG, PNG, WEBP, AVIF, SVG, TIFF)
// - 15MB for RAW files (ARW, CR2, CRW, DNG, NEF, ORF, RAF)
// - 200 processes (conversions or compressions) per month
// - 1 Concurrent usage
// ============================================================================
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB for regular formats
const MAX_RAW_FILE_SIZE = 15 * 1024 * 1024; // 15MB for RAW formats
const FREE_MONTHLY_LIMIT = 200;
const MAX_CONCURRENT = 1;

// Supported file types (same as main landing page)
const SUPPORTED_FORMATS = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 
  'image/svg+xml', 'image/tiff', 'image/tif'
];

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

// Processing Progress Simulation
const simulateProgress = (
  duration: number,
  onProgress: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = duration / 100;
    
    const timer = setInterval(() => {
      progress += Math.random() * 3 + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        onProgress(100);
        setTimeout(resolve, 500);
      } else {
        onProgress(Math.floor(progress));
      }
    }, interval);
  });
};

// Get format icon
const getFormatIcon = (format: string) => {
  const iconMap: Record<string, string> = {
    'avif': avifIcon,
    'jpeg': jpegIcon,
    'jpg': jpegIcon,
    'png': pngIcon,
    'webp': webpIcon
  };
  return iconMap[format] || jpegIcon;
};

// Format information for displaying results
const getFormatDisplayInfo = (format: string) => {
  const formatInfo = getFormatInfo(format);
  if (formatInfo) {
    return {
      icon: getFormatIcon(format),
      color: formatInfo.color,
      bgColor: formatInfo.bgColor,
      textColor: formatInfo.textColor
    };
  }
  
  return {
    icon: jpegIcon,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: '#374151'
  };
};

// Parse route parameters to extract conversion pair with malformed route handling
const parseConversionFromParams = (params: any, location: string): { from: string; to: string; operation: string } | null => {
  // Handle /convert/:conversion pattern (e.g., cr2-to-webp)
  if (params.conversion) {
    const convertMatch = params.conversion.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
    if (convertMatch) {
      const [, from, to] = convertMatch;
      return { from, to, operation: 'convert' };
    }
  }
  
  // Handle /tools/:format and /compress/:format patterns (e.g., jpg)
  if (params.format) {
    // Determine the current URL pattern to provide correct redirects
    const isCompressRoute = location.includes('/compress/');
    const currentPrefix = isCompressRoute ? '/compress' : '/tools';
    const newPrefix = isCompressRoute ? '/compress' : '/compress'; // Always redirect to /compress for consistency
    
    // Check for malformed compress routes like /tools/jpg-to-jpg or /compress/jpg-to-jpg
    const malformedMatch = params.format.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
    if (malformedMatch) {
      const [, from, to] = malformedMatch;
      
      // If source and target are the same, it's a compression operation - redirect to new format
      if (from === to) {
        console.warn(`Malformed compress route detected: ${currentPrefix}/${params.format}. Redirecting to /compress/${from}`);
        window.location.replace(`/compress/${from}`);
        return null;
      } else {
        // If source and target are different, it should be a convert route - redirect
        console.warn(`Malformed compress route detected: ${currentPrefix}/${params.format}. Redirecting to /convert/${params.format}`);
        window.location.replace(`/convert/${params.format}`);
        return null;
      }
    }
    
    // Normal compression format - redirect old /tools/ URLs to new /compress/ URLs
    if (!isCompressRoute && location.includes('/tools/')) {
      console.log(`Redirecting from /tools/${params.format} to /compress/${params.format}`);
      window.location.replace(`/compress/${params.format}`);
      return null;
    }
    
    return { from: params.format, to: params.format, operation: 'compress' };
  }
  
  // Fallback: parse from URL path with malformed route detection
  const convertMatch = location.match(/\/convert\/([a-z0-9]+)-to-([a-z0-9]+)$/);
  const newCompressMatch = location.match(/\/compress\/([a-z0-9]+)$/);
  const oldCompressMatch = location.match(/\/tools\/([a-z0-9]+)$/);
  const malformedNewCompressMatch = location.match(/\/compress\/([a-z0-9]+)-to-([a-z0-9]+)$/);
  const malformedOldCompressMatch = location.match(/\/tools\/([a-z0-9]+)-to-([a-z0-9]+)$/);
  
  // Handle malformed compress URLs in fallback
  if (malformedNewCompressMatch) {
    const [, from, to] = malformedNewCompressMatch;
    
    if (from === to) {
      console.warn(`Malformed compress URL detected: ${location}. Redirecting to /compress/${from}`);
      window.location.replace(`/compress/${from}`);
      return null;
    } else {
      console.warn(`Malformed compress URL detected: ${location}. Redirecting to /convert/${from}-to-${to}`);
      window.location.replace(`/convert/${from}-to-${to}`);
      return null;
    }
  }
  
  if (malformedOldCompressMatch) {
    const [, from, to] = malformedOldCompressMatch;
    
    if (from === to) {
      console.warn(`Malformed compress URL detected: ${location}. Redirecting to /compress/${from}`);
      window.location.replace(`/compress/${from}`);
      return null;
    } else {
      console.warn(`Malformed compress URL detected: ${location}. Redirecting to /convert/${from}-to-${to}`);
      window.location.replace(`/convert/${from}-to-${to}`);
      return null;
    }
  }
  
  if (convertMatch) {
    const [, from, to] = convertMatch;
    return { from, to, operation: 'convert' };
  }
  
  if (newCompressMatch) {
    const [, format] = newCompressMatch;
    return { from: format, to: format, operation: 'compress' };
  }
  
  if (oldCompressMatch) {
    const [, format] = oldCompressMatch;
    // Redirect old /tools/ URLs to new /compress/ URLs
    console.log(`Redirecting from /tools/${format} to /compress/${format}`);
    window.location.replace(`/compress/${format}`);
    return null;
  }
  
  return null;
};

// Session Management Utilities  
const SESSION_LIMITS = {
  free: { 
    compressions: 500,  // Match landing page (500 monthly operations)
    conversions: 500,   // Match landing page 
    maxFileSize: 25 * 1024 * 1024,  // Keep 25MB for conversions
    maxConcurrent: 5,   // Allow 5 concurrent uploads as per requirements
    timeoutSeconds: 30
  }
};



// Dynamic ConversionPage Component
export default function ConversionPage() {
  const [location] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Add dark mode state to component (moved to top)
  const { isDark, setIsDark } = useDarkMode();
  
  // Parse conversion config from route parameters
  const urlParams = parseConversionFromParams(params, location);
  const conversionConfig = urlParams ? getConversionByPair(urlParams.from, urlParams.to) : null;
  const fromFormat = urlParams ? getFormatInfo(urlParams.from) : null;
  const toFormat = urlParams ? getFormatInfo(urlParams.to) : null;

  // Get optimized content for this conversion (CR2-to-JPG gets special treatment)
  const pageContent =
    urlParams && fromFormat && toFormat
      ? getConversionPageContent(
          urlParams.from,
          urlParams.to,
          fromFormat.displayName,
          toFormat.displayName
        )
      : null;

  // Get FAQ content early in the component
  const faqItems =
    urlParams && fromFormat && toFormat
      ? getConversionFAQ(urlParams.from, urlParams.to)
      : [];

  // Generate canonical URL and structured data for SEO
  const canonicalUrl =
    urlParams && fromFormat && toFormat && conversionConfig
      ? `https://microjpeg.com${conversionConfig.operation === "compress"
          ? `/compress/${urlParams.from}`
          : `/convert/${urlParams.from}-to-${urlParams.to}`}`
      : "https://microjpeg.com/tools/convert";

  // Use optimized meta title if available
  const metaTitle =
    pageContent?.metaTitle
      ? pageContent.metaTitle
      : conversionConfig?.operation === "compress"
      ? `Compress ${fromFormat?.displayName} Images Online - Free | MicroJPEG`
      : `Convert ${fromFormat?.displayName} to ${toFormat?.displayName} - Free Online | MicroJPEG`;

  // Use optimized intro for meta description if available
  const metaDescription =
    pageContent?.metaDescription
      ? pageContent.metaDescription
      : pageContent?.intro
      ? pageContent.intro.slice(0, 155) // Google typically shows 155-160 characters
      : conversionConfig?.description || "Convert and compress images online with MicroJPEG";

  // Build comprehensive structured data array
  const structuredData =
    urlParams && fromFormat && toFormat && conversionConfig
      ? [
          getHowToSchema(urlParams.from, urlParams.to, canonicalUrl),
          getSoftwareAppSchema(urlParams.from, urlParams.to, canonicalUrl),
          getFaqSchema(urlParams.from, urlParams.to, canonicalUrl),
          getBreadcrumbSchema(urlParams.from, urlParams.to),
          getWebPageSchema(urlParams.from, urlParams.to, metaTitle, metaDescription)
        ].filter(Boolean)
      : undefined;

  // If no valid conversion found, show 404
  if (!urlParams || !conversionConfig || !fromFormat || !toFormat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-light dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors duration-300">
        <Header />
        {/* Dark Mode Toggle - 404 Page */}
        <div className="fixed top-20 right-4 z-50">
          <Button
            onClick={() => setIsDark(!isDark)}
            size="sm"
            variant="outline"
            className="w-10 h-10 p-0 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur border-2 border-gray-200 dark:border-gray-600 hover:border-brand-gold dark:hover:border-brand-gold shadow-lg transition-all"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-white transition-colors">404 - Conversion Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors">The conversion format you're looking for doesn't exist.</p>
            <a href="/tools/convert" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">Browse available conversions</a>
          </div>
        </div>
      </div>
    );
  }

  

  // State management
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState<FileWithPreview[]>([]);
  const [fileObjectUrls, setFileObjectUrls] = useState<Map<string, string>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState<'hidden' | 'processing' | 'results'>('hidden');
  const [showPricingCards, setShowPricingCards] = useState(false);
  const [consecutiveUploads, setConsecutiveUploads] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingFileIds, setProcessingFileIds] = useState<Set<string>>(new Set());
  const [qualityPercent, setQualityPercent] = useState(conversionConfig.defaultQuality);
  const [sizePercent, setSizePercent] = useState(conversionConfig.defaultSize);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [session, setSession] = useState<SessionData>({
    compressions: 0,
    conversions: 0,
    uploadedFiles: [],
    results: [],
    showPricingProbability: 0,
    activityScore: 0
  });

  // File validation with proper RAW vs regular file size limits
  const validateFile = useCallback((file: File): string | null => {
    const fileExtension = file.name.toLowerCase().split('.').pop() || '';
    
    // Comprehensive RAW format detection (without dots)
    const RAW_FORMATS = ['cr2', 'cr3', 'arw', 'srf', 'dng', 'nef', 'nrw', 'orf', 'raf', 'rw2', 'pef', 'srw', 'x3f', 'raw', 'crw'];
    const isRawFormat = RAW_FORMATS.includes(fileExtension);
    
    if (!SUPPORTED_FORMATS.includes(file.type.toLowerCase()) && !isRawFormat) {
      return `${file.name}: Unsupported format. Please use JPEG, PNG, WebP, AVIF, TIFF, SVG, or RAW formats (CR2, ARW, DNG, NEF, ORF, RAF, RW2).`;
    }
    
    // Use different file size limits for RAW vs regular files
    const maxSize = isRawFormat ? MAX_RAW_FILE_SIZE : MAX_FILE_SIZE;
    const sizeLabel = isRawFormat ? "25MB" : "10MB";
    const fileType = isRawFormat ? "RAW" : "regular";
    
    if (file.size > maxSize) {
      return `${file.name}: File too large. Maximum size is ${sizeLabel} for ${fileType} files.`;
    }
    
    return null;
  }, []);

  const handleFileInput = useCallback(() => {
    if (isProcessing) return;
    fileInputRef.current?.click();
  }, [isProcessing]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    if (isProcessing) {
      toast({
        title: "Processing in progress",
        description: "Please wait for current conversion to complete.",
        variant: "destructive"
      });
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
        validFiles.push(fileWithPreview);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "File validation errors",
        description: errors.join('\n'),
        variant: "destructive"
      });
    }

    if (validFiles.length > 0) {
      // Create object URLs for previews
      setFileObjectUrls(prev => {
        const newMap = new Map(prev);
        validFiles.forEach(file => {
          newMap.set(file.name, URL.createObjectURL(file));
        });
        return newMap;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setNewlyAddedFiles(validFiles);
      sessionManager.trackActivity();
      
      // Auto-start conversion
      setTimeout(() => startConversion(validFiles), 100);
      
      const actionText = conversionConfig.operation === 'compress' ? 'Compressing' : 'Converting';
      toast({
        title: `Files added - ${actionText}...`,
        description: `${validFiles.length} file(s) added. ${actionText} ${fromFormat.displayName} to ${toFormat.displayName} automatically.`,
      });
    }
  }, [isProcessing, toast, validateFile, conversionConfig, fromFormat, toFormat]);

  const startConversion = useCallback(async (filesToProcess?: FileWithPreview[]) => {
    const files = filesToProcess || selectedFiles;
    if (files.length === 0) return;

    setIsProcessing(true);
    setModalState('processing');
    setProcessingProgress(0);
    setProcessingFileIds(new Set(files.map(f => f.id)));

    try {
    // Use the same successful pattern as landing page
    const formData = new FormData();
    files.forEach(file => {
    formData.append('files', file);
  });
  
    // Normalize jpg → jpeg for backend compatibility
    const normalizedFormat = urlParams!.to === 'jpg' ? 'jpeg' : urlParams!.to;
  
    // Prepare settings for /api/compress endpoint (EXACT COPY from landing page)
    const settings = {
    quality: qualityPercent || 95, // Use simple quality like landing page
    outputFormat: [normalizedFormat], // ← Use normalized format
    resizeOption: 'keep-original', // Landing page uses keep-original for RAW files
    compressionAlgorithm: 'standard', // Same as landing page
    webOptimization: 'optimize-web',
    pageIdentifier: conversionConfig.pageIdentifier,
    sessionId: Math.random().toString(36).substr(2, 9) // Generate session ID
 };

      formData.append('settings', JSON.stringify(settings));

      // Start proper progress simulation
      const estimatedTime = fromFormat!.category === 'raw' 
        ? Math.max(30000, files.length * 15000) // RAW files take longer
        : Math.max(10000, files.length * 5000);
      
      const progressPromise = simulateProgress(estimatedTime, (progress) => {
        setProcessingProgress(progress);
      });

      // Use the same endpoint as landing page - this works for both regular and RAW files
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData
      });

      // Wait for progress to complete
      await progressPromise;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const result = await response.json();
      
      // Handle results (same structure as landing page)
      if (result.results && Array.isArray(result.results)) {
        console.log('Raw API result:', result);
        console.log('Processing results for', urlParams!.from, 'to', urlParams!.to);
        
        const convertedResults = result.results.map((r: any) => {
          console.log('Processing result:', r);
          
          // Ensure compressionRatio is valid - more robust validation
          let compressionRatio = r.compressionRatio;
          if (typeof compressionRatio !== 'number' || isNaN(compressionRatio) || !isFinite(compressionRatio)) {
            // Calculate compression ratio if missing or invalid
            const originalSize = typeof r.originalSize === 'number' && r.originalSize > 0 ? r.originalSize : 1;
            const compressedSize = typeof r.compressedSize === 'number' && r.compressedSize > 0 ? r.compressedSize : 1;
            compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
            console.log(`Calculated compression ratio: ${compressionRatio}% (${originalSize} -> ${compressedSize})`);
          }
          
          // Ensure sizes are valid
          const originalSize = typeof r.originalSize === 'number' && !isNaN(r.originalSize) && r.originalSize > 0 ? r.originalSize : 1;
          const compressedSize = typeof r.compressedSize === 'number' && !isNaN(r.compressedSize) && r.compressedSize > 0 ? r.compressedSize : 1;
          
          const processedResult = {
            id: r.id,
            originalName: r.originalName,
            originalSize,
            compressedSize,
            compressionRatio,
            downloadUrl: r.downloadUrl,
            originalFormat: urlParams!.from,
            outputFormat: urlParams!.to,
            wasConverted: conversionConfig.operation === 'convert'
          };
          
          console.log('Processed result:', processedResult);
          return processedResult;
        });
        
        setSession(prev => ({
          ...prev,
          results: [...prev.results, ...convertedResults]
        }));
      } else {
        console.error('Invalid results structure:', result);
      }

      setProcessingProgress(100);
      setModalState('results');
      setConsecutiveUploads(prev => prev + 1);
      
      // Show pricing cards after 3 uploads
      if (consecutiveUploads >= 2) {
        setShowPricingCards(true);
      }

      // Force counter refresh after successful conversion
      setTimeout(() => {
        window.dispatchEvent(new Event('refreshUniversalCounter'));
      }, 500);

    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setModalState('hidden');
    } finally {
      setIsProcessing(false);
      setProcessingFileIds(new Set());
      
      // Refresh counter after operation
      window.dispatchEvent(new Event('refreshUniversalCounter'));
    }
  }, [selectedFiles, consecutiveUploads, toast, conversionConfig, fromFormat, urlParams, qualityPercent, sizePercent]);

  const downloadAllResults = useCallback(async () => {
    if (session.results.length === 0) {
      toast({
        title: "No files to download",
        description: "Please process some files first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const resultIds = session.results.map(result => result.id);
      
      const response = await fetch('/api/create-session-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resultIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Open the download URL in a new tab
      window.open(data.batchDownloadUrl, '_blank');

      // Show pricing cards after download is initiated
      setShowPricingCards(true);

      toast({
        title: "Download started",
        description: `Creating ZIP with ${data.fileCount} files...`,
      });

    } catch (error) {
      console.error('Download all error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to create download",
        variant: "destructive",
      });
    }
  }, [session.results, toast]);

  // Drag and drop handlers
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const groupResultsByOriginalName = (results: CompressionResult[]) => {
    const groups: { [key: string]: CompressionResult[] } = {};
    results.forEach(result => {
      if (!groups[result.originalName]) {
        groups[result.originalName] = [];
      }
      groups[result.originalName].push(result);
    });
    
    return Object.entries(groups).map(([originalName, results]) => ({
      originalName,
      results
    }));
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-light dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors duration-300">
      {/* ← PERFECT PER-PAGE SEO — Google sees this instantly on SSR */}
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />

      {/* Header */}

      <Header />


      {/* Dark Mode Toggle - Floating Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setIsDark(!isDark)}
          size="sm"
          variant="outline"
          className="w-10 h-10 p-0 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur border-2 border-gray-200 dark:border-gray-600 hover:border-brand-gold dark:hover:border-brand-gold shadow-lg transition-all"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </Button>
      </div>

      {/* Hero Section */}
      <section className="flex-1 px-4 pt-20 sm:pt-24 md:pt-28 pb-8 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight dark:text-white transition-colors">
                  {conversionConfig.operation === 'compress' ? (
                    <>
                      Compress <span className="text-brand-gold">{fromFormat.displayName}</span> Online
                      <br className="hidden sm:block" />
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-700 dark:text-gray-300 block sm:inline transition-colors">
                        Free {fromFormat.category === 'raw' && conversionConfig.from === 'cr2' ? 'Canon RAW' : fromFormat.displayName} Compressor
                      </span>
                    </>
                  ) : (
                    <>
                      Convert <span className="text-brand-gold">{fromFormat.displayName}</span> to <span className="text-brand-teal">{toFormat.displayName}</span> Online
                      <br className="hidden sm:block" />
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-700 dark:text-gray-300 block sm:inline transition-colors">
                        Free {fromFormat.category === 'raw' && conversionConfig.from === 'cr2' ? 'Canon RAW' : fromFormat.displayName} Converter
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors">
                  {conversionConfig.description}
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {conversionConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-brand-teal" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/pricing'}
                  className="w-full sm:w-auto bg-brand-gold hover:bg-brand-gold-dark text-white font-semibold px-8 py-4 text-lg rounded-lg animate-pulse-glow min-h-[48px]"
                  data-testid="button-plans-pricing"
                >
                  Plans & Pricing
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = '/checkout?plan=starter'}
                  className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-brand-gold text-brand-dark hover:bg-brand-gold/10 min-h-[48px]"
                  data-testid="button-try-now"
                >
                  Try Now
                </Button>
              </div>
            </div>

            {/* Right side - Upload interface */}
            <div className="relative mt-8 lg:mt-0 upload-interface w-full">
              <Card className="p-4 sm:p-6 lg:p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-2 border-brand-gold/20 dark:border-brand-gold/30 shadow-2xl w-full transition-colors">
                {/* Drag & Drop Zone */}
                <div
                  className={`relative border-3 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 ${
                    isProcessing 
                      ? 'cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-700/50' 
                      : dragActive 
                      ? 'border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10 scale-105 cursor-pointer' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-brand-gold hover:bg-brand-cream/50 dark:hover:bg-gray-700/50 cursor-pointer'
                  }`}
                  onDragEnter={isProcessing ? undefined : handleDrag}
                  onDragLeave={isProcessing ? undefined : handleDrag}
                  onDragOver={isProcessing ? undefined : handleDrag}
                  onDrop={isProcessing ? undefined : handleDrop}
                  onClick={isProcessing ? undefined : handleFileInput}
                  title={isProcessing ? 'Please wait - conversion in progress...' : ''}
                >
                  <div className="space-y-4 sm:space-y-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-teal/10 rounded-xl mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-brand-teal" />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">
                        Drop {fromFormat.displayName} files here or click to upload
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors">
                        {conversionConfig.operation === 'compress' 
                          ? `Compress ${fromFormat.displayName} files`
                          : `Convert ${fromFormat.displayName} files to ${toFormat.displayName} format`
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                        {fromFormat.extensions.map(ext => ext.toUpperCase()).join(', ')} files only
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                        {fromFormat.category === 'raw' 
                          ? 'Up to 25MB for RAW files' 
                          : 'Up to 10MB (25MB for RAW files)'
                        }
                      </p>
                    </div>

                    {/* Quality and Size Controls */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Size Slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Size</label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{sizePercent}%</span>
                          </div>
                          <input
                            type="range"
                            min="25"
                            max="100"
                            value={sizePercent}
                            onChange={(e) => setSizePercent(Number(e.target.value))}
                            disabled={isProcessing}
                            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            style={{
                              background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${sizePercent}%, #e5e5e5 ${sizePercent}%, #e5e5e5 100%)`
                            }}
                          />
                        </div>
                        
                        {/* Quality Slider - only show if target format supports quality */}
                        {toFormat.supportsQuality && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Quality</label>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{qualityPercent}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={qualityPercent}
                              onChange={(e) => setQualityPercent(Number(e.target.value))}
                              disabled={isProcessing}
                              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                              style={{
                                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${qualityPercent}%, #e5e5e5 ${qualityPercent}%, #e5e5e5 100%)`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={fromFormat.extensions.map(ext => `.${ext}`).join(',')}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFiles(e.target.files);
                      }
                    }}
                    data-testid="file-input"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Conversion Output Modal */}
      <ConversionOutputModal
        modalState={modalState}
        isProcessing={isProcessing}
        processingProgress={processingProgress}
        processingFileIds={processingFileIds}
        selectedFiles={selectedFiles}
        session={session}
        showPricingCards={showPricingCards}
        fromFormatName={fromFormat.displayName}
        toFormatName={toFormat.displayName}
        operationType={conversionConfig.operation}
        onDownloadAll={downloadAllResults}
        onClose={() => setModalState('hidden')}
      />

      {/* Pricing Cards Upsell */}
      {showPricingCards && (
        <div className="fixed bottom-4 right-4 z-40">
          <Card className="p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-2 border-brand-gold/20 dark:border-brand-gold/30 shadow-xl max-w-sm transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-brand-gold" />
                <h4 className="font-semibold text-sm dark:text-white">Upgrade for More</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPricingCards(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 transition-colors">
              Get unlimited conversions and larger file sizes
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-brand-gold hover:bg-brand-gold-dark text-white text-xs"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => window.location.href = '/checkout?plan=starter'}
              >
                Try $1
              </Button>
            </div>
          </Card>
        </div>
      )}

{/* Test Premium for $1 Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-brand-gold/20 relative">
            {/* Premium Badge - Fixed Mobile Layout */}
            <div 
              className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2"
              style={{
                position: 'absolute' as const,
                top: '-0.75rem !important',
                left: '50% !important',
                transform: 'translateX(-50%) !important',
                zIndex: '10 !important'
              }}
            >
              <div 
                className="bg-gradient-to-r from-brand-gold to-amber-400 px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold shadow-lg rounded-lg text-black"
                style={{
                  backgroundColor: '#f59e0b !important',
                  color: '#AD0000 !important',
                  padding: '6px 12px !important',
                  fontSize: '12px !important',
                  fontWeight: 'bold !important',
                  borderRadius: '8px !important',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1) !important',
                  whiteSpace: 'nowrap !important',
                  display: 'inline-block !important'
                }}
              >
                <span className="hidden sm:inline" style={{ color: '#000000 !important' }}>⭐ STARTER PLAN FOR JUST $9</span>
                <span className="inline sm:hidden" style={{ color: '#000000 !important' }}>⭐ STARTER $9</span>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-6">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold font-poppins text-black mb-4 px-2">
                Experience <span className="text-brand-teal">Premium Features</span><br />
                <span className="text-brand-gold text-lg sm:text-3xl lg:text-4xl">Only $9 per month</span>
              </h2>
              
              <p className="text-lg text-gray-600 font-opensans mb-8 max-w-2xl mx-auto">
                Perfect for Product Hunt reviewers, colleagues, developers and photographers wanting to test our full Premium experience before committing.
              </p>
              
              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-brand-teal" />
                  </div>
                  <h3 className="font-semibold text-black dark:text-white mb-2">Unlimited operations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No monthly limits on conversions</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-brand-gold" />
                  </div>
                  <h3 className="font-semibold text-black dark:text-white mb-2">Up to 200MB files</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Starter: 75MB, Pro: 150MB, Business: 200MB</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-black dark:text-white mb-2">Monthly or Annual</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save up to 51% with annual plans</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/checkout?plan=starter'}
                  className="bg-gradient-to-r from-brand-teal to-brand-teal-dark hover:from-brand-teal-dark hover:to-brand-teal text-[#AD0000] font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  data-testid="button-test-premium"
                >
                  🚀 Subscribe Today for $9
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-gray-500 max-w-xs">
                  💳 Secure payment via Paypal/Razorpay • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

<ButtonsSection />
        {/* ====== FINAL BULLETPROOF SEO BLOCK — USES urlParams (NEVER FAILS) ====== */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {(() => {
            if (!urlParams || !fromFormat || !toFormat) {
              return null;
            }

            const fromUpper = (fromFormat.id || 'image').toUpperCase();
            const toUpper = (toFormat.id || 'file').toUpperCase();
            const fromTitle = fromUpper === 'JPG' ? 'JPEG' : fromUpper;
            const toTitle = toUpper === 'JPG' ? 'JPEG' : toUpper;

            return (
              <>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Convert <span className="text-brand-gold">{fromFormat.displayName}</span> to <span className="text-brand-teal">{toFormat.displayName}</span> Online – Free & Instant
                </h2>
                {pageContent ? (
                  <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                    {pageContent.intro}
                  </p>
                ) : (
                  <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                    Convert <span className="text-brand-gold">{fromFormat.displayName}</span> to <span className="text-brand-teal">{toFormat.displayName}</span> Free Converter. Supports Canon CR2/CR3, Nikon NEF, Sony ARW, Fujifilm RAF, Olympus ORF, Panasonic RW2 and 60+ RAW formats. No signup required, preserve EXIF data. Free: 200 conversions/month (7MB regular, 15MB RAW). Unlimited with paid plans.
                  </p>
                )}
              </>
            );
          })()}

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Zero Quality Loss</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced decoding preserves every detail, color profile, and metadata — better than Adobe DNG Converter.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Convert any RAW or regular image in under 3 seconds using multi-core processing.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4">100% Private & Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Files automatically deleted within 24 hours. GDPR compliant, no logs.
              </p>
            </div>
          </div>

          {/* Detailed sections from optimized content */}
          {pageContent && pageContent.sections && pageContent.sections.length > 0 && (
            <div className="mt-16 max-w-5xl mx-auto text-left space-y-8">
              {pageContent.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* ====== END SEO BLOCK ====== */}

      {/* Intro Section from pageContent */}
      {pageContent?.intro && urlParams && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {pageContent.intro}
            </p>
          </div>
        </section>
      )}

      {/* What Is Section */}
      {pageContent?.whatIsContent && urlParams && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              {pageContent.whatIsTitle}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {pageContent.whatIsContent}
            </p>
          </div>
        </section>
      )}

      {/* Why Convert Section */}
      {pageContent?.whyConvertReasons && urlParams && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              {pageContent.whyConvertTitle}
            </h2>
            <ul className="space-y-4">
              {pageContent.whyConvertReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-4 text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 text-brand-gold text-xl mt-1">✓</span>
                  <span className="text-lg leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* How To Section */}
      {pageContent?.howToSteps && urlParams && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              {pageContent.howToTitle}
            </h2>
            <ol className="space-y-4">
              {pageContent.howToSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Comparison Table Section */}
      {pageContent?.sourceInfo && pageContent?.targetInfo && urlParams && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
              {pageContent.comparisonTitle}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-gray-900 dark:text-white font-semibold">Feature</th>
                    <th className="px-4 py-3 text-left text-brand-gold font-semibold">{urlParams.from.toUpperCase()}</th>
                    <th className="px-4 py-3 text-left text-brand-teal font-semibold">{urlParams.to.toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageContent.sourceInfo.map((item, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.label}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.value}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{pageContent.targetInfo[i]?.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {pageContent?.features && urlParams && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pageContent.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-gold dark:hover:border-brand-gold transition-colors">
                  <span className="flex-shrink-0 text-brand-teal text-xl mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Device Support Section */}
      {pageContent?.deviceSupportText && urlParams && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Device Support</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {pageContent.deviceSupportText}
            </p>
            <div className="flex flex-wrap gap-3">
              {['Windows', 'macOS', 'Linux', 'iOS', 'Android'].map(device => (
                <span key={device} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                  {device}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional Content Sections */}
      {pageContent?.sections && pageContent.sections.length > 0 && urlParams && (
        <>
          {pageContent.sections.map((section, i) => (
            <section key={i} className={`py-16 ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.body}
                </p>
              </div>
            </section>
          ))}
        </>
      )}

      {/* FAQ Section specific to this conversion */}
      {urlParams && fromFormat && toFormat && faqItems.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              {fromFormat.displayName} to {toFormat.displayName} – FAQ
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:border-brand-gold dark:hover:border-brand-gold transition-colors">
                  <p className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                    {item.question}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                <span className="text-xl font-bold font-poppins">MicroJPEG</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-opensans">
                The smartest way to compress and optimize your images for the web.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold font-poppins mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans">
                <li><a href="/features" className="hover:text-black dark:hover:text-white">Features</a></li>
                <li><a href="/pricing" className="hover:text-black dark:hover:text-white">Pricing</a></li>
                <li><a href="/api-docs" className="hover:text-black dark:hover:text-white">API</a></li>
                <li><a href="/api-docs" className="hover:text-black dark:hover:text-white">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold font-poppins mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans">
                <li><a href="/about" className="hover:text-black dark:hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-black dark:hover:text-white">Blog</a></li>
                <li><a href="/contact" className="hover:text-black dark:hover:text-white">Contact</a></li>
                <li><a href="/support" className="hover:text-black dark:hover:text-white">Support</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold font-poppins mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 font-opensans">
                <li><a href="/privacy-policy" className="hover:text-black dark:hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-black dark:hover:text-white">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-black dark:hover:text-white">Cookie Policy</a></li>
                <li><a href="/cancellation-policy" className="hover:text-black dark:hover:text-white">Cancellation Policy</a></li>
                <li><a href="/privacy-policy" className="hover:text-black dark:hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 pt-8 text-center text-gray-500 dark:text-gray-400 font-opensans">
            <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
            <p className="text-xs mt-2 opacity-75">
              Background photo by <a href="https://www.pexels.com/photo/selective-focus-photo-of-white-petaled-flowers-96627/" target="_blank" rel="noopener noreferrer" className="hover:underline">AS Photography</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}