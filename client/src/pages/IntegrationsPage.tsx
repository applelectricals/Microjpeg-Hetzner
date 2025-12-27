import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Puzzle, ArrowRight, ExternalLink, Github, Database, ShoppingBag, Terminal, Download, Info } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import logoUrl from '@assets/mascot-logo-optimized.png';
import airtableLogo from '@assets/airtable_logo_premium.png';
import joomLogo from '@assets/joomshopping_logo_premium.png';

export default function IntegrationsPage() {
    const integrations = [
        {
            id: 'dotnet',
            title: '.NET Client Library',
            badge: 'Official Wrapper',
            description: 'Official MicroJPEG wrapper for .NET. Supports .NET Core, .NET 6/7/8, and full .NET Framework. Non-blocking async APIs.',
            longDescription: 'A robust, high-performance library for C# developers. Features include automatic retry logic, streamlined error handling, and support for all MicroJPEG AI features like background removal and upscaling.',
            icon: <Terminal className="w-12 h-12 text-purple-400" />,
            logo: null,
            color: 'from-purple-500/20 to-indigo-500/20',
            actionText: 'GitHub Repo',
            actionLink: 'https://github.com/applelectricals/microjpeg-dotnet',
            secondaryText: 'Documentation',
            secondaryLink: '/api-docs',
            type: 'library'
        },
        {
            id: 'airtable',
            title: 'Airtable Extension',
            badge: 'Direct Integration',
            description: 'Bulk compress and optimize your Airtable attachments directly within your base. Simple script integration.',
            longDescription: 'Transform your Airtable base into an image processing powerhouse. Automatically compress attachments in any table with a simple copy-paste script that uses the MicroJPEG API.',
            icon: <Database className="w-12 h-12 text-teal-400" />,
            logo: airtableLogo,
            color: 'from-teal-500/20 to-blue-500/20',
            actionText: 'Get Extension',
            actionLink: '/airtable-extension',
            secondaryText: 'Usage Guide',
            secondaryLink: '/blog',
            type: 'extension'
        },
        {
            id: 'joomshopping',
            title: 'JoomShopping Optimizer',
            badge: 'Joomla Plugin',
            description: 'Automatically optimize product, category, and manufacturer images in your JoomShopping store on save.',
            longDescription: 'The ultimate image optimizer for JoomShopping. Features auto-compression on save, WebP/AVIF conversion, quality control, and detailed usage statistics in the Joomla admin panel.',
            icon: <ShoppingBag className="w-12 h-12 text-blue-400" />,
            logo: joomLogo,
            color: 'from-blue-500/20 to-cyan-500/20',
            actionText: 'Download ZIP',
            actionLink: '/downloads/plg_jshoppingproducts_microjpeg_v1.0.0.zip',
            secondaryText: 'Requirements',
            secondaryLink: '#requirements',
            type: 'plugin'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

            <SEOHead
                title="Third-Party Integrations - MicroJPEG"
                description="Connect MicroJPEG with your favorite tools. Official libraries and extensions for .NET, Airtable, JoomShopping, and more."
                canonicalUrl="https://microjpeg.com/integrations"
                keywords="microjpeg integrations, dotnet client library, airtable extension, joomshopping optimizer, image compression api"
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
                        Powerful Integrations
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        Connect MicroJPEG to your existing platforms and accelerate your development with our high-fidelity libraries and extensions.
                    </p>
                </div>

                {/* Integration Cards - Flip Style */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {integrations.map((item) => (
                        <div key={item.id} className="group perspective-1000 w-full h-[450px]">
                            <div className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180 cursor-pointer">

                                {/* Front Side */}
                                <div className="absolute inset-0 w-full h-full backface-hidden">
                                    <Card className="w-full h-full bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 flex flex-col p-8 overflow-hidden">
                                        <div className="flex flex-col items-center text-center">
                                            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                                                {item.logo ? (
                                                    <img src={item.logo} alt={item.title} className="w-24 h-24 object-contain" />
                                                ) : (
                                                    item.icon
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 border border-teal-500/30 mb-4">
                                                {item.badge}
                                            </Badge>
                                            <h2 className="text-2xl font-bold text-white mb-4">{item.title}</h2>
                                            <p className="text-gray-400 line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="mt-auto flex justify-center">
                                            <div className="flex items-center gap-2 text-teal-400 font-medium">
                                                <span>Details</span>
                                                <Info className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Back Side */}
                                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                                    <Card className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 border border-teal-500/30 flex flex-col p-8 shadow-2xl">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-white mb-2">About {item.title}</h3>
                                            <div className="h-1 w-12 bg-teal-500 rounded-full mb-4"></div>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {item.longDescription}
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <Button
                                                className="w-full bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/30 font-bold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item.actionLink.startsWith('http')) {
                                                        window.open(item.actionLink, '_blank');
                                                    } else {
                                                        window.location.href = item.actionLink;
                                                    }
                                                }}
                                            >
                                                {item.actionText === 'Download ZIP' ? <Download className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                                                {item.actionText}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = item.secondaryLink;
                                                }}
                                            >
                                                {item.secondaryText}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                {/* Requirements / Info Section */}
                <div id="requirements" className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 lg:p-12 mb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShoppingBag className="w-48 h-48 text-teal-400" />
                    </div>
                    <div className="max-w-3xl relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-6">JoomShopping Optimizer Details</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-teal-400 font-bold uppercase tracking-wider text-sm text-sm">System Requirements</h3>
                                <ul className="text-gray-300 space-y-2 text-sm">
                                    <li className="flex gap-2"><span>•</span> Joomla 4.x or 5.x</li>
                                    <li className="flex gap-2"><span>•</span> JoomShopping 5.x</li>
                                    <li className="flex gap-2"><span>•</span> PHP 8.0 or higher</li>
                                    <li className="flex gap-2"><span>•</span> cURL extension enabled</li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-teal-400 font-bold uppercase tracking-wider text-sm">Key Features</h3>
                                <ul className="text-gray-300 space-y-2 text-sm">
                                    <li className="flex gap-2"><span>•</span> Automatic compression on save</li>
                                    <li className="flex gap-2"><span>•</span> WebP & AVIF conversion</li>
                                    <li className="flex gap-2"><span>•</span> Real-time usage statistics</li>
                                    <li className="flex gap-2"><span>•</span> Error logging for debugging</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button
                                variant="link"
                                className="text-teal-400 hover:text-teal-300 p-0 h-auto font-bold"
                                onClick={() => window.open('https://github.com/applelectricals/microjpeg-joomshopping', '_blank')}
                            >
                                View Plugin Source on GitHub <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Partners / Coming soon section */}
                <div className="text-center py-12 border-t border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-8">More official plugins in progress</h2>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png" alt="WordPress" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">WordPress</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Shopify_logo%2C_2017.png" alt="Shopify" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Shopify</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center grayscale">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Slack</span>
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
