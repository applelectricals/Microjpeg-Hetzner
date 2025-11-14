import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Upload, Zap, FileImage, Download, Globe, Star, Gauge, Camera, Layers, Shield, Settings, BarChart, Package } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import logoUrl from '@assets/mascot-logo-optimized.png';


export default function ToolsCompress() {
  const [activeTab, setActiveTab] = useState('compress');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
  {/* Glow Effects */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <SEOHead
        title="Image Compression Tools - Professional Compression | Micro JPEG"
        description="Professional image compression tools for photographers and businesses. Reduce file sizes up to 90% while maintaining quality. JPEG, PNG, WebP optimization tools."
        canonicalUrl="https://microjpeg.com/tools/compress"
        keywords="image compression tools, professional image compression, JPEG optimizer, PNG compressor, image file size reducer"
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
  id === 'compress'
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
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-6">
              Advanced Image Compression
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
              Achieve up to 80% size reduction with our AI-powered compression algorithms. Support for 13+ formats including 
              professional RAW files, with intelligent quality preservation and real-time preview capabilities.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all px-8 py-4 text-lg"
                onClick={() => window.location.href = '/'}
                data-testid="button-start-compressing"
              >
                Start Compressing Now
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

          {/* Format Support Showcase */}
          <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" id="demo">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Supported Formats</CardTitle>
              <p className="text-gray-300">Professional compression for all major image formats</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Web & Standard Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['JPEG', 'PNG', 'WebP', 'AVIF', 'SVG', 'TIFF'].map(format => (
                    <Badge key={format} variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">{format}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Professional RAW Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['CR2 (Canon)', 'ARW (Sony)', 'DNG (Adobe)', 'NEF (Nikon)', 'ORF (Olympus)', 'RAF (Fujifilm)', 'RW2 (Panasonic)'].map(format => (
                    <Badge key={format} variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30">{format}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compression Demo */}
          <div className="max-w-5xl mx-auto">
            <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Compression Performance</CardTitle>
                <p className="text-gray-300">See how our advanced algorithms achieve stunning results</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileImage className="w-14 h-14 text-red-600" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">Original Image</h3>
                    <p className="text-3xl font-bold text-red-600">2.5 MB</p>
                    <p className="text-gray-300">High quality JPEG</p>
                  </div>
                  
                  <div className="text-center">
<div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
                    <p className="font-semibold text-white">AI-Powered</p>
                    <p className="text-sm text-gray-300">Smart compression</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileImage className="w-14 h-14 text-green-600" />
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">Optimized Image</h3>
                    <p className="text-3xl font-bold text-green-600">500 KB</p>
                    <p className="text-gray-300">80% smaller</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compression Features */}
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Advanced Compression Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Gauge className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-bold text-white mb-3">Adjustable Quality</h3>
                <p className="text-gray-300 text-sm">
                  Precise control from 1-100% to perfectly balance file size and visual quality
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileImage className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-white mb-3">13+ Formats</h3>
                <p className="text-gray-300 text-sm">
                  Professional support including RAW files with format-specific optimizations
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-bold text-white mb-3">Batch Processing</h3>
                <p className="text-gray-300 text-sm">
                  Process multiple images simultaneously with intelligent queue management
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-white mb-3">Lightning Speed</h3>
                <p className="text-gray-300 text-sm">
                  Get compressed images in seconds with our cloud-optimized processing pipeline
                </p>
              </Card>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Why Compress Your Images?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Gauge className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Faster Load Times</h3>
                <p className="text-gray-300 text-sm">Dramatically improve website speed and user experience with optimized file sizes</p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Download className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Reduced Bandwidth</h3>
                <p className="text-gray-300 text-sm">Save hosting costs and improve accessibility for users on limited data plans</p>
              </Card>

              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Zap className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Better SEO</h3>
                <p className="text-gray-300 text-sm">Search engines favor fast-loading sites, boosting your search rankings</p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Shield className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Quality Preservation</h3>
                <p className="text-gray-300 text-sm">Maintain stunning visual quality while achieving maximum file size reduction</p>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">How Our Compression Works</CardTitle>
              <p className="text-gray-300">Advanced AI-powered optimization process</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-white" />
            </div>
                  <h3 className="font-bold text-white mb-3 text-xl">1. Upload & Analyze</h3>
                  <p className="text-gray-300">
                    AI analyzes your image content, format, and quality to determine optimal compression strategy
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-white" />
            </div>
                  <h3 className="font-bold text-white mb-3 text-xl">2. Smart Processing</h3>
                  <p className="text-gray-300">
                    Advanced algorithms apply format-specific optimizations while preserving visual fidelity
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50 flex items-center justify-center mx-auto mb-6">
              <Download className="w-10 h-10 text-white" />
            </div>
                  <h3 className="font-bold text-white mb-3 text-xl">3. Instant Download</h3>
                  <p className="text-gray-300">
                    Get your optimized images individually or as batch ZIP downloads, ready for deployment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Footer */}
<footer className="bg-gray-800/50 backdrop-blur-xl border-t border-teal-500/30 text-white py-12 relative z-10">
  <div className="max-w-7xl mx-auto px-4">
    <div className="grid md:grid-cols-4 gap-8">
      {/* Brand */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
          <span className="text-xl font-bold">MicroJPEG</span>
        </div>
        <p className="text-gray-300">
          The smartest way to compress and optimize your images for the web.
        </p>
      </div>

      {/* Product */}
      <div>
        <h4 className="font-semibold mb-4 text-teal-400">Product</h4>
        <ul className="space-y-2 text-gray-300">
          <li><Link href="/features" className="hover:text-teal-400 transition-colors">Features</Link></li>
          <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
          <li><Link href="/api-docs" className="hover:text-teal-400 transition-colors">API</Link></li>
          <li><Link href="/api-docs" className="hover:text-teal-400 transition-colors">Documentation</Link></li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-semibold mb-4 text-teal-400">Company</h4>
        <ul className="space-y-2 text-gray-300">
          <li><Link href="/about" className="hover:text-teal-400 transition-colors">About</Link></li>
          <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
          <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
          <li><Link href="/support" className="hover:text-teal-400 transition-colors">Support</Link></li>
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h4 className="font-semibold mb-4 text-teal-400">Legal</h4>
        <ul className="space-y-2 text-gray-300">
          <li><Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
          <li><Link href="/terms-of-service" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
          <li><Link href="/cookie-policy" className="hover:text-teal-400 transition-colors">Cookie Policy</Link></li>
          <li><Link href="/cancellation-policy" className="hover:text-teal-400 transition-colors">Cancellation Policy</Link></li>
          <li><Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">GDPR</Link></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-teal-500/30 mt-8 pt-8 text-center text-gray-400">
      <p>© 2025 MicroJPEG. All rights reserved. Making the web faster, one image at a time.</p>
    </div>
  </div>
</footer>
    </div>
  );
}