/**
 * DYNAMIC COMPRESS PAGE - Paid Users Only
 * 
 * Simple tier-based compression page with dark mode
 * - 6 tiers: Starter-M, Starter-Y, Pro-M, Pro-Y, Business-M, Business-Y
 * - Auto-converts to JPEG on upload
 * - Format buttons trigger instant conversion
 * - Inline results display
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/header';
import logoUrl from '@assets/mascot-logo-optimized.png';

// Format icons
import avifIcon from '@/assets/format-icons/avif.jpg';
import jpegIcon from '@/assets/format-icons/jpeg.jpg';
import pngIcon from '@/assets/format-icons/png.jpg';
import webpIcon from '@/assets/format-icons/webp.jpg';
import tiffIcon from '@/assets/format-icons/tiff.jpg';

const FORMATS = [
  { id: 'jpeg', name: 'JPEG', icon: jpegIcon },
  { id: 'png', name: 'PNG', icon: pngIcon },
  { id: 'webp', name: 'WEBP', icon: webpIcon },
  { id: 'avif', name: 'AVIF', icon: avifIcon },
  { id: 'tiff', name: 'TIFF', icon: tiffIcon },
];

interface ProcessedFile {
  id: string;
  originalName: string;
  format: string;
  url: string;
  size: number;
  originalSize: number;
  savings: number;
}

export default function DynamicCompressPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Auto-process to JPEG on upload
  const processToJPEG = async (uploadedFiles: File[]) => {
    setProcessing(true);
    
    for (const file of uploadedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', 'jpeg');
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
        const originalSize = file.size;
        const compressedSize = blob.size;
        const savings = ((originalSize - compressedSize) / originalSize) * 100;

        const processed: ProcessedFile = {
          id: `${Date.now()}-${Math.random()}`,
          originalName: file.name,
          format: 'JPEG',
          url,
          size: compressedSize,
          originalSize,
          savings,
        };

        setProcessedFiles(prev => [...prev, processed]);
      } catch (error) {
        toast({
          title: "Compression failed",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setProcessing(false);
  };

  // Convert to specific format
  const convertToFormat = async (file: File, format: string) => {
    setProcessing(true);
    
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

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const processed: ProcessedFile = {
        id: `${Date.now()}-${Math.random()}`,
        originalName: file.name,
        format: format.toUpperCase(),
        url,
        size: blob.size,
        originalSize: file.size,
        savings: ((file.size - blob.size) / file.size) * 100,
      };

      setProcessedFiles(prev => [...prev, processed]);
      
      toast({
        title: "Conversion complete",
        description: `Converted to ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: `Failed to convert to ${format.toUpperCase()}`,
        variant: "destructive",
      });
    }
    
    setProcessing(false);
  };

  // Handle file selection
  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const fileArray = Array.from(selectedFiles);
    setFiles(fileArray);
    
    // Auto-process to JPEG
    processToJPEG(fileArray);
  }, []);

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

  const downloadFile = (file: ProcessedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = `${file.originalName.split('.')[0]}-${file.format.toLowerCase()}.${file.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeProcessed = (id: string) => {
    setProcessedFiles(prev => prev.filter(f => f.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to access the compression tool.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={logoUrl} alt="Micro JPEG" className="h-16 w-16" />
            <div className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-semibold">
              {user?.tier || 'Pro'} Plan
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Professional Image Processing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload images and convert to any format instantly
          </p>
        </div>

        {/* Upload Area */}
        <div className="max-w-4xl mx-auto mb-12">
          <div
            ref={dropZoneRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center
              transition-all duration-300 cursor-pointer
              ${dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-semibold mb-2 text-white">
              Drop images here or click to upload
            </h3>
            <p className="text-gray-400 mb-6">
              Auto-converts to JPEG • Supports PNG, WEBP, AVIF, TIFF
            </p>

            {/* Format Buttons */}
            {files.length > 0 && !processing && (
              <div className="flex justify-center gap-3 mt-6">
                {FORMATS.map(format => (
                  <button
                    key={format.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      files.forEach(file => convertToFormat(file, format.id));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <img src={format.icon} alt={format.name} className="w-6 h-6 rounded" />
                    <span className="text-sm font-medium">{format.name}</span>
                  </button>
                ))}
              </div>
            )}

            {processing && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {processedFiles.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Processed Files</h2>
            <div className="grid gap-4">
              {processedFiles.map(file => (
                <div
                  key={file.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{file.originalName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {file.format}
                      </span>
                      <span>{formatFileSize(file.originalSize)} → {formatFileSize(file.size)}</span>
                      <span className="text-green-400">
                        {file.savings > 0 ? `-${file.savings.toFixed(1)}%` : 'Converted'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => downloadFile(file)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => removeProcessed(file.id)}
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
