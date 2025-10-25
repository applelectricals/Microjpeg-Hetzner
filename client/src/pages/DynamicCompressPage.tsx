/**
 * DYNAMIC COMPRESS PAGE - Tier-Aware Paid User Page
 * 
 * This unified page serves all paid tiers (Starter, Pro, Business)
 * - Dynamically loads user's tier limits from database
 * - Matches micro-jpeg-landing.tsx design and layout
 * - Shows tier-specific features and limits
 * - Requires authentication (redirects anonymous users)
 * - Real-time usage tracking with visual feedback
 * 
 * Page Identifier: paid-user-compress
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Settings, Download, Zap, Shield, Sparkles, X, Check, 
  ArrowRight, ImageIcon, ChevronDown, ChevronUp, Crown, Plus, 
  Minus, AlertCircle, TrendingUp, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTierLimits } from '@/hooks/useTierLimits';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/header';
import TierBadge from '@/components/TierBadge';
import UsageStats from '@/components/UsageStats';
import logoUrl from '@assets/mascot-logo-optimized.png';
import avifIcon from '@/assets/format-icons/avif.jpg';
import jpegIcon from '@/assets/format-icons/jpeg.jpg';
import pngIcon from '@/assets/format-icons/png.jpg';
import webpIcon from '@/assets/format-icons/webp.jpg';

// ✅ PAGE IDENTIFIER
const PAGE_IDENTIFIER = 'paid-user-compress'; // For paid/authenticated users only

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

// RAW file extensions
const RAW_EXTENSIONS = ['cr2', 'cr3', 'arw', 'crw', 'dng', 'nef', 'orf', 'raf', 'rw2', 'pef', 'srw'];

const isRawFile = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return RAW_EXTENSIONS.includes(ext);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

const DynamicCompressPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { tierLimits, usage, isLoading: tierLoading, error: tierError, refetch } = useTierLimits();

  // State
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp' | 'avif'>('jpeg');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [preserveMetadata, setPreserveMetadata] = useState(false);
  const [batchDownloadUrl, setBatchDownloadUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Redirect anonymous users to landing page with message
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/?redirect=compress&message=signin_required');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Refetch usage data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  // Loading state
  if (authLoading || tierLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tierError || !tierLimits || !usage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Workspace</h2>
            <p className="text-gray-600 mb-4">
              {tierError || 'Failed to load your tier information. Please try again.'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get max file size based on file type
  const getMaxFileSize = (filename: string): number => {
    const isRaw = isRawFile(filename);
    const limitMB = isRaw ? tierLimits.max_file_size_raw : tierLimits.max_file_size_regular;
    return limitMB * 1024 * 1024;
  };

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = getMaxFileSize(file.name);
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds ${formatFileSize(maxSize)} limit for your ${tierLimits.tier_display_name} plan`
      };
    }

    // Check if user has remaining operations
    if (usage.operations_used >= usage.operations_limit) {
      return {
        valid: false,
        error: 'You have reached your monthly operation limit. Please upgrade your plan or wait for the next billing cycle.'
      };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    // Check batch size limit
    if (files.length + selectedFiles.length > tierLimits.max_batch_size) {
      toast({
        title: "Batch size limit exceeded",
        description: `Your ${tierLimits.tier_display_name} plan allows up to ${tierLimits.max_batch_size} files per batch. You can upload ${tierLimits.max_batch_size - files.length} more files.`,
        variant: "destructive",
      });
      return;
    }

    Array.from(selectedFiles).forEach((file) => {
      const validation = validateFile(file);
      
      if (validation.valid) {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          preview: URL.createObjectURL(file)
        });
        newFiles.push(fileWithPreview);
      } else {
        errors.push(validation.error || 'File validation failed');
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Some files were not added",
        description: errors[0],
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files added",
        description: `${newFiles.length} file(s) ready to compress`,
      });
    }
  }, [files, tierLimits, usage, toast]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  // Remove file
  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Clear all files
  const handleClearAll = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setResults([]);
    setBatchDownloadUrl(null);
  }, [files]);

  // Compress files
  const handleCompress = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to compress",
        variant: "destructive",
      });
      return;
    }

    // Check remaining operations
    const remainingOps = usage.operations_limit - usage.operations_used;
    if (files.length > remainingOps) {
      toast({
        title: "Insufficient operations",
        description: `You have ${remainingOps} operations remaining. Remove ${files.length - remainingOps} files or upgrade your plan.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files', file);
      });
      
      formData.append('quality', compressionQuality.toString());
      formData.append('outputFormat', outputFormat);
      formData.append('preserveMetadata', preserveMetadata.toString());
      formData.append('pageIdentifier', PAGE_IDENTIFIER);

      const response = await apiRequest<{
        success: boolean;
        results: CompressionResult[];
        batchDownloadUrl?: string;
      }>('/api/compress/batch', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      if (response.success && response.results) {
        setResults(response.results);
        setBatchDownloadUrl(response.batchDownloadUrl || null);
        
        // Refetch usage data after successful compression
        refetch();

        toast({
          title: "Compression complete!",
          description: `Successfully compressed ${response.results.length} file(s)`,
        });

        // Calculate average compression
        const avgRatio = response.results.reduce((sum, r) => sum + r.compressionRatio, 0) / response.results.length;
        
        toast({
          title: `Average ${avgRatio.toFixed(1)}% compression achieved`,
          description: "Files are ready to download",
        });
      }
    } catch (error: any) {
      console.error('Compression error:', error);
      toast({
        title: "Compression failed",
        description: error.message || "An error occurred during compression",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [files, compressionQuality, outputFormat, preserveMetadata, usage, toast, refetch]);

  // Download single file
  const handleDownload = useCallback((result: CompressionResult) => {
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Download all as ZIP
  const handleDownloadAll = useCallback(() => {
    if (!batchDownloadUrl) return;

    const link = document.createElement('a');
    link.href = batchDownloadUrl;
    link.download = 'compressed-images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloading all files",
      description: "Your compressed images are being downloaded as a ZIP file",
    });
  }, [batchDownloadUrl, toast]);

  // Format icons mapping
  const formatIcons = {
    jpeg: jpegIcon,
    png: pngIcon,
    webp: webpIcon,
    avif: avifIcon,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoUrl} alt="Micro JPEG" className="h-16 w-16" />
            <TierBadge 
              tier={tierLimits.tier_name}
              displayName={tierLimits.tier_display_name}
              size="lg"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Professional Image Compression
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compress images with advanced settings and priority processing
          </p>
        </div>

        {/* Usage Stats */}
        <UsageStats
          operationsUsed={usage.operations_used}
          operationsLimit={usage.operations_limit}
          apiCallsUsed={usage.api_calls_used}
          apiCallsLimit={usage.api_calls_limit}
          periodEnd={usage.period_end}
          tierName={tierLimits.tier_display_name}
        />

        {/* Tier Features Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Your {tierLimits.tier_display_name} Benefits</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{tierLimits.max_file_size_regular}MB files</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{tierLimits.max_batch_size} files/batch</span>
                </div>
                {tierLimits.priority_processing && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Priority processing</span>
                  </div>
                )}
                {tierLimits.has_analytics && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                )}
              </div>
            </div>
            {tierLimits.tier_name !== 'business' && (
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Upgrade Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Compression Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload Zone */}
            <Card className="p-8">
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.cr2,.cr3,.arw,.dng,.nef,.orf,.raf,.rw2"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your images here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse files
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span>Up to {tierLimits.max_file_size_regular}MB per file</span>
                  <span>•</span>
                  <span>RAW files up to {tierLimits.max_file_size_raw}MB</span>
                  <span>•</span>
                  <span>Max {tierLimits.max_batch_size} files</span>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {files.length} file{files.length !== 1 ? 's' : ''} selected
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear all
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {file.preview && (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)}
                              {isRawFile(file.name) && (
                                <Badge variant="secondary" className="ml-2">RAW</Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Settings Panel */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Compression Settings
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Advanced
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show Advanced
                    </>
                  )}
                </Button>
              </div>

              {/* Quality Slider */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">
                      Compression Quality
                    </label>
                    <span className="text-sm font-semibold text-blue-600">
                      {compressionQuality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={compressionQuality}
                    onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <label className="font-medium text-gray-700 block mb-2">
                    Output Format
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['jpeg', 'png', 'webp', 'avif'] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setOutputFormat(format)}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${outputFormat === format
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                          }
                        `}
                      >
                        <img
                          src={formatIcons[format]}
                          alt={format.toUpperCase()}
                          className="w-8 h-8 mx-auto mb-1"
                        />
                        <span className="text-xs font-medium text-gray-700 uppercase">
                          {format}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Settings */}
                {showAdvancedSettings && (
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">
                          Preserve Metadata
                        </label>
                        <p className="text-xs text-gray-500">
                          Keep EXIF, GPS, and other metadata
                        </p>
                      </div>
                      <Switch
                        checked={preserveMetadata}
                        onCheckedChange={setPreserveMetadata}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Compress Button */}
              <Button
                onClick={handleCompress}
                disabled={files.length === 0 || isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Compress {files.length} {files.length === 1 ? 'Image' : 'Images'}
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={uploadProgress} className="mt-3" />
              )}
            </Card>
          </div>

          {/* Right Column - Results & Info */}
          <div className="space-y-6">
            
            {/* Results Card */}
            {results.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Compressed Files
                  </h3>
                  {batchDownloadUrl && (
                    <Button
                      onClick={handleDownloadAll}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download All
                    </Button>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {result.originalName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <span>{formatFileSize(result.originalSize)}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-semibold text-green-600">
                              {formatFileSize(result.compressedSize)}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownload(result)}
                          size="sm"
                          variant="ghost"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            style={{ width: `${result.compressionRatio}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {result.compressionRatio.toFixed(1)}%
                        </span>
                      </div>

                      {result.wasConverted && (
                        <Badge variant="secondary" className="mt-2">
                          Converted to {result.outputFormat.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Files processed</span>
                  <span className="font-semibold text-gray-900">
                    {results.length}
                  </span>
                </div>
                {results.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. compression</span>
                      <span className="font-semibold text-green-600">
                        {(results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Space saved</span>
                      <span className="font-semibold text-green-600">
                        {formatFileSize(
                          results.reduce((sum, r) => sum + (r.originalSize - r.compressedSize), 0)
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Security Badge */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    100% Secure
                  </h4>
                  <p className="text-sm text-gray-600">
                    Your images are automatically deleted within 24 hours. 
                    We use enterprise-grade encryption and never share your data.
                  </p>
                </div>
              </div>
            </Card>

            {/* Priority Processing Badge (if applicable) */}
            {tierLimits.priority_processing && (
              <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Priority Processing Active
                    </h4>
                    <p className="text-sm text-gray-600">
                      Your files are processed faster with dedicated resources.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Need help? Contact support at{' '}
            <a href="mailto:support@micro-jpeg.com" className="text-blue-600 hover:underline">
              support@micro-jpeg.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicCompressPage;
