import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Download, 
  ArrowRight, 
  Settings, 
  Zap,
  Shield,
  Globe,
  Code2,
  Upload,
  FileImage,
  Clock,
  Users,
  HelpCircle,
  Mail,
  Server,
  Gauge,
  Image,
  Layers
} from "lucide-react";
import { SiWordpress } from "react-icons/si";
import { Link } from "wouter";
import Header from "@/components/header";
import { SEOHead } from '@/components/SEOHead';

export default function WordPressDetails() {
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    document.title = "WordPress Plugin Details - Automatic Image Compression | Micro JPEG";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
  {/* Glow Effects */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
  <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

      <SEOHead
        title="WordPress Plugin Details - Automatic Image Compression | Micro JPEG"
        description="Complete WordPress plugin details for automatic image compression. Features, installation guide, technical specifications, and integration options for your WordPress site."
        canonicalUrl="https://microjpeg.com/wordpress-plugin"
        keywords="WordPress plugin details, WordPress image compression features, WordPress plugin installation, WordPress SEO optimization"
      />
      <Header />
      
      {/* Sub Navigation */}
      <div className="bg-gray-800/90 backdrop-blur-xl border-b border-teal-500/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'details', label: 'Details', icon: FileImage },
              { id: 'installation', label: 'Installation', icon: Download },
              { id: 'docs', label: 'Documentation', icon: FileImage },
              
            ].map(({ id, label, icon: Icon }) => (
              <Link 
                key={id} 
                href={id === 'details' ? '/wordpress-plugin' : 
                      id === 'installation' ? '/wordpress-plugin/install' : 
                      id === 'docs' ? '/wordpress-plugin/docs' :
                      '/wordpress-plugin/api'}
className={`flex items-center space-x-2 px-4 py-4 border-b-2 text-sm font-medium transition-colors ${
  id === 'details'
    ? 'border-teal-400 text-teal-400'
    : 'border-transparent text-gray-400 hover:text-white hover:border-teal-500/50'
}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50">
              <SiWordpress className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-4">
              Micro JPEG WordPress Plugin
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Automatically compress, convert, and optimize all images uploaded to your WordPress site including RAW files. 
              Support for JPEG, PNG, WebP, AVIF, SVG, TIFF, and professional camera RAW formats with intelligent format conversion.
            </p>
            <div className="flex justify-center space-x-4 mt-8">
  <a 
    href="/micro-jpeg-api-wordpress-plugin.zip" 
    download="micro-jpeg-wordpress-plugin.zip"
  >
    <Button
      size="lg"
      className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all"
      data-testid="button-download-plugin"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Plugin
    </Button>
  </a>
  <Button
    size="lg"
    variant="outline"
    className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400/10 backdrop-blur-sm"
    onClick={() => window.location.href = '/wordpress-plugin/install'}
    data-testid="button-installation-guide"
  >
    Installation Guide
    <ArrowRight className="w-4 h-4 ml-2" />
  </Button>
</div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="description" className="space-y-8">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 backdrop-blur-xl rounded-xl p-2 border border-gray-700/50">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="multisite">Multisite</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Description */}
            <TabsContent value="description" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileImage className="w-5 h-5" />
                    Plugin Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    The Micro JPEG WordPress Plugin automatically compresses, converts, and optimizes every image uploaded to your WordPress media library. 
                    Supporting 13+ image formats including professional RAW files (CR2, ARW, DNG, NEF, ORF, RAF, RW2), it uses advanced compression algorithms 
                    to reduce file sizes by up to 80% while maintaining excellent visual quality.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Perfect for professional photographers, bloggers, e-commerce sites, and any WordPress website handling diverse image formats. 
                    The plugin features intelligent format conversion, automatically converting RAW files to web-optimized formats, and works 
                    seamlessly in the background requiring no technical knowledge.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Key Benefits</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Faster page loading times</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Reduced bandwidth usage</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Better SEO rankings</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Improved user experience</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Supported Formats</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-2">Standard Formats:</p>
                          <div className="flex flex-wrap gap-2">
                            {['JPEG', 'PNG', 'WebP', 'AVIF', 'SVG', 'TIFF'].map(format => (
                              <Badge key={format} variant="secondary">{format}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300 mb-2">RAW Formats:</p>
                          <div className="flex flex-wrap gap-2">
                            {['CR2', 'ARW', 'DNG', 'NEF', 'ORF', 'RAF', 'RW2'].map(format => (
                              <Badge key={format} variant="outline" className="text-purple-400 border-purple-200">{format}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Automatically detects, converts, and optimizes all supported image formats including professional RAW files
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Why Choose Micro JPEG?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Gauge className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Superior Compression</h4>
                      <p className="text-sm text-gray-400">Advanced algorithms achieve up to 80% size reduction while maintaining quality</p>
                    </div>
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Automatic Processing</h4>
                      <p className="text-sm text-gray-400">No manual work required - compression happens automatically on upload</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                      <h4 className="font-semibold mb-2 text-white">Safe & Reliable</h4>
                      <p className="text-sm text-gray-400">Backup originals and rollback capabilities for complete peace of mind</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Upload className="w-5 h-5 text-blue-600" />
                      Automatic Compression
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">Every image uploaded to your media library is automatically compressed in the background.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Compression on upload</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">All image sizes compressed</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Background processing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Layers className="w-5 h-5 text-purple-400" />
                      Bulk Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">Compress thousands of existing images in your media library with one click.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Process entire media library</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Progress tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Pause and resume</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Settings className="w-5 h-5 text-gray-400" />
                      Flexible Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">Customize compression settings to match your quality requirements.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Quality control</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Image size selection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Format preferences</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5 text-green-400" />
                      Backup & Restore
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">Keep original images safe with automatic backups and easy restoration.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Original backup storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">One-click restore</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Backup management</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Image className="w-5 h-5 text-orange-600" />
                      RAW File Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">Professional camera RAW file support with intelligent conversion to web formats.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">CR2, ARW, DNG, NEF support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">ORF, RAF, RW2 compatibility</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Automatic web conversion</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Globe className="w-5 h-5 text-teal-600" />
                      Smart Format Conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">Intelligent format conversion optimized for web performance and compatibility.</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">SVG to optimized raster</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">TIFF compression</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">Next-gen format output</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* How It Works */}
            <TabsContent value="how-it-works" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">How the Plugin Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">1</div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Image Upload Detection</h3>
                        <p className="text-gray-400">The plugin automatically detects when new images are uploaded to your WordPress media library.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">2</div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Format Detection & Conversion</h3>
                        <p className="text-gray-400">The plugin identifies the image format (including RAW files) and determines the optimal web format for conversion.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">3</div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Background Processing</h3>
                        <p className="text-gray-400">Images are sent to Micro JPEG's compression servers for processing, without blocking your workflow.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">4</div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">Smart Compression</h3>
                        <p className="text-gray-400">Advanced algorithms analyze each image and apply optimal compression settings for maximum size reduction.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">5</div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">File Replacement</h3>
                        <p className="text-gray-400">Compressed images replace the originals in your media library, with originals safely backed up.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-white">Compression Technology</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Advanced lossy and lossless algorithms</li>
                        <li>• Smart quality adjustment based on content</li>
                        <li>• RAW file processing and conversion</li>
                        <li>• 13+ format support (JPEG, PNG, WebP, AVIF, SVG, TIFF, RAW)</li>
                        <li>• Intelligent format conversion</li>
                        <li>• Metadata preservation options</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-white">WordPress Integration</h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Hooks into WordPress upload process</li>
                        <li>• Compatible with all image sizes</li>
                        <li>• Works with page builders</li>
                        <li>• Admin dashboard integration</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-white mb-2">Step 1: Install the Plugin</h3>
                      <p className="text-gray-400">Download and install the plugin from your WordPress dashboard or WordPress.org repository.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-white mb-2">Step 2: Get Your API Key</h3>
                      <p className="text-gray-400">Sign up for a Micro JPEG account and copy your API key from the dashboard.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-white mb-2">Step 3: Configure Settings</h3>
                      <p className="text-gray-400">Enter your API key in the plugin settings and choose your compression preferences.</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-white mb-2">Step 4: Optimize Existing Images</h3>
                      <p className="text-gray-400">Use the bulk optimization tool to compress all existing images in your media library.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Optimizing All Your Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">
                    The plugin provides multiple ways to ensure all images on your site are optimized:
                  </p>
                  
                  <div className="space-y-4">
<div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-lg">
  <h4 className="font-semibold text-teal-400 mb-2">Automatic Future Compression</h4>
  <p className="text-gray-300 text-sm">
                        Once activated, every new image upload is automatically compressed in the background.
                      </p>
                    </div>
                    
<div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-lg">
  <h4 className="font-semibold text-teal-400 mb-2">Bulk Optimization Tool</h4>
  <p className="text-gray-300 text-sm">
                        Use the dedicated bulk optimization page to process thousands of existing images at once.
                      </p>
                    </div>
                    
<div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-lg">
  <h4 className="font-semibold text-teal-400 mb-2">Selective Processing</h4>
  <p className="text-gray-300 text-sm">
                        Choose specific folders, dates, or image types to optimize only what you need.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Multisite Support */}
            <TabsContent value="multisite" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Server className="w-5 h-5" />
                    WordPress Multisite Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">
                    The Micro JPEG plugin is fully compatible with WordPress Multisite installations, offering flexible management options for network administrators.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white">Network Admin Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Centralized API key management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Network-wide settings control</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Usage monitoring across all sites</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Bulk optimization for entire network</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-white">Site Admin Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Individual site customization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Site-specific compression stats</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Local backup management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Independent optimization queues</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Multisite Configuration Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
<div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-lg">
  <h4 className="font-semibold text-teal-400 mb-2">Centralized Mode</h4>
  <p className="text-gray-300 text-sm">
    Network admin manages all settings and API keys. Individual sites use compression automatically.
  </p>
</div>

<div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-lg">
  <h4 className="font-semibold text-teal-400 mb-2">Distributed Mode</h4>
  <p className="text-gray-300 text-sm">
    Each site manages its own API key and settings while sharing plugin updates and features.
  </p>
</div>

<div className="bg-teal-900/30 border border-teal-500/50 p-4 rounded-lg">
  <h4 className="ont-semibold text-teal-400 mb-2">Hybrid Mode</h4>
  <p className="text-gray-300 text-sm">
    Network admin sets defaults and limits, while sites can customize within those boundaries.
  </p>
</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-6">
              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <HelpCircle className="w-5 h-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">Will the plugin slow down my website?</h3>
                      <p className="text-gray-400 text-sm">
                        No, the plugin processes images in the background using WordPress's built-in queue system. 
                        Your website continues to function normally while images are being compressed.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">What happens to my original images?</h3>
                      <p className="text-gray-400 text-sm">
                        Original images are safely backed up before compression. You can restore originals at any time 
                        through the plugin's backup management interface.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">Does it work with page builders like Elementor?</h3>
                      <p className="text-gray-400 text-sm">
                        Yes, the plugin works with all page builders including Elementor, Gutenberg, Divi, and others. 
                        Any image uploaded through WordPress gets automatically compressed.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">Can I choose which image sizes to compress?</h3>
                      <p className="text-gray-400 text-sm">
                        Absolutely! You can select which WordPress image sizes to compress (thumbnail, medium, large, etc.) 
                        and set different quality levels for each size.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">What file formats are supported?</h3>
                      <p className="text-gray-400 text-sm">
                        The plugin supports JPEG, PNG, WebP, and AVIF formats. It can also convert between formats 
                        for optimal compression (e.g., PNG to WebP for smaller file sizes).
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">Is there a limit to how many images I can compress?</h3>
                      <p className="text-gray-400 text-sm">
                        Compression limits depend on your Micro JPEG plan. Free accounts get monthly compression credits, 
                        while premium plans offer unlimited compression.
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h3 className="font-semibold text-white mb-2">Can I use the plugin on multiple websites?</h3>
                      <p className="text-gray-400 text-sm">
                        Yes, you can install the plugin on multiple websites. Each site will need its own API key 
                        and will count toward your account's usage limits.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">What if I'm not satisfied with the compression results?</h3>
                      <p className="text-gray-400 text-sm">
                        You can adjust quality settings anytime and re-compress images. Original images are always 
                        preserved, so you can restore them if needed. We also offer a 30-day money-back guarantee.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mail className="w-5 h-5" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Still have questions? Our support team is here to help!
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-teal-400" />
                      <span className="text-sm text-gray-300">support@microjpeg.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">Average response time: 2-4 hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">24/7 support for premium users</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-4"
                    onClick={() => window.location.href = "mailto:support@microjpeg.com"}
                  >
                    Get Support
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
    </div>
  );
}