import { Shield, Zap, Users, Award, Target, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/header';
import { Link } from 'wouter';
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
      <Header />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="MicroJPEG Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About MicroJPEG
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to make image compression effortless, fast, and accessible
            to everyone - from individual photographers to enterprise teams.
          </p>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Story</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Born from the frustration of slow, unreliable image compression tools,
              MicroJPEG was created to deliver enterprise-grade compression technology
              through a simple, intuitive interface. We believe that powerful tools
              should be accessible to everyone, regardless of technical expertise.
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <Target className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-gray-300">
              To democratize professional-grade image compression, making it fast,
              reliable, and accessible to creators worldwide.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <Heart className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Values</h3>
            <p className="text-gray-300">
              Simplicity, reliability, and performance. We prioritize user experience
              and build tools that just work, every time.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
            <Award className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
            <p className="text-gray-300">
              To become the go-to platform for image optimization, trusted by
              millions of users for their most important projects.
            </p>
          </Card>
        </div>

        {/* What We Do */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What We Do</h2>
            <p className="text-lg text-gray-300">
              We've built the most advanced image compression platform that combines
              cutting-edge algorithms with intuitive design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Our optimized compression engine processes images up to 10x faster
                  than traditional tools, without compromising quality.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure & Private</h3>
                <p className="text-gray-300">
                  Your images are processed securely and automatically deleted after
                  download. We never store or access your private content.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Built for Teams</h3>
                <p className="text-gray-300">
                  From individual creators to enterprise teams, our platform scales
                  to meet your needs with flexible plans and API access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Award className="w-8 h-8 text-teal-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Industry Leading</h3>
                <p className="text-gray-300">
                  Trusted by photographers, designers, and developers who demand
                  the best compression quality and reliability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 rounded-2xl p-8 mb-16 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted by Creators Worldwide</h2>
            <p className="text-gray-300">
              Join thousands of satisfied users who trust MicroJPEG for their image optimization needs.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-400 mb-2">1M+</div>
              <div className="text-gray-300">Images Compressed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400 mb-2">50k+</div>
              <div className="text-gray-300">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've made the switch to faster,
            more reliable image compression.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white"
              onClick={() => window.location.href = '/'}
            >
              Start Compressing Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-teal-500/50 text-teal-300 hover:bg-teal-900/30 hover:border-teal-400 transition-all"
              onClick={() => window.location.href = '/simple-pricing'}
            >
              View Pricing
            </Button>
          </div>
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