import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Shield, Globe, Star, FileImage, Download, Upload, Camera, Image, Layers, Gauge, Settings, BarChart, Package } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';

export default function Tools() {
  const [activeTab, setActiveTab] = useState('tools');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
  {/* Glow Effects */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <SEOHead
        title="Professional Image Tools - Micro JPEG"
        description="Comprehensive suite of professional image tools for compression, conversion, batch processing, and optimization. Advanced features for photographers, designers, and businesses."
        canonicalUrl="https://microjpeg.com/tools"
        keywords="image tools, professional image processing, image optimization suite, batch processing tools, image converter"
      />
      <Header />



      {/* Sub Navigation */}
      <div className="bg-gray-800/90 backdrop-blur-xl border-b border-teal-500/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'tools', label: 'Tools', icon: Settings },
              { id: 'compress', label: 'Compress', icon: Zap },
              { id: 'convert', label: 'Convert', icon: ArrowRight },
              { id: 'optimizer', label: 'Optimizer', icon: BarChart }
            ].map(({ id, label, icon: Icon }) => (
              <Link 
                key={id} 
                href={id === 'tools' ? '/tools' : `/tools/${id}`}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 text-sm font-medium transition-colors ${
  id === 'tools'
    ? 'border-teal-400 text-teal-400'
    : 'border-transparent text-gray-400 hover:text-white hover:border-teal-500/50'
}`}
                data-testid={`nav-${id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="space-y-12">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-6">
              Professional Image Tools
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
              Comprehensive suite of professional image processing tools. Compress, convert, optimize, and process your images 
              with advanced algorithms and support for upto 200MB RAW (ARW, CR2, CRW, DNG, NEF, ORF, RAF) & Regular (JPG, PNG, WEBP, AVIF, TIFF, SVG) formats.
              Only App in the Internet with 13+ Formats, offering Web, API, CDN, Wordpress & Integrations for All Imaging Needs.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all px-8 py-4 text-lg"
                onClick={() => window.location.href = '/'}
                data-testid="button-start-processing"
              >
                Start Processing Now
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400/10 backdrop-blur-sm px-8 py-4 text-lg"
                onClick={() => window.location.href = '/checkout?plan=starter'}
                data-testid="button-explore-tools"
              >
                Unlimited Use 9$
              </Button>
            </div>
          </div>

          {/* Tools Overview */}
          <div id="tools-overview" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <Link href="/tools/compress" className="block">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Compress</h3>
                <p className="text-gray-300 text-sm mb-4">
                  AI-powered compression achieving up to 80% size reduction while preserving stunning visual quality
                </p>
                <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">13+ Formats</Badge>
              </Link>
            </Card>
            
            <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <Link href="/tools/convert" className="block">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Format Convert</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Transform between formats including RAW files to modern web formats like WebP and AVIF
                </p>
                <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">Raw Support</Badge>
              </Link>
            </Card>
            
            <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <Link href="/tools/batch" className="block">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Batch Process</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Process multiple images simultaneously with intelligent queue management and bulk operations
                </p>
                <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">Bulk Operations</Badge>
              </Link>
            </Card>

            <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <Link href="/tools/optimizer" className="block">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <BarChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Image Optimizer</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Advanced optimization with performance analysis, size metrics, and quality comparisons
                </p>
                <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">Analytics</Badge>
              </Link>
            </Card>
          </div>

          {/* Format Support Showcase */}
          <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">13+ Supported Formats</CardTitle>
              <p className="text-gray-300">Professional support for all major image formats across all tools</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Standard & Web Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['JPEG', 'PNG', 'WebP', 'AVIF', 'SVG', 'TIFF'].map(format => (
                    <Badge key={format} variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">{format}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Professional RAW Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['CR2', 'ARW', 'DNG', 'NEF', 'ORF', 'RAF', 'RW2'].map(format => (
                    <Badge key={format} variant="outline" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">{format}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Professional Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Gauge className="w-10 h-10 text-teal-400 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">AI-Powered Processing</h3>
                <p className="text-gray-300 text-sm">Advanced algorithms analyze and optimize each image for perfect quality-to-size ratio</p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Globe className="w-10 h-10 text-teal-400 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Universal Compatibility</h3>
                <p className="text-gray-300 text-sm">Support for 13+ formats including professional camera RAW files from all major brands</p>
              </Card>

              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Zap className="w-10 h-10 text-teal-400 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Lightning Performance</h3>
                <p className="text-gray-300 text-sm">Cloud-optimized processing pipeline delivers results in seconds, not minutes</p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Shield className="w-10 h-10 text-teal-400 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Quality Preservation</h3>
                <p className="text-gray-300 text-sm">Maintain stunning visual fidelity while achieving maximum file size reduction</p>
              </Card>
            </div>
          </div>

          {/* Quick Start Guide */}
          <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">How to Get Started</CardTitle>
              <p className="text-gray-300">Professional image processing in just 3 simple steps</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-white" />
            </div>
                  <h3 className="font-bold text-white mb-3 text-xl">1. Choose Your Tool</h3>
                  <p className="text-gray-300">Select from compression, conversion, batch processing, or optimization tools based on your needs</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Settings className="w-10 h-10 text-white" />
            </div>
                  <h3 className="font-bold text-white mb-3 text-xl">2. Upload & Configure</h3>
                  <p className="text-gray-300">Upload your images and adjust quality, format, and optimization settings with advanced controls</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Download className="w-10 h-10 text-white" />
            </div>
                  <h3 className="font-bold text-white mb-3 text-xl">3. Download Results</h3>
                  <p className="text-gray-300">Get your processed images individually or as batch ZIP downloads, ready for immediate use</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Use Cases */}
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Perfect for Every Use Case
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Camera className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Photographers</h3>
                <p className="text-gray-300 text-sm">Process RAW files, batch convert portfolios, and optimize images for web galleries and client delivery</p>
              </Card>
              
              <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Globe className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Web Developers</h3>
                <p className="text-gray-300 text-sm">Optimize images for faster loading, convert to modern web formats, and improve Core Web Vitals</p>
              </Card>

              <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <FileImage className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Content Creators</h3>
                <p className="text-gray-300 text-sm">Reduce file sizes for social media, batch process content, and maintain quality across platforms</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}