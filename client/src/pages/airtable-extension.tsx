import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
    FileImage,
    Copy,
    Plus,
    Table as TableIcon,
    ExternalLink,
    Code2,
    Info
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import { SEOHead } from '@/components/SEOHead';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from '@assets/mascot-logo-optimized.png';

interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
}

export default function AirtableExtension() {
    const { toast } = useToast();
    const { user, isAuthenticated } = useAuth();

    const { data: apiKeysData } = useQuery({
        queryKey: ['/api/keys'],
        enabled: isAuthenticated,
    }) as { data: { apiKeys: ApiKey[] } | undefined };

    const [activeApiKey, setActiveApiKey] = useState<string>("YOUR_API_KEY_HERE");

    useEffect(() => {
        if (apiKeysData?.apiKeys && apiKeysData.apiKeys.length > 0) {
            const activeKey = apiKeysData.apiKeys.find(k => k.isActive);
            if (activeKey) {
                // Note: We only have the prefix in the list, 
                // but we can tell the user to get it from settings 
                // or if we had an endpoint that returns the full key (not recommended for list)
                // For now, we'll just show the prefix or prompts
                setActiveApiKey(activeKey.keyPrefix + "••••••••••••••••");
            }
        }
    }, [apiKeysData]);

    const airtableScript = `/**
 * MicroJPEG Airtable Compression Script
 * 
 * This script automatically compresses image attachments in your Airtable base
 * using the MicroJPEG API.
 */

// --- CONFIGURATION ---
const API_KEY = "${activeApiKey}"; // Get your key from MicroJPEG API Dashboard
const TABLE_NAME = "Images"; // Change to your table name
const SOURCE_ATTACHMENT_FIELD = "Attachments"; // Field containing original images
const TARGET_ATTACHMENT_FIELD = "Compressed"; // Field where compressed images will be saved
const QUALITY = 75; // Compression quality (1-100)
// ----------------------

let table = base.getTable(TABLE_NAME);
let query = await table.selectRecordsAsync();

console.log(\`🚀 Starting compression for \${query.records.length} records...\`);

for (let record of query.records) {
    let attachments = record.getCellValue(SOURCE_ATTACHMENT_FIELD);
    let existingCompressed = record.getCellValue(TARGET_ATTACHMENT_FIELD);
    
    // Skip if no attachments or already compressed
    if (!attachments || attachments.length === 0 || (existingCompressed && existingCompressed.length > 0)) {
        continue;
    }

    console.log(\`📦 Processing record: \${record.name || record.id}\`);
    let newAttachments = [];

    for (let attachment of attachments) {
        // Only process images
        if (!attachment.type.startsWith('image/')) {
            newAttachments.push(attachment);
            continue;
        }

        console.log(\`  - Compressing: \${attachment.filename}\`);
        
        try {
            let response = await remoteFetchAsync('https://microjpeg.com/api/airtable/compress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${API_KEY}\`
                },
                body: JSON.stringify({
                    url: attachment.url,
                    quality: QUALITY
                })
            });

            if (response.ok) {
                let result = await response.json();
                if (result.success && result.output.url) {
                    newAttachments.push({
                        url: result.output.url,
                        filename: attachment.filename
                    });
                    console.log(\`  ✅ Compressed: \${result.output.size} bytes (Saved \${Math.round(result.output.ratio * 100)}%)\`);
                } else {
                    console.error(\`  ❌ Failed: \${result.error || 'Unknown error'}\`);
                    newAttachments.push(attachment);
                }
            } else {
                let error = await response.text();
                console.error(\`  ❌ HTTP Error \${response.status}: \${error}\`);
                newAttachments.push(attachment);
            }
        } catch (e) {
            console.error(\`  ❌ Request failed: \${e.message}\`);
            newAttachments.push(attachment);
        }
    }

    // Update record if we got new attachments
    if (newAttachments.length > 0) {
        await table.updateRecordAsync(record, {
            [TARGET_ATTACHMENT_FIELD]: newAttachments
        });
    }
}

console.log("🏁 Compression task completed!");`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(airtableScript);
        toast({
            title: "Copied!",
            description: "Script copied to clipboard",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.15),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

            <SEOHead
                title="Airtable Image Compression - Bulk Compress Attachments | Micro JPEG"
                description="Bulk compress Airtable image attachments automatically with our free script. No middleman needed. Fast, easy, and preserves quality."
                canonicalUrl="https://microjpeg.com/airtable-extension"
                keywords="Airtable image compression, Airtable script, bulk compress attachments, Airtable automation"
            />
            <Header />

            <div className="p-4 relative z-10">
                <div className="max-w-6xl mx-auto space-y-12 py-12">
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 rounded-full border border-teal-500/30 text-teal-400 text-sm font-medium">
                            <Zap className="w-4 h-4" />
                            <span>Airtable Script Integration</span>
                        </div>
                        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-yellow-400 bg-clip-text text-transparent leading-tight">
                            Bulk Compress Airtable <br /> Attachments Instantly
                        </h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Reduce your Airtable storage usage by up to 80% without leaving your base.
                            Our copy-paste script handles everything directly between Airtable and MicroJPEG.
                        </p>
                        <div className="flex justify-center space-x-4 pt-4">
                            <Button
                                size="lg"
                                className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 rounded-full shadow-lg shadow-teal-500/30 transition-all hover:scale-105"
                                onClick={() => {
                                    const element = document.getElementById('get-started');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                            <Link href="/api-dashboard">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-teal-500 text-teal-400 hover:bg-teal-500/10 rounded-full px-8"
                                >
                                    Get API Key
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all group">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap className="text-teal-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Blazing Fast</h3>
                                <p className="text-gray-400 text-sm">
                                    Compress hundreds of attachments in seconds using our powerful distributed infrastructure.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all group">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Shield className="text-blue-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">100% Secure</h3>
                                <p className="text-gray-400 text-sm">
                                    No middleman access. Your data travels directly between Airtable and our secure servers.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-teal-500/50 transition-all group">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <TableIcon className="text-yellow-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Native Feeling</h3>
                                <p className="text-gray-400 text-sm">
                                    Runs as a native Airtable Extension. No external tools or Zapier/Make tasks required.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* How it Works / Integration Section */}
                    <div id="get-started" className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white">How to Set Up</h2>
                            <div className="space-y-4">
                                {[
                                    { title: "Step 1: Add Extension", desc: "Open your Airtable base, click on 'Extensions' and add the 'Scripting' extension." },
                                    { title: "Step 2: Copy Script", desc: "Copy the MicroJPEG official script from the right panel." },
                                    { title: "Step 3: Add API Key", desc: "Paste your API key into the script config section. You can get one for free in your dashboard." },
                                    { title: "Step 4: Run!", desc: "Click run and watch your attachments shrink while maintaining perfect quality." }
                                ].map((step, i) => (
                                    <div key={i} className="flex space-x-4 p-4 rounded-xl hover:bg-white/5 transition-all">
                                        <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-gray-900 rounded-full flex items-center justify-center font-bold">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">{step.title}</h4>
                                            <p className="text-gray-400 text-sm">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-yellow-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <Card className="relative bg-gray-900 border-gray-800 overflow-hidden min-h-[500px]">
                                <CardHeader className="bg-gray-800 flex flex-row items-center justify-between border-b border-gray-700 py-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <span className="ml-4 text-xs font-mono text-gray-400">micro-jpeg-compress.js</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                                        onClick={copyToClipboard}
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <pre className="p-6 text-sm font-mono text-teal-300 h-[450px] overflow-y-auto custom-scrollbar bg-gray-900/50">
                                        {airtableScript}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Pricing/Usage Box */}
                    <div className="bg-gradient-to-r from-teal-900/40 to-yellow-900/20 rounded-3xl p-8 border border-teal-500/30 text-center space-y-4">
                        <h3 className="text-2xl font-bold text-white">Start for free</h3>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Free accounts get 200 compression operations per month.
                            No credit card required. Only pay if you need more.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Badge variant="outline" className="text-teal-400 py-1 px-4 border-teal-500/50">
                                200 Free Ops/mo
                            </Badge>
                            <Badge variant="outline" className="text-teal-400 py-1 px-4 border-teal-500/50">
                                No Subscription Required
                            </Badge>
                            <Badge variant="outline" className="text-teal-400 py-1 px-4 border-teal-500/50">
                                Unlimited Bases
                            </Badge>
                        </div>
                    </div>

                    {/* FAQ */}
                    <section className="space-y-8">
                        <h2 className="text-3xl font-bold text-center text-white">Frequently Asked Questions</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { q: "Is it really free?", a: "Yes, you get 200 operations every month for free. If you need more, you can upgrade to a paid tier or buy credits." },
                                { q: "Does it preserve resolution?", a: "Yes, by default it only reduces file size while keeping the same dimensions. You can customize the script if you want to resize." },
                                { q: "Can I undo compression?", a: "Airtable keeps a short history of records, but we recommend testing on a few rows first or creating a separate 'Compressed' field as shown in our script." },
                                { q: "Which formats are supported?", a: "All web-standard formats: JPEG, PNG, WebP, AVIF, and even professional RAW files!" }
                            ].map((item, i) => (
                                <Card key={i} className="bg-gray-800/30 border-gray-700/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-teal-400">{item.q}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="text-center py-12">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to optimize your workflow?</h2>
                        <Link href="/api-signup">
                            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-full px-12">
                                Get Started for Free
                            </Button>
                        </Link>
                        <p className="mt-4 text-gray-500 text-sm">No credit card required • Instant setup</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
