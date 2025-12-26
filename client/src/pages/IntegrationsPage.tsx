import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Puzzle, ArrowRight, ExternalLink, Github, Database } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import ButtonsSection from '@/components/ButtonsSection';
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function IntegrationsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

            <SEOHead
                title="Third-Party Integrations - MicroJPEG"
                description="Connect MicroJPEG with your favorite tools. Official libraries and extensions for .NET, Airtable, and more."
                canonicalUrl="https://microjpeg.com/integrations"
                keywords="microjpeg integrations, dotnet client library, airtable extension, image compression api"
            />

            <Header />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

                {/* Hero Section */}
                <div className="text-center py-12 mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/50">
                        <Puzzle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                        Third-Party Integrations
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Connect MicroJPEG to your existing workflows with our official libraries, extensions, and plugins.
                    </p>
                    <ButtonsSection />
                </div>

                {/* Integration Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* .NET Client Library */}
                    <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-400/50 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Github className="w-24 h-24 text-teal-400" />
                        </div>
                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
                                    <Github className="w-6 h-6 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">.NET Client Library</h2>
                                    <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30 mt-1">
                                        Official Wrapper
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-gray-300 mb-8 flex-grow">
                                Official MicroJPEG wrapper for .NET. Supports .NET Core, .NET 6/7/8, and full .NET Framework.
                                Non-blocking async APIs for compression, conversion, and AI image processing.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-auto">
                                <Button
                                    className="bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30"
                                    onClick={() => window.open('https://github.com/applelectricals/microjpeg-dotnet', '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    GitHub Repo
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={() => window.location.href = '/api-docs'}
                                >
                                    View Documentation
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Airtable Extension */}
                    <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-400/50 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database className="w-24 h-24 text-teal-400" />
                        </div>
                        <div className="flex flex-col h-full relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center">
                                    <Database className="w-6 h-6 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Airtable Extension</h2>
                                    <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30 mt-1">
                                        Direct Integration
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-gray-300 mb-8 flex-grow">
                                Bulk compress and optimize your Airtable attachments directly within your base.
                                Simple copy-paste script integration without any middlemen.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-auto">
                                <Button
                                    className="bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30"
                                    onClick={() => window.location.href = '/airtable-extension'}
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Get Extension
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={() => window.location.href = '/blog'}
                                >
                                    Read Usage Guide
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* More coming soon */}
                <div className="text-center py-12 border-t border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-4">More Integrations Coming Soon</h2>
                    <p className="text-gray-400 mb-8">
                        We're building more official plugins for WordPress, Shopify, and popular development frameworks.
                    </p>
                    <div className="flex justify-center gap-8 opacity-50">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png" alt="WordPress" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">WordPress</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Shopify_logo%2C_2017.png" alt="Shopify" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-widest">Shopify</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800/50 backdrop-blur-xl border-t border-teal-500/30 text-white py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                                <span className="text-xl font-bold">MicroJPEG</span>
                            </div>
                            <p className="text-gray-300">
                                The smartest way to compress and optimize your images for the web.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-teal-400">Product</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link href="/features" className="hover:text-teal-400 transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-teal-400 transition-colors">Pricing</Link></li>
                                <li><Link href="/api-docs" className="hover:text-teal-400 transition-colors">API</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-teal-400">Resources</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link href="/blog" className="hover:text-teal-400 transition-colors">Blog</Link></li>
                                <li><Link href="/support" className="hover:text-teal-400 transition-colors">Support</Link></li>
                                <li><Link href="/integrations" className="hover:text-teal-400 transition-colors">Integrations</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-teal-400">Legal</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li><Link href="/legal/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/legal/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link></li>
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
