import { useState, useRef, useCallback, useEffect, lazy } from 'react';
import { Upload, Settings, Download, Zap, Shield, Sparkles, X, Check, ArrowRight, ImageIcon, ChevronDown, ChevronUp, Crown, Plus, Minus, Menu, Calendar, Activity } from 'lucide-react';
import { SiWordpress } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { sessionManager } from '@/lib/sessionManager';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import { SEO_CONTENT, STRUCTURED_DATA } from '@/data/seoData';
import logoUrl from '@assets/mascot-logo-optimized.png';
import mascotUrl from '@/assets/mascot.webp';
import avifIcon from '@/assets/format-icons/avif.jpg';
import jpegIcon from '@/assets/format-icons/jpeg.jpg';
import pngIcon from '@/assets/format-icons/png.jpg';
import webpIcon from '@/assets/format-icons/webp.jpg';
import betaUser1 from '@assets/01_1756987891168.webp';
import betaUser2 from '@assets/06_1756987891169.webp';
import betaUser3 from '@assets/07_1756987891169.webp';

// Lazy load heavy components for better performance
const AdSenseAd = lazy(() => import('@/components/AdSenseAd').then(m => ({ default: m.AdSenseAd })));
const OurProducts = lazy(() => import('@/components/our-products'));

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
// All limits enforced server-side with IP-based tracking
// Anonymous users: 500 monthly operations (no hourly/daily limits)
// Tier-aware limits helper (returns sizes in MB)
const getTierLimits = (tier: string) => {
  const limits: Record<string, { regular: number; raw: number; batch: number }> = {
    free: { regular: 7, raw: 15, batch: 3 },
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

// FAQ Data Structure
const FAQ_DATA = {
  General: [
    {
      question: "Why should I compress my images for my website?",
      answer: "Optimizing your images with Micro JPEG brings several benefits to your website. Micro JPEG reduces file sizes by up to 80% without sacrificing quality, leading to faster page loads. This optimization is essential for keeping user attention and ensuring an enjoyable user experience. Additionally, it minimizes bandwidth usage, making your website more efficient and cost-effective. Image compression also plays a role in SEO, as efficiently compressed images contribute to faster page speeds and improve your website's search engine ranking."
    },
    {
      question: "What file formats does Micro JPEG support for image compression?",
      answer: "Micro JPEG supports over 13 input formats including JPEG, PNG, WebP, AVIF, TIFF, SVG, BMP, GIF, ICO, and RAW formats (CR2, NEF, ARW, DNG, ORF, RW2, PEF, SRW, RAF). You can compress to popular web formats like JPEG, PNG, WebP, and AVIF for optimal web performance."
    },
    {
      question: "Is the privacy of my images ensured?",
      answer: "Absolutely! Your privacy is our top priority. All uploaded images are automatically deleted from our servers within 24 hours. We use enterprise-grade security measures to protect your data during processing. Your images are never stored permanently, shared with third parties, or used for any purpose other than compression. We're GDPR compliant and maintain strict data protection standards."
    },
    {
      question: "What does Micro JPEG do?",
      answer: "Micro JPEG is a professional image compression and optimization service that helps websites load faster by reducing image file sizes without losing quality. We offer both a user-friendly web interface and a powerful API for developers, supporting batch processing, format conversion, and advanced compression algorithms."
    },
    {
      question: "Why did you create Micro JPEG?",
      answer: "We created Micro JPEG to solve the growing problem of slow-loading websites caused by large image files. With the increasing importance of page speed for SEO and user experience, we wanted to provide the most advanced compression technology that maintains visual quality while dramatically reducing file sizes. Our goal is to make the web faster, one image at a time."
    }
  ],
  Compression: [
    {
      question: "How much compression can I expect?",
      answer: "Micro JPEG typically achieves 60-80% file size reduction while maintaining excellent visual quality. The exact compression ratio depends on your original image format, quality settings, and content type. Our advanced algorithms are specifically optimized for web images and often outperform other compression services."
    },
    {
      question: "What's the difference between lossy and lossless compression?",
      answer: "Lossy compression removes some image data to achieve smaller file sizes, which may slightly reduce quality but is often imperceptible. Lossless compression reduces file size without any quality loss by optimizing how the data is stored. Micro JPEG offers both options, allowing you to choose based on your specific needs."
    },
    {
      question: "Can I compress images in bulk?",
      answer: "Yes! Premium users can upload and compress multiple images simultaneously with our batch processing feature. You can also download all compressed images as a single ZIP file. Free users can compress one image at a time, while Premium users can process up to 5 images concurrently."
    },
    {
      question: "Do you support RAW image formats?",
      answer: "Yes, we support popular RAW formats including CR2 (Canon), NEF (Nikon), ARW (Sony), DNG (Adobe), and others. RAW files are converted to web-optimized formats like JPEG or PNG with professional-grade processing to maintain the highest possible quality."
    }
  ],
  API: [
    {
      question: "How do I get started with the Micro JPEG API?",
      answer: "Getting started is simple! Sign up for a free account, generate your API key from the dashboard, and you'll have 500 free operations per month. Our comprehensive documentation includes code examples in multiple programming languages, and you can start compressing images within minutes."
    },
    {
      question: "What are the API rate limits?",
      answer: "Free tier users get 500 operations/month with 25 operations/day and 5 operations/hour limits. Premium users get 50,000 operations/month with higher rate limits. Enterprise users have custom limits based on their needs. All limits reset monthly."
    },
    {
      question: "Do you offer SDKs for different programming languages?",
      answer: "Our REST API works with any programming language that can make HTTP requests. We provide detailed documentation with examples in Python, JavaScript, PHP, cURL, and more. We're also working on official SDKs for popular languages - contact us if you have specific requirements."
    },
    {
      question: "Can I use the API for commercial projects?",
      answer: "Absolutely! Our API is designed for commercial use. We offer different tiers to match your usage needs, from small websites to large-scale applications processing millions of images. Enterprise users get dedicated support and custom solutions."
    }
  ],
  Pricing: [
    {
      question: "Is there a free plan available?",
      answer: "Yes! Our free plan includes 500 compressions per month, web interface access, API access, support for all image formats, and community support. It's perfect for trying our service or small personal projects."
    },
    {
      question: "What's included in the Premium plan?",
      answer: "Premium ($20/month) includes 50,000 operations, larger file size limits (100MB), batch processing, priority support, advanced compression settings, multiple output formats, and higher API rate limits. Perfect for professional websites and developers."
    },
    {
      question: "Do you offer Enterprise solutions?",
      answer: "Yes! Our Enterprise plan includes unlimited operations, dedicated infrastructure, custom integrations, SLA guarantees, dedicated account management, and white-label solutions. Contact our sales team for custom pricing based on your specific needs."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time with no cancellation fees. Your subscription will continue until the end of your current billing period, and you can always downgrade to our free plan. We also offer a 30-day money-back guarantee for new Premium subscriptions."
    }
  ],
  WordPress: [
    {
      question: "How does the WordPress plugin work?",
      answer: "Our WordPress plugin automatically compresses images when you upload them to your media library. It integrates seamlessly with your existing workflow - just install, configure your compression settings, and all new uploads will be optimized automatically. You can also bulk-optimize existing images."
    },
    {
      question: "Will the plugin slow down my website?",
      answer: "Not at all! The compression happens in the background via our API, so it won't affect your website's performance. In fact, the compressed images will make your website load faster for visitors. The plugin is lightweight and optimized for minimal impact on your WordPress installation."
    },
    {
      question: "Can I optimize existing images in my media library?",
      answer: "Yes! The plugin includes a bulk optimization feature that lets you compress all existing images in your media library with just a few clicks. You can select specific images or optimize your entire library, and track the progress in real-time."
    },
    {
      question: "Is the WordPress plugin free?",
      answer: "The plugin itself is free to install, but it uses your Micro JPEG API quota. Free accounts get 500 compressions per month, which works great for small to medium websites. For larger sites, you might want to consider our Premium plan for higher limits."
    }
  ]
};

// SessionManager removed - using imported sessionManager and DualUsageTracker

// Processing Progress Estimation
class ProcessingEstimator {
  static estimateTime(file: File, operation: 'compress' | 'convert'): number {
    const sizeMB = file.size / (1024 * 1024);
    const baseTime = operation === 'compress' ? 2000 : 3500;
    const sizeMultiplier = operation === 'compress' ? 500 : 800;
    
    return Math.max(baseTime + (sizeMB * sizeMultiplier), 1000);
  }

  static simulateProgress(
    duration: number,
    onProgress: (progress: number) => void
  ): Promise<void> {
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
  }
}

// validateFile function moved inside component to access checkOperation hook

// Helper function to group results by original filename
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

// Helper function to get format-specific styling
const getFormatInfo = (format: string) => {
  const formatMap: Record<string, { icon: string; color: string; bgColor: string; textColor: string }> = {
    'avif': { 
      icon: avifIcon, 
      color: '#F59E0B', // Yellow/orange
      bgColor: '#FEF3C7', 
      textColor: '#92400E' 
    },
    'jpeg': { 
      icon: jpegIcon, 
      color: '#10B981', // Green
      bgColor: '#D1FAE5', 
      textColor: '#065F46' 
    },
    'jpg': { 
      icon: jpegIcon, 
      color: '#10B981', // Green
      bgColor: '#D1FAE5', 
      textColor: '#065F46' 
    },
    'png': { 
      icon: pngIcon, 
      color: '#3B82F6', // Blue
      bgColor: '#DBEAFE', 
      textColor: '#1E40AF' 
    },
    'webp': { 
      icon: webpIcon, 
      color: '#F97316', // Orange
      bgColor: '#FED7AA', 
      textColor: '#EA580C' 
    }
  };
  
  return formatMap[format] || {
    icon: jpegIcon,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: '#374151'
  };
};

// Main Component
// Social sharing tracking function
const trackSocialShare = async (platform: string) => {
  try {
    const response = await fetch('/api/social-share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.points) {
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        // You can add toast notification here if needed
      }
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
  }
};

// Simplified social sharing function will be defined inside the component

// Loyalty program sharing function will be defined inside the component


// Results sharing function - shares actual compression results (moved inside component for session access)

// Helper function to check if format conversion is needed
const isConversionRequest = (originalFormat: string, targetFormat: string): boolean => {
  // Normalize formats (remove dots and convert to lowercase)
  const normalizeFormat = (format: string) => format.replace('.', '').toLowerCase();
  const original = normalizeFormat(originalFormat);
  const target = normalizeFormat(targetFormat);
  
  // If target is 'keep-original' or same as original, no conversion needed
  if (target === 'keep-original' || target === original) {
    return false;
  }
  
  // Format aliases mapping
  const formatAliases: { [key: string]: string } = {
    'jpg': 'jpeg',
    'jpeg': 'jpeg',
    'png': 'png',
    'webp': 'webp',
    'avif': 'avif'
  };
  
  const normalizedOriginal = formatAliases[original] || original;
  const normalizedTarget = formatAliases[target] || target;
  
  // Return true if formats are different (conversion needed)
  return normalizedOriginal !== normalizedTarget;
};

export default function MicroJPEGLanding() {
  const { isAuthenticated, user } = useAuth();
  const [userTier, setUserTier] = useState<string>('free');
  
  // CRITICAL: Redirect non-paid users to free page
  useEffect(() => {
    if (!isAuthenticated) {
      // Not logged in → Redirect to free page
      window.location.href = '/free';
      return;
    }
    // Logged in, check tier below
  }, [isAuthenticated]);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoadingTier, setIsLoadingTier] = useState(true); // Loading until we verify paid tier
  
  // Use server usage data instead of local session data
  const [session, setSession] = useState<SessionData>(() => {
    const initialSession = sessionManager.getSession();
    return initialSession;
  });

  // Server usage data automatically updates via React Query

  // Keep component session state in sync with SessionManager
  useEffect(() => {
    const currentSession = sessionManager.getSession();
    if (currentSession.results.length !== session.results.length) {
      console.log('Syncing session state - SessionManager has', currentSession.results.length, 'results, component has', session.results.length);
      setSession(currentSession);
    }
  }, [session.results.length]);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [newlyAddedFiles, setNewlyAddedFiles] = useState<FileWithPreview[]>([]);
  const [fileObjectUrls, setFileObjectUrls] = useState<Map<string, string>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingFileIds, setProcessingFileIds] = useState<Set<string>>(new Set());
  const [formatQueue, setFormatQueue] = useState<string[]>([]);
  const [currentlyProcessingFormat, setCurrentlyProcessingFormat] = useState<string | null>(null);
  const [conversionEnabled, setConversionEnabled] = useState(true); // Always enable format selection
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['jpeg']); // Default to JPEG compression/conversion
  const [showModal, setShowModal] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [modalState, setModalState] = useState<'processing' | 'complete'>('processing');
  const [dragActive, setDragActive] = useState(false);
  const [showAllFormats, setShowAllFormats] = useState(false);
  
  // Launch offer dialog states
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [claimingOffer, setClaimingOffer] = useState(false);
  const [claimResult, setClaimResult] = useState<{ bonusCreditsRemaining?: number; apiTrialExpiresAt?: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch tier on mount
  useEffect(() => {
    const fetchTier = async () => {
      try {
        const response = await fetch('/api/user/tier-info', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data?.tier?.name) setUserTier(data.tier.name);
        }
      } catch (err) {
        // silent - keep default tier
        console.debug('Failed to fetch user tier', err);
      }
    };
    if (isAuthenticated) fetchTier();
  }, [isAuthenticated]);

  // Helper to map user tier + auth to a canonical pageIdentifier
  const getTierPageIdentifier = (tier: string, auth: boolean) => {
    //if (!auth) return 'free-no-auth';
    //if (tier === 'free') return 'free-auth';
    if (tier.startsWith('starter')) return 'premium-29';
    if (tier.startsWith('pro')) return 'premium-29';
    if (tier.startsWith('business')) return 'enterprise-99';
    return 'free-auth';
  };

  // Helper to map internal tier keys to a friendly display name used in the hero
  const getTierDisplayName = (tier: string) => {
    const names: Record<string, string> = {
      'starter-m': '$9/month',
      'starter-y': '$49/year',
      'pro-m': '$19/month',
      'pro-y': '$149/year',
      'business-m': '$49/month',
      'business-y': '$399/year',
    };
    return names[tier] || 'Free Forever';
  };

  // Compute current tier limits (sizes in bytes)
  const tierLimits = getTierLimits(userTier);
  const MAX_FILE_SIZE = tierLimits.regular * 1024 * 1024;
  const MAX_RAW_FILE_SIZE = tierLimits.raw * 1024 * 1024;
  const MAX_BATCH_SIZE = tierLimits.batch;

  // Simple client-side file validation - server enforces all limits with IP tracking
  const validateFile = useCallback(async (file: File, isUserAuthenticated: boolean = false): Promise<string | null> => {
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isRawFormat = ['.cr2', '.arw', '.dng', '.nef', '.orf', '.rw2'].some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!SUPPORTED_FORMATS.includes(file.type.toLowerCase()) && !isRawFormat) {
      return `${file.name}: Unsupported format. Please use JPEG, PNG, WebP, AVIF, TIFF, SVG, or RAW formats (CR2, ARW, DNG, NEF, ORF, RAF, RW2).`;
    }
    
  // Use different file size limits for RAW vs regular files
  const maxSize = isRawFormat ? MAX_RAW_FILE_SIZE : MAX_FILE_SIZE;
  const sizeLabel = `${isRawFormat ? tierLimits.raw : tierLimits.regular}MB`;
  const fileType = isRawFormat ? "RAW" : "regular";
    
    if (file.size > maxSize) {
      return `${file.name}: File too large. Maximum size is ${sizeLabel} for ${fileType} files.`;
    }
    
    return null;
  }, [userTier]);
  
  // Fetch user tier information from API (paid users only)
  useEffect(() => {
    const fetchTierInfo = async () => {
      try {
        // Add 3-second timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('/api/user/tier-info', {
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data: TierResponse = await response.json();
          
          // CRITICAL: If free tier, redirect to /free page
          if (data.tier.tierName === 'free') {
            window.location.href = '/free';
            return;
          }
          
          setTierInfo(data.tier);
          setSubscription(data.subscription);
          setUserTier(data.tier.tierName);
          setIsLoadingTier(false); // ✅ CRITICAL: Stop loading
          console.log('✅ Paid tier loaded:', data.tier.tierName);
        } else {
          console.log('⚠️ Tier API error, redirecting to free page');
          window.location.href = '/free';
        }
      } catch (error) {
        console.log('⚠️ Tier fetch failed, redirecting to free page:', error);
        window.location.href = '/free';
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchTierInfo();
    } else {
      // Not authenticated → redirect
      window.location.href = '/free';
    }
  }, [isAuthenticated]);
  
  // Lead magnet state
  const [leadMagnetEmail, setLeadMagnetEmail] = useState('');
  const [isSubmittingLeadMagnet, setIsSubmittingLeadMagnet] = useState(false);
  
  // FAQ state
  const [activeCategory, setActiveCategory] = useState('General');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // FAQ helper functions
  const toggleQuestion = (questionIndex: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex);
    } else {
      newExpanded.add(questionIndex);
    }
    setExpandedQuestions(newExpanded);
  };

  const switchCategory = (category: string) => {
    setActiveCategory(category);
    setExpandedQuestions(new Set()); // Collapse all when switching categories
  };

  // Lead magnet form handler
  const handleLeadMagnetSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!leadMagnetEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to get your free credits.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadMagnetEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingLeadMagnet(true);
    
    try {
      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: leadMagnetEmail,
          firstName: leadMagnetEmail.split('@')[0] // Extract first name from email
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success! 🎉",
          description: "Check your email for your free credits and optimization guide!",
          duration: 5000,
        });
        setLeadMagnetEmail(''); // Clear the form
      } else {
        throw new Error(data.message || 'Failed to send guide');
      }
    } catch (error) {
      console.error('Lead magnet error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLeadMagnet(false);
    }
  };


  // Simplified social sharing function
  const shareApp = (platform: string) => {
    // Different text for Twitter (shorter) vs other platforms (full)
    const twitterText = "🦉 https://microjpeg.com | 🚀 Discover Micro JPEG - the ultimate image compression tool! ✨\n\n✅ 90% Size Reduction\n✅ Lossless Quality\n✅ Instant Processing\n✅ Web Optimized\n✅ JPG, PNG, AVIF, WEBP, SVG, RAW, TIFF supported\n\nCompress your images without losing quality!";
    
    const fullText = "🦉 https://microjpeg.com | 🚀 Discover Micro JPEG - the ultimate image compression tool! ✨\n\n✅ 90% Size Reduction\n✅ Lossless Quality\n✅ Instant Processing\n✅ Web Optimized\n✅ JPG, PNG, AVIF, WEBP, SVG, RAW, TIFF supported\n\nCompress your images without losing quality! Perfect for websites, social media, and storage optimization.";
    
    const appUrl = "https://microjpeg.com";
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`, '_blank', 'width=550,height=420');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
        break;
      case 'reddit':
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent('Discover Micro JPEG - Ultimate Image Compression Tool')}&text=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
        break;
      case 'youtube':
        // Copy to clipboard for YouTube video description
        if (navigator.clipboard) {
          navigator.clipboard.writeText(fullText).then(() => {
            toast({
              title: "📋 Copied to clipboard!",
              description: "Perfect for YouTube video descriptions!",
            });
          }).catch(() => {
            toast({
              title: "Copy Failed",
              description: "Please manually copy this text for YouTube: " + fullText,
              variant: "destructive",
            });
          });
        } else {
          toast({
            title: "Copy This Text",
            description: "For YouTube: " + fullText,
          });
        }
        break;
    }
    trackSocialShare(platform);
  };

  // Loyalty program sharing function
  const shareLoyaltyContent = async (platform: string) => {
    const successStoryText = "🚀 Just discovered MicroJPEG - the ultimate image compression tool! ✨\n\n📸 Compressed my images by 80% without quality loss\n⚡ Lightning-fast processing\n🌐 Perfect for web optimization\n\n#MicroJPEGCompress #ImageOptimization #WebPerformance\n\nTry it yourself: https://microjpeg.com";
    
    const featureText = "💎 MicroJPEG Features That Impressed Me:\n\n✅ 90% Size Reduction\n✅ Lossless Quality\n✅ Multiple Formats (JPG, PNG, WEBP, AVIF, SVG, RAW, TIFF)\n✅ Instant Processing\n✅ Web Optimized Output\n\n#MicroJPEGCompress #ImageCompression #TechTools\n\nhttps://microjpeg.com";
    
    const appUrl = "https://microjpeg.com";
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(successStoryText)}`, '_blank', 'width=550,height=420');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(featureText)}`, '_blank', 'width=550,height=420');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/dialog/share?app_id=87741124305&href=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(featureText)}`, '_blank', 'width=550,height=420');
        break;
      case 'instagram':
        // Copy to clipboard for Instagram
        if (navigator.clipboard) {
          navigator.clipboard.writeText(successStoryText).then(() => {
            toast({
              title: "📋 Copied to clipboard!",
              description: "Open Instagram and paste to share. You'll earn +12 operations!",
            });
          }).catch(() => {
            toast({
              title: "Copy Failed",
              description: "Please manually copy this text for Instagram: " + successStoryText,
              variant: "destructive",
            });
          });
        } else {
          toast({
            title: "Copy This Text",
            description: "For Instagram: " + successStoryText,
          });
        }
        break;
      case 'pinterest':
        const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(appUrl)}&description=${encodeURIComponent(featureText)}`;
        window.open(pinterestUrl, '_blank', 'width=550,height=420');
        break;
      case 'reddit':
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent('Amazing Image Compression Tool - MicroJPEG')}&text=${encodeURIComponent(featureText)}`, '_blank', 'width=550,height=420');
        break;
    }
    
    // Track the loyalty share and award operations
    try {
      const response = await fetch('/api/loyalty-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.operations) {
          toast({
            title: "🎉 Bonus Operations Earned!",
            description: `You earned +${data.operations} operations for sharing on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`,
          });
          // Usage stats are now automatically refreshed by header counter
        }
      } else if (response.status === 429) {
        const data = await response.json();
        toast({
          title: "Daily Limit Reached",
          description: data.message || "You can only earn rewards once per day per platform. Try again tomorrow!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log('Loyalty share tracking failed:', error);
    }
  };




  // Load existing session state but preserve results for accumulation
  useEffect(() => {
    const currentSession = sessionManager.getSession();
    setSession(currentSession);
  }, []);

  // SEO Meta Tags Effect
  useEffect(() => {
    document.title = "MicroJPEG - Smart Image Compression | Free AVIF, WebP, PNG & JPEG Optimizer";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Compress AVIF, WebP, PNG & JPEG images up to 90% smaller while maintaining quality. Free online image optimizer with advanced compression algorithms. No registration required.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Compress AVIF, WebP, PNG & JPEG images up to 90% smaller while maintaining quality. Free online image optimizer with advanced compression algorithms. No registration required.';
      document.head.appendChild(meta);
    }

    // Open Graph Tags
    const ogTags = [
      { property: 'og:title', content: 'MicroJPEG - Smart Image Compression Tool' },
      { property: 'og:description', content: 'Compress images up to 90% smaller while maintaining quality. Support for AVIF, WebP, PNG & JPEG formats.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'MicroJPEG - Smart Image Compression' },
      { name: 'twitter:description', content: 'Free online image compression tool. Reduce file sizes by up to 90%.' }
    ];

    ogTags.forEach(tag => {
      const existing = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (existing) {
        existing.setAttribute('content', tag.content);
      } else {
        const meta = document.createElement('meta');
        if (tag.property) meta.setAttribute('property', tag.property);
        if (tag.name) meta.setAttribute('name', tag.name);
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }, []);

  // Start processing function - moved up to be accessible in useEffect
  const startProcessing = useCallback(async () => {
    // Process only newly added files to avoid reprocessing existing ones
    const filesToProcess = newlyAddedFiles.length > 0 ? newlyAddedFiles : selectedFiles;
    if (filesToProcess.length === 0) return;

    // All limit checking is handled server-side with IP-based tracking
    // Server will return 400 with upgrade prompt if monthly 500 limit is reached
    console.log('🔧 Using server-side IP-based tracking for 500 monthly limit');

    setIsProcessing(true);
    setShowModal(true);
    setModalState('processing');
    setProcessingProgress(0);
    setProcessingStatus('Preparing files...');
    
    // Mark files as processing
    const fileIds = new Set(filesToProcess.map(f => f.id));
    setProcessingFileIds(fileIds);

    let progressInterval: NodeJS.Timeout | undefined;
    
    try {
      // Prepare FormData for the real API
      const formData = new FormData();
      
      // Add files to process to FormData
      filesToProcess.forEach((file) => {
        formData.append('files', file as File);
      });

      // Prepare compression settings
      const settings = {
        quality: 80, // Balanced quality for good compression ratios
        outputFormat: conversionEnabled && selectedFormats.length > 0 ? selectedFormats : 'keep-original',
        resizeOption: 'keep-original',
        compressionAlgorithm: 'standard',
        sessionId: sessionManager.getSessionId(), // ← ADD THIS LINE
  pageIdentifier: getTierPageIdentifier(userTier, isAuthenticated),
      };

      // Add settings to FormData
      formData.append('settings', JSON.stringify(settings));

      // Estimate processing duration based on file count and sizes
      const totalSize = filesToProcess.reduce((sum, file) => sum + file.size, 0);
      const estimatedDuration = Math.max(1000, Math.min(5000, filesToProcess.length * 800 + totalSize / 1024 / 1024 * 100));
      
      setProcessingProgress(15);
      setProcessingStatus('Compressing images...');
      
      // Start progress simulation
      let currentProgress = 15;
      progressInterval = setInterval(() => {
        const increment = Math.random() * 8 + 2; // 2-10% increments
        currentProgress = Math.min(currentProgress + increment, 85); // Cap at 85% until completion
        setProcessingProgress(Math.floor(currentProgress));
      }, Math.max(estimatedDuration / 20, 200)); // Update every 200ms minimum

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Clear progress interval and set to completion
      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (data.error) {
        throw new Error(data.error);
      }

      // Usage tracking is handled server-side with IP-based tracking
      // Server tracks monthly 500 operations per IP for anonymous users
      if (data.results && data.results.length > 0) {
        console.log(`Processed ${data.results.length} files - server handles all tracking`);
        console.log(`Processed ${data.results.length} files - server handles all tracking`);

      // Trigger counter refresh in header
         window.dispatchEvent(new Event('refreshUniversalCounter'));
         console.log('🔄 Counter refresh event dispatched');
      }

      // Get the latest session data to ensure we don't lose any previous results
      const latestSession = sessionManager.getSession();
      
      console.log('startProcessing - Before updating session - existing results:', latestSession.results.length);
      console.log('startProcessing - New results to add:', data.results?.length || 0);
      
      // Update session with results (accumulate with existing results)
      const newSession: SessionData = {
        ...latestSession,
        results: [...latestSession.results, ...(data.results || [])],
        batchDownloadUrl: data.batchDownloadUrl,
      };
      
      console.log('startProcessing - After merging - total results:', newSession.results.length);

      setSession(newSession);
      sessionManager.updateSession(newSession);

      // Usage stats are automatically refreshed by header counter
      setProcessingProgress(100);
      setProcessingStatus('MicroJPEG just saved you space!');
      setModalState('complete');
      setIsProcessing(false);
      setProcessingFileIds(new Set()); // Clear processing state
      
      // Don't clear selected files - keep them for thumbnails and format conversions
      // Clear newly added files to prevent reprocessing
      setNewlyAddedFiles([]);

      // Show pricing cards after 3 or more files have been processed
      const uniqueFiles = new Set(newSession.results.map(r => r.originalName));
      if (uniqueFiles.size >= 3 && !showPricing) {
        setTimeout(() => {
          setShowPricing(true);
        }, 1000); // Show pricing modal 1 second after processing completes
      }

    } catch (error) {
      console.error('Compression error:', error);
      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      toast({
        title: "Compression failed",
        description: error instanceof Error ? error.message : "An error occurred during compression",
        variant: "destructive",
      });
      setIsProcessing(false);
      setProcessingFileIds(new Set()); // Clear processing state on error
      setCurrentlyProcessingFormat(null); // Clear currently processing format
      setShowModal(false);
      
      // Don't clear selected files - keep them for thumbnails and format conversions
      // Clear newly added files to prevent reprocessing
      setNewlyAddedFiles([]);
    }
  }, [selectedFiles, user, session, selectedFormats, conversionEnabled, toast]);

  // Download all results as comprehensive ZIP
  const downloadAllResults = useCallback(async () => {
    if (session.results.length === 0) {
      toast({
        title: "No files to download",
        description: "Please compress some images first.",
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
      setShowPricing(true);

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

  // Auto-start processing when new files are added
  useEffect(() => {
    if (newlyAddedFiles.length > 0 && !isProcessing && selectedFormats.length > 0) {
      // Process only newly added files
      // Small delay to ensure state updates are complete
      const timer = setTimeout(() => {
        startProcessing();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [newlyAddedFiles.length, isProcessing, selectedFormats, startProcessing]); // Auto-process new uploads only

  // Clear session only on page unload/refresh for fresh start and cleanup object URLs
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear session data when page is about to unload (window close or refresh)
      clearResults();
      // Cleanup object URLs to prevent memory leaks
      fileObjectUrls.forEach(url => URL.revokeObjectURL(url));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Cleanup object URLs on component unmount
      fileObjectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [fileObjectUrls]);

  // This useEffect will be moved after the processSpecificFormat function

  // Process files for a specific format only
  const processSpecificFormat = useCallback(async (format: string) => {
    if (selectedFiles.length === 0) return;

    // Note: Usage limits are now handled by the universal counter in header
    if (user) {
      // Legacy check - may be removed in future
      if (false) {
        toast({
          title: "Usage Limit Reached",
          description: "You have reached your operation limit. Please upgrade your plan.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    setShowModal(true);
    // Only switch to processing if no existing results, otherwise stay in complete mode
    if (session.results.length === 0) {
      setModalState('processing');
    }
    setProcessingProgress(0);
    setProcessingStatus(`Converting to ${format.toUpperCase()}...`);

    try {
      // Prepare FormData for the API
      const formData = new FormData();
      
      // Get fresh session data to check existing results
      const currentSession = sessionManager.getSession();
      
      // Add only files that don't already have results for this format
      const filesToProcess = selectedFiles.filter(file => 
        !currentSession.results.some(result => 
          result.originalName === file.name && 
          result.outputFormat?.toLowerCase() === format.toLowerCase()
        )
      );
      
      // If no files need processing for this format, skip
      if (filesToProcess.length === 0) {
        console.log(`All files already have ${format.toUpperCase()} results, skipping processing`);
        setIsProcessing(false);
        return;
      }
      
      filesToProcess.forEach((file) => {
        formData.append('files', file as File);
      });

      // Prepare compression settings for specific format
      const settings = {
        quality: 80,
        outputFormat: [format], // Only process this specific format
        resizeOption: 'keep-original',
        compressionAlgorithm: 'standard',
        sessionId: sessionManager.getSessionId(), // ← ADD THIS LINE
  pageIdentifier: getTierPageIdentifier(userTier, isAuthenticated),
      };

      formData.append('settings', JSON.stringify(settings));

      setProcessingProgress(20);
      setProcessingStatus(`Processing ${format.toUpperCase()}...`);

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Usage tracking is handled server-side with IP-based tracking
      if (data.results && data.results.length > 0) {
        console.log(`Processed ${data.results.length} files converted to ${format}`);
      }

      // Get the latest session data to ensure we don't lose any previous results
      const latestSession = sessionManager.getSession();
      
      console.log('processSpecificFormat - Before updating session - existing results:', latestSession.results.length);
      console.log('processSpecificFormat - New results to add:', data.results?.length || 0);
      
      // Update session with new results (append to existing results)
      const updatedSession = sessionManager.updateSession({
        results: [...latestSession.results, ...data.results],
        batchDownloadUrl: data.batchDownloadUrl || latestSession.batchDownloadUrl,
        compressions: latestSession.compressions + data.results.length,
      });
      
      console.log('processSpecificFormat - After merging - total results:', updatedSession.results.length);
      setSession(updatedSession);

      // Usage stats are now automatically refreshed by header counter
      setProcessingProgress(100);
      setProcessingStatus(`${format.toUpperCase()} conversion complete!`);
      setModalState('complete');
      setIsProcessing(false);
      setProcessingFileIds(new Set()); // Clear processing state
      setCurrentlyProcessingFormat(null); // Clear currently processing format
      
      // Don't clear selected files - keep them for thumbnails and format conversions
      // Clear newly added files to prevent reprocessing
      setNewlyAddedFiles([]);

    } catch (error) {
      console.error('Format conversion error:', error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "An error occurred during format conversion",
        variant: "destructive",
      });
      setIsProcessing(false);
      setProcessingFileIds(new Set()); // Clear processing state on error
      setCurrentlyProcessingFormat(null); // Clear currently processing format
      
      // Don't clear selected files - keep them for thumbnails and format conversions
      // Clear newly added files to prevent reprocessing
      setNewlyAddedFiles([]);
    }
  }, [selectedFiles, user, toast]);

  // Process format queue sequentially
  useEffect(() => {
    if (formatQueue.length > 0 && !isProcessing && !currentlyProcessingFormat) {
      const nextFormat = formatQueue[0];
      setCurrentlyProcessingFormat(nextFormat);
      setFormatQueue(prev => prev.slice(1)); // Remove from queue
      
      // Start processing the format
      setTimeout(() => {
        processSpecificFormat(nextFormat);
      }, 100);
    }
  }, [formatQueue, isProcessing, currentlyProcessingFormat, processSpecificFormat]);

  // File handling
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    // Check batch upload limit - free tier page allows only 1 file at a time
    const maxBatchSize = 1; // Anonymous users: 1 file at a time
    if (fileArray.length > maxBatchSize) {
      toast({
        title: "Upload limit reached",
        description: "Free tier allows only 1 file upload at a time. Please upload files one by one.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if already processing - prevent concurrent uploads
    if (isProcessing) {
      toast({
        title: "Processing in progress",
        description: "Please wait for the current file to finish processing before uploading another.",
        variant: "destructive",
      });
      return;
    }

    // Process files async to handle server-side validation and hourly limits
    for (const file of fileArray) {
      const error = await validateFile(file, !!user);
      if (error) {
        errors.push(error);
        // Stop processing more files if hourly limit is reached
        if (error.includes('hourly limit')) {
          break;
        }
      } else {
        // Check for duplicates - prevent uploading files already in selectedFiles or results
        const isDuplicate = selectedFiles.some(
          existing => existing.name === file.name && existing.size === file.size
        ) || session.results.some(result => 
          result.originalName === file.name
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
      // Check if it's a hourly limit error for friendly messaging
      const hasHourlyLimitError = errors.some(error => error.includes('hourly limit'));
      
      toast({
        title: hasHourlyLimitError ? "⏰ Hourly Limit Reached" : "File validation errors",
        description: errors.join('\n'),
        variant: hasHourlyLimitError ? "default" : "destructive",
        duration: hasHourlyLimitError ? 8000 : 5000, // Longer duration for limit messages
      });
    }

    if (validFiles.length > 0) {
      // Create and cache object URLs for the valid files to prevent repaint issues
      setFileObjectUrls(prev => {
        const newMap = new Map(prev);
        validFiles.forEach(file => {
          if (!newMap.has(file.name)) {
            newMap.set(file.name, URL.createObjectURL(file));
          }
        });
        return newMap;
      });
      
      // For sequential uploads, accumulate files and track newly added files
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setNewlyAddedFiles(validFiles);
      sessionManager.trackActivity();
      
      // Reset format selection to JPEG only on every new file upload
      setSelectedFormats(['jpeg']);
      
      toast({
        title: "Files added - Auto-compressing...",
        description: `${validFiles.length} file(s) added. Starting compression automatically.`,
      });
    }
  }, [selectedFiles, toast]);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // File input click
  const handleFileInput = () => {
    fileInputRef.current?.click();
  };

  // Remove file
  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id));
  };

  // Clear all files
  const clearFiles = () => {
    setSelectedFiles([]);
    // Reset file input to allow same file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset format selection to JPEG only
    setSelectedFormats(['jpeg']);
  };

  // Clear all results from the output modal and close it
  const clearResults = () => {
    const newSession: SessionData = {
      ...session,
      results: [],
      batchDownloadUrl: undefined,
    };
    setSession(newSession);
    sessionManager.updateSession(newSession);
    // Clear selected files to allow re-upload of same files
    setSelectedFiles([]);
    // Reset file input to allow same file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset format selection to JPEG only
    setSelectedFormats(['jpeg']);
    // Close the modal
    setShowModal(false);
    // Reset modal state
    setModalState('processing');
    setIsProcessing(false);
    setProcessingProgress(0);
    // Reset drag state
    setDragActive(false);
  };


  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if format already exists for ALL current files in output modal
  const hasFormatInResults = (format: string) => {
    // If no files selected, allow format selection
    if (selectedFiles.length === 0) {
      return false;
    }
    
    // Get fresh session data to check existing results
    const currentSession = sessionManager.getSession();
    
    // Check if ALL selected files already have results for this format
    return selectedFiles.every(file => 
      currentSession.results.some(result => 
        result.originalName === file.name && 
        result.outputFormat?.toLowerCase() === format.toLowerCase()
      )
    );
  };

  // Toggle format selection and trigger automatic compression
  const toggleFormat = async (format: string) => {
    // If format already exists in output modal, do nothing
    if (hasFormatInResults(format)) {
      return;
    }

    // Only process if we have files to compress
    if (selectedFiles.length === 0) {
      return;
    }

    // Update selected formats
    setSelectedFormats(prev => {
      if (prev.includes(format)) {
        // Never allow removing JPEG - it must always stay selected
        if (format === 'jpeg') {
          return prev; // Keep JPEG selected
        }
        return prev.filter(f => f !== format);
      } else {
        const newFormats = [...prev, format];
        
        // Add to queue for sequential processing
        setFormatQueue(prev => {
          if (!prev.includes(format)) {
            return [...prev, format];
          }
          return prev;
        });
        
        return newFormats;
      }
    });
  };


  // File type to available formats mapping (based on conversion table)
  // RAW formats only offer conversion to standard formats, not to themselves
  const fileTypeFormatMap: Record<string, string[]> = {
    'jpg': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'jpeg': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'png': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'webp': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'avif': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'dng': ['jpeg', 'png', 'webp', 'avif', 'tiff'], // RAW formats convert to standard formats only
    'cr2': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'arw': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'nef': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'orf': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'raf': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'rw2': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'tiff': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'tif': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'bmp': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'gif': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'svg': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'heic': ['jpeg', 'png', 'webp', 'avif', 'tiff'],
    'heif': ['jpeg', 'png', 'webp', 'avif', 'tiff']
  };

  // Get available formats based on uploaded file types
  const getAvailableFormats = () => {
    if (selectedFiles.length === 0) return OUTPUT_FORMATS;
    
    // Get unique file extensions from selected files
    const fileExtensions = selectedFiles.map(file => {
      const extension = file.name.toLowerCase().split('.').pop() || '';
      return extension;
    });
    
    // Find common formats available for all selected file types
    let availableFormats = OUTPUT_FORMATS;
    
    if (fileExtensions.length > 0) {
      // Start with formats available for the first file type
      const firstExtension = fileExtensions[0];
      availableFormats = fileTypeFormatMap[firstExtension] || OUTPUT_FORMATS;
      
      // Find intersection with other file types
      for (const extension of fileExtensions.slice(1)) {
        const formatOptions = fileTypeFormatMap[extension] || OUTPUT_FORMATS;
        availableFormats = availableFormats.filter(format => formatOptions.includes(format));
      }
    }
    
    return availableFormats;
  };

  // Check if PNG is disabled for current selection
  const isPngDisabled = () => {
    // PNG conversion is now enabled for all users including free users
    return false;
  };


  // Show loading state while fetching tier
  // Show loading while verifying paid tier
  if (isLoadingTier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Verifying subscription...</div>
        </div>
      </div>
    );
  }
  

  return (
    <>
      <SEOHead 
        title={SEO_CONTENT.homepage.title}
        description={SEO_CONTENT.homepage.description}
        keywords={SEO_CONTENT.homepage.keywords}
        structuredData={STRUCTURED_DATA.homepage}
        canonicalUrl="https://microjpeg.com"
      />
      <Header />
      <div className="min-h-screen bg-gray-900">

      {/* Hero Section - Dark Mode */}
      <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
        
        {/* Additional accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
  
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Hero Text */}
            <div className="space-y-6 text-center lg:text-left">
              
              <div className="space-y-4 sm:space-y-6">
                {isAuthenticated ? (
                  // Signed-in users see upgrade message
                  <>
                    {/* Tier Badge - shows for paid users */}
                    {isAuthenticated && userTier !== 'free' && subscription && (
                      <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 text-base font-semibold mb-4 shadow-lg">
                        {getTierDisplayName(userTier)} Plan
                        {subscription?.daysRemaining && (
                          <span className="ml-2 opacity-90">
                            • {subscription.daysRemaining} days remaining
                          </span>
                        )}
                      </Badge>
                    )}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                      <span className="text-white">Professional Image</span>{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-yellow-400">
                        Compression
                      </span>
                      <br />
                      <span className="text-white">For Photographers & Developers</span>
                      <br />
                      <span className="text-3xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                        {userTier === 'free' ? 'Free Forever' : getTierDisplayName(userTier)}
                      </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      Compress JPG, PNG, WEBP, AVIF, TIFF, and RAW files (CR2, NEF, ARW, DNG) 
                      without sacrificing quality. Used by thousands of creatives worldwide.
                    </p>
                  </>
                ) : (
                  // Anonymous users see free compression message
                  <>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                      <span className="text-white">Professional Image</span>{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-yellow-400">
                        Compression
                      </span>
                      <br />
                      <span className="text-white">For Photographers & Developers</span>
                      <br />
                      <span className="text-3xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                        {userTier === 'free' ? 'Free Forever' : getTierDisplayName(userTier)}
                      </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      Compress JPG, PNG, WEBP, AVIF, TIFF, and RAW files (CR2, NEF, ARW, DNG) 
                      without sacrificing quality. Used by thousands of creatives worldwide.
                    </p>
                  </>
                )}
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Plans & Pricing
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm"
                    onClick={() => window.location.href = '/subscribe?plan=test-premium'}
                  >
                    Try Now
                  </Button>
                </div>

{/* Feature Highlights - IMPROVED COPY */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
  {/* Benefit 1 */}
  <div className="flex items-center gap-3 justify-center lg:justify-start">
    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-500/30">
      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <div>
      <div className="text-gray-300 font-semibold text-sm">Free Operations</div>
      <div className="text-gray-500 text-xs">No Sign In, No credit card needed.</div>
    </div>
  </div>

  {/* Benefit 2 */}
  <div className="flex items-center gap-3 justify-center lg:justify-start">
    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-500/30">
      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      </svg>
    </div>
    <div>
      <div className="text-gray-300 font-semibold text-sm">RAW Camera Files</div>
      <div className="text-gray-500 text-xs">CR2, NEF, ARW, DNG, ORF, RAF</div>
    </div>
  </div>

  {/* Benefit 3 */}
  <div className="flex items-center gap-3 justify-center lg:justify-start">
    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-500/30">
      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div className="text-gray-300 font-semibold text-sm">No Watermarks Ever</div>
      <div className="text-gray-500 text-xs">Clean output. Your images, your way.</div>
    </div>
  </div>

  {/* Benefit 4 */}
  <div className="flex items-center gap-3 justify-center lg:justify-start">
    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-500/30">
      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <div className="text-gray-300 font-semibold text-sm">Batch Processing</div>
      <div className="text-gray-500 text-xs">Upload multiple files at once</div>
    </div>
  </div>
</div>
              </div>
            </div>

            {/* Right side - Upload Interface */}
            <div className="relative mt-8 lg:mt-0 upload-interface">
{/* Upload Card - ADD FIXED DIMENSIONS */}
<div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[500px] max-w-full">
  {/* Drag & Drop Zone with aspect-[4/3] */}
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
    onClick={handleFileInput}
  >
    <div className="space-y-4">
      {/* Upload Icon */}
      <div className="w-16 h-16 bg-teal-500/20 rounded-xl mx-auto flex items-center justify-center border border-teal-500/30">
        <Upload className="w-8 h-8 text-teal-400" />
      </div>
      
      {/* Text */}
      <div className="space-y-2">
        <p className="text-base font-medium text-white">
          Drop images here or click to upload
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {tierInfo ? (
            <>
              Each image up to {tierInfo.maxRawFileSize}MB for RAW & {tierInfo.maxFileSize}MB for Regular
              <br />
              (CR2, RAW, JPEG, PNG, WEBP, AVIF, SVG, TIFF | Max {tierInfo.maxBatchSize} files)
            </>
          ) : (
            'Loading tier information...'
          )}
        </p>
        <p className="text-xs text-gray-500">
          JPG, PNG, WEBP, AVIF, SVG, TIFF, RAW (CR2, ARW, DNG, NEF, ORF, RAF, RW2)
        </p>
      </div>

      {/* Format Selection Buttons */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-medium text-gray-300">Select output format:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                          {getAvailableFormats().map((format) => {
                            const isVisuallyDisabled = format === 'png' && isPngDisabled();
                            const isSelected = selectedFormats.includes(format);
                            
                            return (
                              <Button
                                key={format}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                disabled={isVisuallyDisabled || isProcessing}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isVisuallyDisabled && !isProcessing) {
                                    toggleFormat(format);
                                  }
                                }}
                                className={`h-8 sm:h-9 text-xs font-medium transition-all ${
                                  isSelected 
                                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/50" 
                                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600"
                                } ${
                                  isVisuallyDisabled ? "opacity-50 cursor-not-allowed bg-gray-800 text-gray-500" : ""
                                } ${
                                  isProcessing ? "cursor-not-allowed" : ""
                                }`}
                                title={
                                  isVisuallyDisabled 
                                    ? "This format is not available for the current selection" 
                                    : isProcessing 
                                    ? "Please wait for current processing to complete"
                                    : ""
                                }
                              >
                                {format.toUpperCase()}
                              </Button>
                            );
                          })}
        </div>
      </div>
    </div>

    {/* Hidden file input */}
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


  {/* Output Modal */}
      {showModal && (
        <div className="w-full max-w-6xl mx-auto mt-4 mb-8">
          <div className="w-full bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-900 p-4 rounded-t-2xl -m-6 mb-0">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-semibold text-white">
                    {isProcessing ? processingStatus : 'Your optimized images are ready!'}
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {processingProgress}%
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Social Sharing Buttons - Only show when compression is complete */}
                  {modalState === 'complete' && session.results.length > 0 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-white">Follow Us:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => shareApp('twitter')}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-600 bg-gray-700 hover:bg-blue-600 transition-colors"
                          title="Follow us on X"
                          data-testid="follow-x"
                        >
                          <svg width="14" height="14" fill="#ffffff" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => shareApp('linkedin')}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-600 bg-gray-700 hover:bg-blue-600 transition-colors"
                          title="Follow us on LinkedIn"
                          data-testid="follow-linkedin"
                        >
                          <svg width="14" height="14" fill="#0077B5" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => shareApp('reddit')}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-600 bg-gray-700 hover:bg-orange-600 transition-colors"
                          title="Follow us on Reddit"
                          data-testid="follow-reddit"
                        >
                          <svg width="14" height="14" fill="#FF4500" viewBox="0 0 24 24">
                            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => shareApp('youtube')}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-600 bg-gray-700 hover:bg-red-600 transition-colors"
                          title="Subscribe on YouTube"
                          data-testid="subscribe-youtube"
                        >
                          <svg width="14" height="14" fill="#FF0000" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Download and Cloud Save Buttons - Always show when results exist */}
                  {session.results.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Button 
                        className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                        onClick={downloadAllResults}
                        data-testid="button-download-all"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                      
                    </div>
                  )}
                </div>
              </div>

              {/* Ad Banner Strip */}
              <div className="w-full my-4 px-2">
                <div className="flex items-center justify-between min-h-[80px] bg-gradient-to-r from-blue-50 to-indigo-50 rounded border-2 border-blue-200 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-blue-900 mb-1">⚡ Process 1000s of Images in Minutes with Our API</p>
                      <p className="text-xs text-blue-700">Bulk compression • 90% cost reduction • Auto-format conversion • Enterprise-grade reliability</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs px-3 py-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => window.location.href = '/api-docs'}
                    >
                      View API Docs
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      Get API Key
                    </Button>
                  </div>
                </div>
              </div>

              {/* Professional Upgrade Plans - xxx-inspired design */}
              {(session.results.length >= 3 || showPricing) && (
                <div className="w-full my-6 px-2">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Want to compress larger files? Get <span className="font-bold">STARTER PLAN !</span></h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Test Premium Card - xxx Style */}
                    <div className="relative bg-white border-2 border-brand-teal rounded-xl overflow-hidden shadow-sm">
                      {/* Recommended Badge */}
                      <div className="bg-brand-teal text-white text-center py-2 text-xs font-semibold uppercase tracking-wide">
                        RECOMMENDED FOR YOU
                      </div>
                      
                      <div className="p-6">
                        {/* Header with Icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                              <Crown className="w-5 h-5 text-brand-teal" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">STARTER</h4>
                              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">COMPRESS & CONVERT</p>
                            </div>
                          </div>
                          <div className="w-10 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700"><span className="font-semibold">3000</span> Monthly Operations</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700"><span className="font-semibold">Upto 50 MB</span> file size for RAW & Regular</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700">Batch processing (max 20 files)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700">Priority processing (2x faster queue)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700">Basic API (1,000 calls/month)</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-3xl font-bold text-gray-900">$9</span>
                            <span className="text-sm text-gray-600 ml-1">Monthly or $79 Yearly (save $29 = 27% off)</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button 
                          className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-medium py-3 rounded-lg"
                          onClick={() => window.location.href = '/subscribe?plan=starter'}
                        >
                          Get STARTER
                        </Button>
                      </div>
                    </div>

                    {/* Premium Plan Card - xxx Style */}
                    <div className="relative bg-white border-2 border-brand-gold rounded-xl overflow-hidden shadow-sm">
                      {/* Gold Top Banner */}
                      <div className="bg-brand-gold text-white text-center py-4 text-xs font-semibold uppercase tracking-wide"></div>
                      
                      <div className="p-6">
                        {/* Header with Icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-gold/10 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-brand-gold" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 16L3 4l5.5 4L12 4l3.5 4L21 4l-2 12H5zm0 0h14v2H5v-2z"/>
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">PRO ⭐ (Most Popular)</h4>
                              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">COMPRESS & CONVERT</p>
                            </div>
                          </div>
                          <div className="w-10 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700"><span className="font-semibold">15000</span> Monthly Operations</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700"><span className="font-semibold">Upto 100 MB</span> file size for RAW & Regular</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700">Batch processing (max 200 files)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700">Team access (3 seats)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-brand-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-brand-teal" />
                            </div>
                            <span className="text-sm text-gray-700">API: 15,000 calls/month</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline justify-between mb-4">
                          <div>
                            <span className="text-3xl font-bold text-gray-900">$19</span>
                            <span className="text-sm text-gray-600 ml-1">Monthly or $149 Yearly (save $79 = 35% off)</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button 
                          className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white font-medium py-3 rounded-lg"
                          onClick={() => window.location.href = '/subscribe?plan=pro'}
                        >
                          Get PRO
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Section - Show immediately with thumbnails and progress */}
              {selectedFiles.length > 0 && (
                <div className="space-y-0">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {modalState === 'processing' && session.results.length === 0 ? (
                      // Show mixed state: processing files with spinner, others with results if available
                      selectedFiles.map((file) => {
                        const isThisFileProcessing = processingFileIds.has(file.id);
                        const fileResults = session.results.filter(result => result.originalName === file.name);
                        
                        return (
                          <div key={file.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center gap-4">
                              {/* Thumbnail and file info */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // If client-side preview fails (e.g., RAW files), try showing converted result as thumbnail
                                      const result = fileResults[0]; // Get first converted result for this file
                                      if (result && result.downloadUrl) {
                                        const target = e.currentTarget;
                                        target.src = result.downloadUrl;
                                        target.onerror = () => {
                                          // Final fallback to icon only if converted image also fails
                                          const parent = target.parentElement;
                                          if (parent) {
                                            parent.className = 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0';
                                            parent.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                          }
                                        };
                                      } else {
                                        // No converted result available yet, fallback to icon
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.className = 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0';
                                          parent.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                        }
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-brand-dark">
                                    {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {formatFileSize(file.size)} • {isThisFileProcessing ? 'Processing...' : fileResults.length > 0 ? `${fileResults.length} format${fileResults.length > 1 ? 's' : ''} ready` : 'Queued...'}
                                  </p>
                                  {/* Show progress bar only for initial processing (not format conversions) */}
                                  {isThisFileProcessing && session.results.length === 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="bg-brand-teal h-1 rounded-full transition-all duration-300 animate-pulse"
                                        style={{ width: `${processingProgress}%` }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Conditional right side indicator */}
                              <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
                                {isThisFileProcessing ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-gray-600">Processing...</span>
                                  </div>
                                ) : fileResults.length > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <span className="text-sm text-green-600">Ready</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <span className="text-sm text-gray-500">Queued</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        );
                      })
                    ) : (
                      // Show results after completion
                      groupResultsByOriginalName(session.results.slice(-20)).map((group) => (
                      <div key={group.originalName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Thumbnail and file info */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {(() => {
                                  // Find the original file to use for instant thumbnail
                                  const originalFile = selectedFiles.find(f => f.name === group.originalName);
                                  return originalFile ? (
                                    <img 
                                      src={fileObjectUrls.get(originalFile.name) || URL.createObjectURL(originalFile)} 
                                      alt={group.originalName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // If client-side preview fails (e.g., RAW files), try showing converted result as thumbnail
                                        const result = group.results[0]; // Get first converted result for this file
                                        if (result && result.downloadUrl) {
                                          const target = e.currentTarget;
                                          target.src = result.downloadUrl;
                                          target.onerror = () => {
                                            // Final fallback to icon only if converted image also fails
                                            const parent = target.parentElement;
                                            if (parent) {
                                              parent.className = 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0';
                                              parent.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                            }
                                          };
                                        } else {
                                          // No converted result available, fallback to icon
                                          const target = e.currentTarget;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent) {
                                            parent.className = 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0';
                                            parent.innerHTML = '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                          }
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-brand-dark">
                                  {group.originalName.length > 8 ? `${group.originalName.substring(0, 8)}...` : group.originalName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {formatFileSize(group.results[0].originalSize)} • {group.results.length} format{group.results.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            
                            {/* Format results inline - xxx style */}
                            <div className="flex items-center gap-3 flex-wrap flex-1 justify-end">
                              {group.results.map((result) => {
                                const formatInfo = getFormatInfo((result.outputFormat || 'unknown').toLowerCase());
                                return (
                                  <div key={result.id} className="flex items-center gap-2">
                                    {/* Compression percentage */}
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-gray-700">
                                        {result.compressedSize > result.originalSize ? '+' : '-'}{Math.abs(result.compressionRatio)}%
                                      </div>
                                      <div className="text-sm text-gray-500">{formatFileSize(result.compressedSize)}</div>
                                    </div>
                                    
                                    {/* Format icon/button */}
                                    <div 
                                      className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      style={{ backgroundColor: formatInfo.color }}
                                      onClick={() => window.open(result.downloadUrl, '_blank')}
                                    >
                                      <img 
                                        src={formatInfo.icon} 
                                        alt={result.outputFormat} 
                                        className="w-4 h-4 object-contain"
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
                      </div>
                    )))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </section>
  {/* Need a Specific Format? */}
<section className="py-10 bg-gray-900/30 border-y border-gray-800/50">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
        Need a Specific Format?
      </h2>
      <p className="text-sm text-gray-400 max-w-2xl mx-auto">
        We have dedicated pages for professional workflows and specialized conversions
      </p>
    </div>
    
    {/* Popular Conversions (Always Visible) */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto mb-6">
      {/* CR2 to JPG */}
      <a 
        href="/convert/cr2-to-jpg" 
        className="group p-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-teal-500/40 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">CR2→JPG</div>
            <div className="text-[10px] text-gray-600">Canon RAW</div>
          </div>
        </div>
      </a>

      {/* NEF to JPG */}
      <a 
        href="/convert/nef-to-jpg" 
        className="group p-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-teal-500/40 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">NEF→JPG</div>
            <div className="text-[10px] text-gray-600">Nikon RAW</div>
          </div>
        </div>
      </a>

      {/* PNG to JPG */}
      <a 
        href="/convert/png-to-jpg" 
        className="group p-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-teal-500/40 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">PNG→JPG</div>
            <div className="text-[10px] text-gray-600">Lossless</div>
          </div>
        </div>
      </a>

      {/* JPG to WEBP */}
      <a 
        href="/convert/jpg-to-webp" 
        className="group p-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-teal-500/40 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">JPG→WEBP</div>
            <div className="text-[10px] text-gray-600">Web Ready</div>
          </div>
        </div>
      </a>

      {/* JPG to AVIF */}
      <a 
        href="/convert/jpg-to-avif" 
        className="group p-4 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-teal-500/40 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-teal-500/10"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">JPG→AVIF</div>
            <div className="text-[10px] text-gray-600">Next-Gen</div>
          </div>
        </div>
      </a>
    </div>

    {/* Expand Button */}
    <div className="text-center mb-6">
      <button
        onClick={() => setShowAllFormats(!showAllFormats)}
        className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-teal-500/50 rounded-lg transition-all hover:shadow-lg hover:shadow-teal-500/10"
      >
        <span className="text-sm font-medium text-gray-300 group-hover:text-white">
          {showAllFormats ? 'Show Less' : 'Show All Formats'}
        </span>
        {showAllFormats ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-teal-400 transition-colors" />
        )}
        {!showAllFormats && (
          <span className="text-xs text-gray-500 ml-1">(80+ tools)</span>
        )}
      </button>
    </div>

    {/* Expandable Section - All Formats */}
    <div 
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        showAllFormats ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="space-y-8 pt-4">
        
        {/* RAW Camera Files */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <h3 className="text-sm font-semibold text-white">RAW Camera Files</h3>
            <span className="text-xs text-gray-500">(Professional Photography)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { name: 'CR2→JPG', sub: 'Canon', href: '/convert/cr2-to-jpg' },
              { name: 'NEF→JPG', sub: 'Nikon', href: '/convert/nef-to-jpg' },
              { name: 'ARW→JPG', sub: 'Sony', href: '/convert/arw-to-jpg' },
              { name: 'DNG→JPG', sub: 'Adobe', href: '/convert/dng-to-jpg' },
              { name: 'ORF→JPG', sub: 'Olympus', href: '/convert/orf-to-jpg' },
              { name: 'RAF→JPG', sub: 'Fujifilm', href: '/convert/raf-to-jpg' },
              { name: 'CRW→JPG', sub: 'Canon Old', href: '/convert/crw-to-jpg' },
              { name: 'RW2→JPG', sub: 'Panasonic', href: '/convert/rw2-to-jpg' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group p-3 bg-gray-800/30 hover:bg-gray-800 border border-gray-700/50 hover:border-red-500/40 rounded-lg transition-all text-center"
              >
                <div className="text-xs font-medium text-gray-400 group-hover:text-white mb-1">{item.name}</div>
                <div className="text-[10px] text-gray-600">{item.sub}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Web-Optimized Formats */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <h3 className="text-sm font-semibold text-white">Web-Optimized Formats</h3>
            <span className="text-xs text-gray-500">(Next-Gen Web)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { name: 'JPG→WEBP', sub: '30% smaller', href: '/convert/jpg-to-webp' },
              { name: 'PNG→WEBP', sub: '26% smaller', href: '/convert/png-to-webp' },
              { name: 'JPG→AVIF', sub: '50% smaller', href: '/convert/jpg-to-avif' },
              { name: 'PNG→AVIF', sub: '50% smaller', href: '/convert/png-to-avif' },
              { name: 'WEBP→JPG', sub: 'Universal', href: '/convert/webp-to-jpg' },
              { name: 'WEBP→PNG', sub: 'Lossless', href: '/convert/webp-to-png' },
              { name: 'AVIF→JPG', sub: 'Compatible', href: '/convert/avif-to-jpg' },
              { name: 'AVIF→PNG', sub: 'Quality', href: '/convert/avif-to-png' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group p-3 bg-gray-800/30 hover:bg-gray-800 border border-gray-700/50 hover:border-green-500/40 rounded-lg transition-all text-center"
              >
                <div className="text-xs font-medium text-gray-400 group-hover:text-white mb-1">{item.name}</div>
                <div className="text-[10px] text-gray-600">{item.sub}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Common Conversions */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 className="text-sm font-semibold text-white">Common Conversions</h3>
            <span className="text-xs text-gray-500">(Most Popular)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { name: 'PNG→JPG', sub: 'Reduce size', href: '/convert/png-to-jpg' },
              { name: 'JPG→PNG', sub: 'Transparency', href: '/convert/jpg-to-png' },
              { name: 'TIFF→JPG', sub: 'Web ready', href: '/convert/tiff-to-jpg' },
              { name: 'TIFF→PNG', sub: 'Maintain quality', href: '/convert/tiff-to-png' },
              { name: 'JPG→TIFF', sub: 'Print quality', href: '/convert/jpg-to-tiff' },
              { name: 'PNG→TIFF', sub: 'Archive', href: '/convert/png-to-tiff' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group p-3 bg-gray-800/30 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/40 rounded-lg transition-all text-center"
              >
                <div className="text-xs font-medium text-gray-400 group-hover:text-white mb-1">{item.name}</div>
                <div className="text-[10px] text-gray-600">{item.sub}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Compression Tools */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <h3 className="text-sm font-semibold text-white">Compression Tools</h3>
            <span className="text-xs text-gray-500">(Reduce File Size)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { name: 'Compress JPG', sub: 'Up to 90%', href: '/compress/jpg' },
              { name: 'Compress PNG', sub: 'Up to 80%', href: '/compress/png' },
              { name: 'Compress WEBP', sub: 'Up to 85%', href: '/compress/webp' },
              { name: 'Compress AVIF', sub: 'Up to 70%', href: '/compress/avif' },
              { name: 'Compress TIFF', sub: 'Up to 75%', href: '/compress/tiff' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group p-3 bg-gray-800/30 hover:bg-gray-800 border border-gray-700/50 hover:border-purple-500/40 rounded-lg transition-all text-center"
              >
                <div className="text-xs font-medium text-gray-400 group-hover:text-white mb-1">{item.name}</div>
                <div className="text-[10px] text-gray-600">{item.sub}</div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>

    {/* Footer text */}
    <p className="text-center mt-6 text-xs text-gray-600">
      {showAllFormats ? 'Showing all conversion tools' : '80+ conversion combinations available'}
    </p>
  </div>
</section>

  {/* Experience Premium Features Only $9 per month */}
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
                className="bg-gradient-to-r from-brand-gold to-amber-400 px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold shadow-lg rounded-lg"
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
                <span className="hidden sm:inline" style={{ color: '#AD0000 !important' }}>⭐ STARTER PLAN FOR JUST $9</span>
                <span className="inline sm:hidden" style={{ color: '#AD0000 !important' }}>⭐ STARTER $9</span>
              </div>
            </div>
            
            <div className="mt-8 sm:mt-6">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold font-poppins text-brand-dark mb-4 px-2">
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
                  <h3 className="font-semibold text-brand-dark mb-2">3000 operations</h3>
                  <p className="text-sm text-gray-600">Test bulk processing power</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Crown className="w-6 h-6 text-brand-gold" />
                  </div>
                  <h3 className="font-semibold text-brand-dark mb-2">20 Concurrent Uploads</h3>
                  <p className="text-sm text-gray-600">Advanced controls, no ads, API access</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold text-brand-dark mb-2">Access for 1 month</h3>
                  <p className="text-sm text-gray-600">No recurring charges</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/subscribe?plan=test-premium'}
                  className="bg-gradient-to-r from-brand-teal to-brand-teal-dark hover:from-brand-teal-dark hover:to-brand-teal text-[#AD0000] font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  data-testid="button-test-premium"
                >
                  🚀 Subscribe Today for $9
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-gray-500 max-w-xs">
                  💳 Secure payment via Paypal • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

  {/* Loyalty Program: Earn Free Operations */}
      <section className="py-16 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-poppins text-brand-dark mb-4">
              🎯 <span className="text-white">Loyalty Program:</span> <span className="text-brand-gold">Earn Free Operations</span>
            </h2>
            <p className="text-lg text-gray-600 font-opensans max-w-2xl mx-auto">
              Share your MicroJPEG success stories and earn bonus operations! Help us grow and get rewarded.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* How it Works */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 font-poppins">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-brand-dark">Compress Your Images</h4>
                    <p className="text-gray-600 text-sm">Use MicroJPEG to compress your images and see amazing results</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-teal rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-brand-dark">Share Your Success</h4>
                    <p className="text-gray-600 text-sm">Post about your compression results or feature highlights on social media</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-brand-dark">Earn Bonus Operations</h4>
                    <p className="text-gray-600 text-sm">Get free operations added to your account automatically</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Structure */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-brand-dark mb-6 font-poppins">Earn Rewards</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">X (Twitter) Post</span>
                  <span className="font-bold text-brand-teal">+10 Operations</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">LinkedIn Post</span>
                  <span className="font-bold text-brand-teal">+15 Operations</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Facebook Post</span>
                  <span className="font-bold text-brand-teal">+10 Operations</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Instagram Story/Post</span>
                  <span className="font-bold text-brand-teal">+12 Operations</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Pinterest Pin</span>
                  <span className="font-bold text-brand-teal">+8 Operations</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Reddit Post</span>
                  <span className="font-bold text-brand-teal">+15 Operations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Now & Earn Instantly */}
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h3 className="text-2xl font-bold text-brand-dark mb-4 font-poppins">Share Now & Earn Instantly</h3>
            <p className="text-gray-600 mb-6">Click any platform below to share and earn bonus operations!</p>
            
            <div className="flex justify-center items-center gap-3 flex-wrap max-w-2xl mx-auto">
              <button
                onClick={() => shareLoyaltyContent('twitter')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                data-testid="loyalty-share-twitter"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Twitter</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+10</span>
              </button>
              
              <button
                onClick={() => shareLoyaltyContent('linkedin')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                data-testid="loyalty-share-linkedin"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+15</span>
              </button>
              
              <button
                onClick={() => shareLoyaltyContent('facebook')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                data-testid="loyalty-share-facebook"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+10</span>
              </button>
              
              <button
                onClick={() => shareLoyaltyContent('instagram')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                data-testid="loyalty-share-instagram"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12</span>
              </button>
              
              <button
                onClick={() => shareLoyaltyContent('pinterest')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                data-testid="loyalty-share-pinterest"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017.001z"/>
                </svg>
                <span>Pinterest</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+8</span>
              </button>
              
              <button
                onClick={() => shareLoyaltyContent('reddit')}
                className="inline-flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                data-testid="loyalty-share-reddit"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                <span>Reddit</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+15</span>
              </button>
            </div>

            {/* URL Verification Form */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">🔗 Optional: Submit Post URL for Verification</h4>
              <p className="text-xs text-blue-600 mb-3">Increase your credibility by providing a link to your actual post</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const url = formData.get('postUrl') as string;
                if (url) {
                  toast({
                    title: "URL Submitted!",
                    description: "Thanks for providing verification. Your post will be reviewed.",
                  });
                  (e.target as HTMLFormElement).reset();
                }
              }} className="flex gap-2">
                <input
                  type="url"
                  name="postUrl"
                  placeholder="https://twitter.com/yourpost or https://linkedin.com/post/..."
                  className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>

            {/* Community Guidelines & Reporting */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    💡 <strong>Pro tip:</strong> Tag @MicroJPEG and use #MicroJPEGCompress for faster verification!
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Community Guidelines:</strong> Please share authentic posts about your experience. 
                    One reward per platform per day. <a href="mailto:report@microjpeg.com" className="text-blue-600 hover:underline">Report fake shares</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  {/* Premium Features & API Access */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-poppins text-brand-dark mb-4">
              <span className="text-brand-teal">Premium Features</span> <span className="text-white">&</span> <span className="text-brand-gold">API Access</span>
            </h2>
            <p className="text-lg text-gray-600 font-opensans max-w-2xl mx-auto">
              Upgrade to Premium first for the best experience, or integrate our service directly into your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Developer API */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Developer API</h3>
              <p className="text-gray-600 text-sm mb-4">Direct API access with authentication for custom applications</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/api-docs'}
              >
                View API Docs
              </Button>
            </Card>

            {/* WordPress Plugin */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <SiWordpress className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">WordPress Plugin</h3>
              <p className="text-gray-600 text-sm mb-4">Automatic compression for your WordPress website</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/micro-jpeg-api-wordpress-plugin.zip'}
              >
                Download Plugin
              </Button>
            </Card>

            {/* Browser Extension */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9V3"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Browser Extension</h3>
              <p className="text-gray-600 text-sm mb-4">Right-click any image to compress instantly</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = '#'}
                  disabled
                >
                  Coming Soon
                </Button>
                <p className="text-xs text-gray-500">Chrome & Firefox</p>
              </div>
            </Card>

            {/* Desktop App */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Desktop App</h3>
              <p className="text-gray-600 text-sm mb-4">Drag & drop application for bulk processing</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = '#'}
                  disabled
                >
                  Coming Soon
                </Button>
                <p className="text-xs text-gray-500">Windows, Mac, Linux</p>
              </div>
            </Card>
          </div>

          {/* API Benefits */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-brand-dark mb-6">Why Choose Our API?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-brand-teal" />
                  </div>
                  <h4 className="font-semibold text-brand-dark mb-2">Lightning Fast</h4>
                  <p className="text-sm text-gray-600">Process images in seconds with our optimized servers</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-brand-teal" />
                  </div>
                  <h4 className="font-semibold text-brand-dark mb-2">Secure & Reliable</h4>
                  <p className="text-sm text-gray-600">Your images are processed securely and never stored</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-teal/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-brand-teal" />
                  </div>
                  <h4 className="font-semibold text-brand-dark mb-2">Highly Customizable</h4>
                  <p className="text-sm text-gray-600">Fine-tune compression settings for your specific needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  {/* OUR PRODUCTS - Optimization for each project */}
      <OurProducts />

  {/* Ready to 10x Your Image Processing? */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
          </div>
          
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-bold font-poppins mb-4">
              Ready to 10x Your Image Processing?
            </h2>
            <p className="text-xl mb-8 opacity-90 text-black">
              Join hundreds of users saving hours weekly with professional compression
            </p>
            
            {/* Risk Reversal */}
            <div className="flex justify-center items-center gap-8 text-sm opacity-90 text-black">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Setup in under 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>No long-term contracts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exit Intent Pop-up Trigger Section */}
      <div id="exit-intent-trigger" className="hidden"></div>

  {/* Frequently Asked Questions */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-lg">Everything you need to know about Micro JPEG</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Categories Sidebar */}
            <div className="lg:w-1/3">
              <div className="space-y-2">
                {Object.keys(FAQ_DATA).map((category) => (
                  <button
                    key={category}
                    onClick={() => switchCategory(category)}
                    className={`w-full text-left px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
                      activeCategory === category
                        ? 'bg-teal-500 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    data-testid={`faq-category-${category.toLowerCase()}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:w-2/3">
              <div className="bg-gray-800 rounded-lg">
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-teal-400">{activeCategory}</h3>
                  <div className="space-y-4">
                    {FAQ_DATA[activeCategory as keyof typeof FAQ_DATA]?.map((faq, index) => (
                      <div key={index} className="border-b border-gray-700 last:border-b-0">
                        <button
                          onClick={() => toggleQuestion(index)}
                          className="w-full text-left py-4 pr-8 flex items-center justify-between hover:text-teal-400 transition-colors"
                          data-testid={`faq-question-${index}`}
                        >
                          <span className="font-medium text-gray-200">{faq.question}</span>
                          {expandedQuestions.has(index) ? (
                            <Minus className="w-5 h-5 text-teal-400 flex-shrink-0" />
                          ) : (
                            <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedQuestions.has(index) && (
                          <div className="pb-4">
                            <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Sign In Dialog */}
      <AlertDialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-between items-start">
              <AlertDialogTitle>🔐 Sign In Required</AlertDialogTitle>
              <button 
                onClick={() => setShowSignInDialog(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                data-testid="button-close-signin-dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AlertDialogDescription>
              To claim your exclusive offer of 100 additional operations FREE, 
              please sign in to your account first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉 Bonus Operations Claimed!</AlertDialogTitle>
            <AlertDialogDescription>
              Congratulations! Your bonus operations have been credited to your account.
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Bonus Operations:</span>
                  <span className="font-bold text-green-600">+100 monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>Your New Monthly Limit:</span>
                  <span className="font-bold text-green-600">600 operations</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Limit:</span>
                  <span className="text-gray-500">500 operations</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Your increased monthly limit is now active and will appear in your counter!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Awesome!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      </div>
    </>
  );
}