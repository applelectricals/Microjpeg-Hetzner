import { useRoute } from 'wouter';
import { SEOHead } from '@/components/SEOHead';
import Header from '@/components/header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBlogPost, getAllBlogPosts } from '@/data/blogPosts';
import { Clock, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Link } from 'wouter';
import ReactMarkdown from 'react-markdown';
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function BlogPost() {
  const [, params] = useRoute('/blog/:slug');
  const post = params?.slug ? getBlogPost(params.slug) : null;
  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts.filter(p => p.id !== post?.id).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
            <p className="text-gray-300 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog">
              <Button data-testid="button-back-to-blog" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={post.seoTitle}
        description={post.seoDescription}
        keywords={post.keywords}
        canonicalUrl={`https://microjpeg.com/blog/${post.slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "datePublished": post.publishDate,
          "dateModified": post.publishDate,
          "publisher": {
            "@type": "Organization",
            "name": "MicroJPEG",
            "logo": "https://microjpeg.com/logo.png"
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 relative overflow-hidden">
        <Header />

        {/* Blog Post Header */}
        <article className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link href="/blog" className="text-teal-400 hover:text-teal-300 flex items-center transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </div>

            {/* Post Header */}
            <header className="mb-12">
              <div className="mb-4">
                <Badge className="bg-teal-900/50 text-teal-300 mb-4">
                  {post.category}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                {post.excerpt}
              </p>

              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {post.readTime} min read
                </div>
                <div className="flex items-center">
                  {new Date(post.publishDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-teal-300 border-teal-500/50">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.excerpt,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                data-testid="button-share-post"
                className="border-teal-500/50 text-teal-300 hover:bg-teal-900/30 transition-all"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </header>

            {/* Post Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3 text-white">{children}</h3>,
                  p: ({ children }) => <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 pl-6 list-disc text-gray-300">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 pl-6 list-decimal text-gray-300">{children}</ol>,
                  li: ({ children }) => <li className="mb-2 text-gray-300">{children}</li>,
                  code: ({ inline, children }) => {
                  return inline ? (
                  <code className="bg-gray-800/50 px-2 py-1 rounded text-sm font-mono text-teal-300 border border-teal-500/30">
                  {children}
                  </code>
                  ) : (
                  <pre className="bg-gray-800/80 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 text-sm leading-relaxed font-mono border border-teal-500/20">
                  <code>{children}</code>
                  </pre>
                  );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-300 my-4 bg-gray-800/30 py-3 rounded-r">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* CTA Section */}
            <Card className="p-8 bg-gradient-to-r from-teal-900/50 to-teal-800/50 border-2 border-teal-500/50 mb-12 hover:shadow-lg hover:shadow-teal-500/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-white">Ready to Optimize Your Images?</h3>
                <p className="text-gray-300 mb-6">
                  Try our professional image compression service with advanced algorithms
                  and support for 13+ formats.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/50 transform hover:scale-105 transition-all text-white" data-testid="button-try-compressor">
                  Try MicroJPEG Compressor
                </Button>
              </div>
            </Card>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 bg-gray-800/30 backdrop-blur-xl border-t border-teal-500/30">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-white">Related Articles</h2>

              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg hover:shadow-teal-500/20 transition-all bg-gray-800/50 backdrop-blur-xl border-2 border-teal-500/50">
                    <div className="p-6">
                      <Badge className="mb-3 bg-teal-900/50 text-teal-300">
                        {relatedPost.category}
                      </Badge>

                      <h3 className="font-bold text-lg mb-3 line-clamp-2 text-white">
                        <Link
                          href={`/blog/${relatedPost.slug}`}
                          className="hover:text-teal-400 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>

                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {relatedPost.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{relatedPost.readTime} min read</span>
                        <span>
                          {new Date(relatedPost.publishDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
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
    </>
  );
}