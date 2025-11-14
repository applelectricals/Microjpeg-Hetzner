// client/src/pages/blog.tsx
import { SEOHead } from '@/components/SEOHead';
import { getAllBlogPosts } from '@/data/blogPosts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { Clock, User, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function Blog() {
  const allPosts = getAllBlogPosts();

  const featuredPost =
    allPosts.find(p => p.slug === 'how-to-use-microjpeg') ?? allPosts[0];

  const recentPosts = allPosts
    .filter(p => p.id !== featuredPost.id)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const categories = ['Tutorials', 'Photography', 'WordPress', 'API', 'SEO'];

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts =
    selectedCategory === 'All'
      ? recentPosts
      : recentPosts.filter(p => p.category === selectedCategory);

  const seoData = {
    title: 'Image Optimization Blog - Tips, Tutorials & Best Practices | MicroJPEG',
    description:
      'Expert guides on image compression, optimization techniques, and web performance.',
    keywords:
      'image optimization blog, image compression tutorials, web performance tips',
  };

  return (
    <>
      <SEOHead {...seoData} canonicalUrl="https://microjpeg.com/blog" />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        <Header />

        {/* Hero */}
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Image Optimization <span className="text-teal-400">Expert Blog</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
              Professional guides, tutorials, and best practices for image compression and web
              performance.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Featured Article</h2>

              <Card className="overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20">
                <div className="lg:flex">
                  {/* Left – content */}
                  <div className="lg:w-2/3 p-6 lg:p-8 order-2 lg:order-1">
                    <Badge className="mb-4 bg-teal-900/50 text-teal-300">
                      {featuredPost.category}
                    </Badge>

                    <h3 className="text-3xl font-bold mb-4 text-white">
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="hover:text-teal-400 transition-colors"
                      >
                        {featuredPost.title}
                      </Link>
                    </h3>

                    <p className="text-gray-300 mb-6 text-lg">{featuredPost.excerpt}</p>

                    <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {featuredPost.readTime} min
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(featuredPost.publishDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs text-teal-300 border-teal-500/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button size="lg" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white">Read Full Article</Button>
                    </Link>
                  </div>

                  {/* Right – image / badge */}
                  <div className="lg:w-1/3 bg-gray-800/30 backdrop-blur-xl p-6 lg:p-8 flex flex-col items-center justify-center order-1 lg:order-2">
                    {featuredPost.image ? (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full max-w-sm h-auto rounded-lg shadow-lg border border-teal-500/30"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-teal-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-3xl font-bold text-white">
                          #{featuredPost.id}
                        </span>
                      </div>
                    )}
                    <p className="mt-4 text-teal-300 font-semibold">Featured Guide</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Recent Posts + Filter */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Recent Articles</h2>

              <div className="flex flex-wrap gap-2">
                {['All', ...categories].map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className={`cursor-pointer h-8 px-3 ${
                      selectedCategory === cat
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 border-teal-500/50 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50"
                >
                  {/* Thumbnail */}
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700/50 border-2 border-dashed border-teal-500/30 rounded-t-xl flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}

                  {/* Card body */}
                  <div className="p-6">
                    <Badge className="mb-3 bg-teal-900/50 text-teal-300">
                      {post.category}
                    </Badge>

                    <h3 className="font-bold text-xl mb-3 line-clamp-2 text-white">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:text-teal-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-300 mb-4 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>

                    <div className="flex justify-between text-sm text-gray-400 mb-4">
                      <span>{post.readTime} min read</span>
                      <span>
                        {new Date(post.publishDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full border-teal-500/50 text-teal-300 hover:bg-teal-900/30">
                        Read Article
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Stay Updated</h2>
            <p className="text-gray-300 mb-6">
              Get image optimization tips in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 border rounded-lg bg-gray-800/50 border-teal-500/30 text-white placeholder-gray-400"
              />
              <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white">Subscribe</Button>
            </div>
          </div>
        </section>
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
    </>
  );
}