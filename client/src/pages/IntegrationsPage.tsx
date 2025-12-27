import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Puzzle, ArrowRight, ExternalLink, Github, Database, ShoppingBag, Terminal, Download, Info, Zap, Smartphone, Monitor } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/header';
import { SEOHead } from '@/components/SEOHead';
import logoUrl from '@assets/mascot-logo-optimized.png';
import airtableLogo from '@assets/Airtable_Logo.png';
import joomLogo from '@assets/Joom_Shopping.png';
import dotnetLogo from '@assets/dotnet.svg';
import appleLogo from '@assets/Apple.png';

// Custom Apple Shortcuts Icon
const ShortcutsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 15 3-3 3 3" />
        <path d="m15 9-3 3-3-3" />
        <rect width="20" height="20" x="2" y="2" rx="4" />
    </svg>
);

export default function IntegrationsPage() {
    const [activeTab, setActiveTab] = useState('All');

    const integrations = [
        {
            id: 'shortcuts',
            title: 'Apple Shortcuts',
            badge: 'iOS, iPadOS & Mac',
            category: 'Desktop',
            description: 'Compress and resize images directly from your Apple devices using the official MicroJPEG iOS App.',
            longDescription: 'Updated for iOS 18. Seamlessly integrate MicroJPEG into your Apple ecosystem. Download our official app for professional-grade compression and resizing on your iPhone, iPad, or Mac.',
            icon: <ShortcutsIcon className="w-12 h-12 text-blue-400" />,
            logo: appleLogo,
            color: 'from-blue-600/20 to-pink-500/20',
            actionText: 'View on App Store',
            actionLink: 'https://apps.apple.com/us/app/shortcuts/id915249334',
            secondaryText: 'MicroJPEG Shortcut',
            secondaryLink: '/integrations',
            type: 'shortcut'
        },
        {
            id: 'dotnet',
            title: '.NET Client Library',
            badge: 'Official Wrapper',
            category: 'Development',
            description: 'Integrate MicroJPEG directly into your .NET applications with our powerful client library.',
            longDescription: 'Our .NET Standard 2.0+ library allows developers to easily add professional image optimization to any Windows, Linux, or macOS application. High performance, zero dependencies.',
            icon: <Terminal className="w-12 h-12 text-teal-400" />,
            logo: dotnetLogo,
            color: 'from-teal-600/20 to-emerald-500/20',
            actionText: 'View on GitHub',
            actionLink: 'https://github.com/prasun-prasoon/microjpeg-dotnet',
            secondaryText: 'Read Docs',
            secondaryLink: 'https://github.com/prasun-prasoon/microjpeg-dotnet#readme',
            type: 'library'
        },
        {
            id: 'airtable',
            title: 'Airtable Extension',
            badge: 'Productivity',
            category: 'Content Management',
            description: 'Optimize your Airtable attachments automatically to keep your bases fast and lightweight.',
            longDescription: 'Directly compress attachments within Airtable. No third-party tools needed. Keep your storage costs low and your Airtable records lightning fast with our official extension.',
            icon: <Database className="w-12 h-12 text-blue-400" />,
            logo: airtableLogo,
            color: 'from-blue-600/20 to-indigo-500/20',
            actionText: 'Install Extension',
            actionLink: '/airtable-extension',
            secondaryText: 'Instructions',
            secondaryLink: '/airtable-extension',
            type: 'extension'
        },
        {
            id: 'joomshooting',
            title: 'JoomShopping',
            badge: 'E-commerce Plugin',
            category: 'Ecommerce',
            description: 'Optimize your JoomShopping images automatically with our official plugin.',
            longDescription: 'Specifically designed for JoomShopping, this plugin optimizes product, category, and manufacturer images during upload. Improve your store speed and SEO effortlessly.',
            icon: <ShoppingBag className="w-12 h-12 text-orange-400" />,
            logo: joomLogo,
            color: 'from-orange-600/20 to-red-500/20',
            actionText: 'Download ZIP',
            actionLink: '/downloads/plg_jshoppingproducts_microjpeg_v1.0.0.zip',
            secondaryText: 'MicroJPEG Home',
            secondaryLink: '/',
            type: 'plugin'
        }
    ];

    const categories = ['All', 'Content Management', 'Desktop', 'Development', 'Ecommerce'];

    const filteredIntegrations = activeTab === 'All'
        ? integrations
        : integrations.filter(item => item.category === activeTab);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-opensans">
            <SEOHead
                title="Integrations - MicroJPEG"
                description="Connect MicroJPEG with your favorite tools and platforms. Official integrations for .NET, Airtable, JoomShopping, and more."
            />
            <Header />

            <main className="pt-16 pb-24">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-gray-900 to-gray-900"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <Badge variant="outline" className="border-brand-gold text-brand-gold mb-4 py-1 px-4 text-sm font-semibold uppercase tracking-wider">
                            Ecosystem
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-brand-gold">Integrations</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                            Supercharge your workflow by connecting MicroJPEG with the tools you use every day. From development libraries to e-commerce plugins.
                        </p>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap justify-center gap-2 mb-12">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeTab === cat
                                        ? "bg-brand-gold border-brand-gold text-white shadow-lg shadow-brand-gold/20"
                                        : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Integrations Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
                        {filteredIntegrations.map((item) => (
                            <div key={item.id} className="group perspective-1000 w-full h-[450px]">
                                <div className="relative w-full h-full transition-all duration-700 preserve-3d group-hover:rotate-y-180 cursor-pointer">
                                    {/* Front Side */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden">
                                        <Card className="w-full h-full bg-white border border-gray-200 flex flex-col p-8 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-32 h-32 rounded-3xl bg-white border border-gray-100 flex items-center justify-center mb-8 shadow-md group-hover:scale-110 transition-transform duration-500 p-4">
                                                    {item.logo ? (
                                                        <img src={item.logo} alt={item.title} className="w-full h-full object-contain" />
                                                    ) : (
                                                        item.icon
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200">
                                                        {item.badge}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-teal-500/30 text-teal-600">
                                                        {item.category}
                                                    </Badge>
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h2>
                                                <p className="text-gray-600 line-clamp-3">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className="mt-auto flex justify-center">
                                                <div className="flex items-center gap-2 text-brand-gold font-bold">
                                                    <span>Details</span>
                                                    <Info className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                                        <Card className="w-full h-full bg-white border border-brand-gold flex flex-col p-8 shadow-2xl">
                                            <div className="mb-6">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">About {item.title}</h3>
                                                <div className="h-1 w-12 bg-brand-gold rounded-full mb-4"></div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {item.longDescription}
                                                </p>
                                            </div>

                                            <div className="mt-auto space-y-4">
                                                <Button
                                                    className="w-full bg-brand-gold hover:bg-brand-gold-dark text-white shadow-lg shadow-brand-gold/30 font-bold"
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
                                                    className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
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

                    {/* JoomShopping Requirements Section (Only show when Ecommerce or All is selected) */}
                    {(activeTab === 'All' || activeTab === 'Ecommerce') && (
                        <div id="requirements" className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 lg:p-12 mb-20 relative overflow-hidden mt-12 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShoppingBag className="w-48 h-48 text-teal-400" />
                            </div>
                            <div className="max-w-3xl relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-6">JoomShopping Optimizer Details</h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-teal-400 font-bold uppercase tracking-wider text-sm">System Requirements</h3>
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
                                        onClick={() => window.open('https://github.com/prasun-prasoon/microjpeg-joomshopping', '_blank')}
                                    >
                                        View Plugin Source on GitHub <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Partners / Coming soon section */}
                    <div className="text-center py-12 border-t border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-8">Planned Integrations</h2>
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
                </section>
            </main>

            {/* Global Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={logoUrl} alt="MicroJPEG Logo" className="w-10 h-10" />
                                <span className="text-xl font-bold uppercase tracking-tighter">MicroJPEG</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Professional image optimization for modern websites and apps.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-brand-gold">Product</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/" className="hover:text-brand-gold transition-colors">Home</Link></li>
                                <li><Link href="/pricing" className="hover:text-brand-gold transition-colors">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-brand-gold">Resources</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/integrations" className="hover:text-brand-gold transition-colors">Integrations</Link></li>
                                <li><Link href="/api-docs" className="hover:text-brand-gold transition-colors">API Documentation</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-brand-gold">Connect</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="https://github.com/prasun-prasoon" className="hover:text-brand-gold transition-colors">GitHub</a></li>
                                <li><Link href="/contact" className="hover:text-brand-gold transition-colors">Contact Support</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
                        <p>© 2025 MicroJPEG. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
