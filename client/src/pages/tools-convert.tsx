import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileImage, Zap, Globe, Star, Download, Upload, Gauge, Camera, Layers, Shield, Settings, BarChart, Package } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';

export default function ToolsConvert() {
  const [activeTab, setActiveTab] = useState('convert');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
  {/* Glow Effects */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <SEOHead
        title="Image Format Conversion Tools - Convert Images | Micro JPEG"
        description="Professional image format conversion tools. Convert between JPEG, PNG, WebP, AVIF, and more. Maintain quality while changing formats for different use cases."
        canonicalUrl="https://microjpeg.com/tools/convert"
        keywords="image format converter, JPEG to PNG, PNG to WebP, image format conversion, image converter tool"
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
  id === 'convert'
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
              <ArrowRight className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-6">
              Professional Format Conversion
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
              Transform between 13+ image formats including professional RAW files. Convert to modern web formats 
              like WebP and AVIF for superior performance, or process camera RAW files for professional workflows.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all px-8 py-4 text-lg"
                onClick={() => window.location.href = '/'}
                data-testid="button-start-converting"
              >
                Start Converting Now
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
          <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" id="formats">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">13+ Supported Formats</CardTitle>
              <p className="text-gray-300">Professional conversion between all major image formats</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Web & Standard Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['JPEG', 'PNG', 'WebP', 'AVIF', 'SVG', 'TIFF'].map(format => (
                    <Badge key={format} variant="secondary" className="bg-indigo-100 text-indigo-700 px-3 py-1">{format}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Professional RAW Formats</h4>
                <div className="flex flex-wrap gap-2">
                  {['CR2 (Canon)', 'ARW (Sony)', 'DNG (Adobe)', 'NEF (Nikon)', 'ORF (Olympus)', 'RAF (Fujifilm)', 'RW2 (Panasonic)'].map(format => (
                    <Badge key={format} variant="outline" className="border-purple-200 text-purple-700 px-3 py-1">{format}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Demo */}
          <div className="max-w-5xl mx-auto">
            <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Conversion Examples</CardTitle>
                <p className="text-gray-300">See how we transform between different formats</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex flex-col items-center justify-center mx-auto mb-4 p-4">
                      <Camera className="w-10 h-10 text-indigo-600 mb-1" />
                      <span className="text-xs text-indigo-700 font-medium">RAW/Legacy</span>
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">Source Format</h3>
                    <p className="text-gray-300">CR2, TIFF, PNG, JPEG</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-white">Smart Conversion</p>
                    <p className="text-sm text-gray-300">Format optimization</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex flex-col items-center justify-center mx-auto mb-4 p-4">
                      <Globe className="w-10 h-10 text-purple-600 mb-1" />
                      <span className="text-xs text-purple-700 font-medium">Web Ready</span>
                    </div>
                    <h3 className="font-bold text-white mb-2 text-lg">Target Format</h3>
                    <p className="text-gray-300">WebP, AVIF, optimized JPEG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Features */}
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Advanced Conversion Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-bold text-white mb-3">Smart Format Selection</h3>
                <p className="text-gray-300 text-sm">
                  AI recommends optimal output formats based on image content and intended use
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-white mb-3">RAW Processing</h3>
                <p className="text-gray-300 text-sm">
                  Professional camera RAW file conversion with advanced processing capabilities
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-900/30 to-yellow-900/30 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-bold text-white mb-3">Modern Web Formats</h3>
                <p className="text-gray-300 text-sm">
                  Convert to WebP, AVIF, and next-generation formats for superior web performance
                </p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-white mb-3">Quality Preservation</h3>
                <p className="text-gray-300 text-sm">
                  Maintain visual fidelity during conversion with advanced format-specific optimizations
                </p>
              </Card>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-8">
              Why Convert to Modern Formats?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Gauge className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Superior Compression</h3>
                <p className="text-gray-300 text-sm">WebP and AVIF provide 25-50% better compression than JPEG with identical quality</p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Globe className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Universal Support</h3>
                <p className="text-gray-300 text-sm">Modern browsers support next-gen formats with automatic fallback options</p>
              </Card>

              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Zap className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">Lightning Speed</h3>
                <p className="text-gray-300 text-sm">Dramatically faster page loads and improved user experience across all devices</p>
              </Card>
              
              <Card className="p-6 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <Star className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2">SEO Advantage</h3>
                <p className="text-gray-300 text-sm">Boost Core Web Vitals and search rankings with optimized image formats</p>
              </Card>
            </div>
          </div>

          {/* Professional Features */}
          <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">Professional Conversion Features</CardTitle>
              <p className="text-gray-300">Advanced tools for photographers, designers, and developers</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl">RAW Processing</h3>
                  <p className="text-gray-300">
                    Convert professional camera RAW files from Canon, Nikon, Sony, and more to web-ready formats
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl">Batch Conversion</h3>
                  <p className="text-gray-300">
                    Convert multiple images simultaneously with consistent settings and quality preservation
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-xl">Quality Control</h3>
                  <p className="text-gray-300">
                    Fine-tune conversion settings with real-time preview and before/after comparisons
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}