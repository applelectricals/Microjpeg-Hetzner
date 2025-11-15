import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { Link } from "wouter";
import logoUrl from "@assets/mascot-logo-optimized.png";
import {
  MessageCircle,
  Mail,
  HelpCircle,
  BookOpen,
  FileText,
  Zap,
  Clock,
  CheckCircle
} from "lucide-react";

export default function Support() {
  useEffect(() => {
    document.title = "Support - Micro JPEG";
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get support for your image compression needs. We're here to help you optimize your workflow.
            </p>
          </div>

          {/* Quick Help Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
              <CardHeader>
                <MessageCircle className="w-12 h-12 mx-auto text-teal-400 mb-4" />
              <CardTitle className="text-white">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Get instant help from our support team during business hours.
              </p>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <CardHeader>
              <Mail className="w-12 h-12 mx-auto text-teal-400 mb-4" />
              <CardTitle className="text-white">Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Send us an email and we'll respond within 24 hours.
              </p>
              <Button variant="outline" className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0" onClick={() => window.location.href = 'mailto:support@microjpeg.com'}>
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-teal-400 mb-4" />
              <CardTitle className="text-white">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Browse our comprehensive guides and API documentation.
              </p>
              <Button variant="outline" className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0" onClick={() => window.location.href = '/api-docs'}>
                View Docs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12 bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <HelpCircle className="w-6 h-6 mr-2 text-teal-400" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="border-b border-teal-500/30 pb-4">
                <h4 className="font-semibold text-white mb-2">How does image compression work?</h4>
                <p className="text-gray-300">
                  Our advanced algorithms reduce file sizes while maintaining visual quality. We support multiple formats including JPEG, PNG, WebP, and AVIF with customizable quality settings.
                </p>
              </div>

              <div className="border-b border-teal-500/30 pb-4">
                <h4 className="font-semibold text-white mb-2">What file formats do you support?</h4>
                <p className="text-gray-300">
                  We support 13+ input formats including JPEG, PNG, WebP, AVIF, TIFF, RAW, SVG, and more. Output formats include JPEG, PNG, WebP, AVIF, and TIFF.
                </p>
              </div>

              <div className="border-b border-teal-500/30 pb-4">
                <h4 className="font-semibold text-white mb-2">Is my data secure?</h4>
                <p className="text-gray-300">
                  Yes! All images are automatically deleted within 24 hours. We use encryption in transit and at rest, and never store your images permanently.
                </p>
              </div>

              <div className="border-b border-teal-500/30 pb-4">
                <h4 className="font-semibold text-white mb-2">How do I upgrade my subscription?</h4>
                <p className="text-gray-300">
                  You can upgrade anytime through your account dashboard. Changes take effect immediately with prorated billing.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Can I use the API for commercial projects?</h4>
                <p className="text-gray-300">
                  Absolutely! Our API is designed for commercial use. Choose the tier that fits your volume needs and integrate seamlessly into your applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Levels */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Free Support</CardTitle>
                <Badge variant="secondary" className="bg-gray-700/50 text-gray-300">Free</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Email support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Documentation access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">48-hour response time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Pro Support</CardTitle>
                <Badge className="bg-teal-900/50 text-teal-300">Pro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Priority email support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Live chat support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">24-hour response time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Enterprise Support</CardTitle>
                <Badge variant="destructive" className="bg-teal-600 text-white">Enterprise</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Dedicated support manager</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Phone support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">2-hour response time</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
          <CardHeader>
            <CardTitle className="text-white">Send us a message</CardTitle>
            <p className="text-gray-300">
              Can't find what you're looking for? Send us a detailed message and we'll get back to you soon.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <Input placeholder="Your name" className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <Input type="email" placeholder="your@email.com" className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                <Input placeholder="Brief description of your issue" className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <Textarea
                  placeholder="Please provide as much detail as possible about your question or issue..."
                  rows={6}
                  className="bg-gray-700/50 border-teal-500/30 text-white placeholder-gray-400"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-white mb-6">Additional Resources</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="border-teal-500/50 text-teal-300 hover:bg-teal-900/30" onClick={() => window.location.href = '/api-docs'}>
              <FileText className="w-4 h-4 mr-2" />
              API Docs
            </Button>
            <Button variant="outline" className="border-teal-500/50 text-teal-300 hover:bg-teal-900/30" onClick={() => window.location.href = '/simple-pricing'}>
              <FileText className="w-4 h-4 mr-2" />
              Pricing
            </Button>
            <Button variant="outline" className="border-teal-500/50 text-teal-300 hover:bg-teal-900/30" onClick={() => window.location.href = '/about'}>
              <FileText className="w-4 h-4 mr-2" />
              About Us
            </Button>
            <Button variant="outline" className="border-teal-500/50 text-teal-300 hover:bg-teal-900/30" onClick={() => window.location.href = '/privacy-policy'}>
              <FileText className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-xl border-t border-teal-500/30 text-white py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
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
    </>
  );
}