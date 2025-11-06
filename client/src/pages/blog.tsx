// client/src/pages/blog.tsx
import { SEOHead } from '@/components/SEOHead';
import { getAllBlogPosts } from '@/data/blogPosts';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { Clock, User, Calendar } from 'lucide-react';
import { Link } from 'wouter';

export default function Blog() {
  const allPosts = getAllBlogPosts();
  
  // Feature "How to Use MicroJPEG" — fallback to first post
  const featuredPost = allPosts.find(p => p.slug === 'how-to-use-microjpeg') ?? allPosts[0];
  
  // Exclude featured post from recent list
  const recentPosts = allPosts
    .filter(p => p.id !== featuredPost.id)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 6);

  const categories = ['Tutorials', 'Photography', 'WordPress', 'API', 'SEO'];

  const seoData = {
    title: 'Image Optimization Blog - Tips, Tutorials & Best Practices | MicroJPEG',
    description: 'Expert guides on image compression, optimization techniques, and web performance. Learn from professionals about JPEG, PNG, WebP optimization and more.',
    keywords: 'image optimization blog, image compression tutorials, web performance tips, JPEG optimization guide, image SEO best practices',
  };

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://microjpeg.com/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "MicroJPEG Blog",
          "description": "Expert guides on image optimization and compression",
          "publisher": {
            "@type": "Organization",
            "name": "MicroJPEG"
          }
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Image Optimization <span className="text-blue-600">Expert Blog</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Professional guides, tutorials, and best practices for image compression, 
                optimization, and web performance. Learn from industry experts.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post */}
{featuredPost && (
  <section className="py-12 sm:py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Featured Article</h2>
      
      <Card className="overflow-hidden shadow-lg">
        <div className="lg:flex">
          {/* Left: Content */}
          <div className="lg:w-2/3 p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              {featuredPost.category}
            </Badge>
            
            <h3 className="text-3xl font-bold mb-4">
              <Link 
                href={`/blog/${featuredPost.slug}`}
                className="hover:text-blue-600 transition-colors"
                data-testid={`link-featured-post-${featuredPost.id}`}
              >
                {featuredPost.title}
              </Link>
            </h3>
            
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              {featuredPost.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {featuredPost.author}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {featuredPost.readTime} min read
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(featuredPost.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {featuredPost.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-gray-600 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <Link href={`/blog/${featuredPost.slug}`}>
              <Button size="lg" data-testid="button-read-featured">
                Read Full Article
              </Button>
            </Link>
          </div>

          {/* Right: Image / Badge */}
          <div className="lg:w-1/3 bg-gradient-to-br from-blue-50 to-purple-50 p-6 lg:p-8 flex flex-col items-center justify-center order-1 lg:order-2">
            {featuredPost.image ? (
              <div className="w-full max-w-sm mx-auto">
                <img 
                  src={featuredPost.image}
                  alt={`${featuredPost.title} - featured tutorial`}
                  className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-white">#{featuredPost.id}</span>
              </div>
            )}
            <p className="mt-4 text-gray-700 font-semibold text-center">Featured Guide</p>
          </div>
        </div>
      </Card>
    </div>
  </section>
)}

        {/* Recent Posts */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Recent Articles</h2>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 h-8 px-3">
                  All
                </Badge>
                {categories.map((category) => (
                  <Badge 
                    key={category}
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50 h-8 px-3"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {recentPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <Badge className="mb-3 bg-gray-100 text-gray-800">
                      {post.category}
                    </Badge>
                    
                    <h3 className="font-bold text-xl mb-3 line-clamp-2">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                        data-testid={`link-post-${post.id}`}
                      >
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{post.readTime} min read</span>
                      <span>
                        {new Date(post.publishDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full" data-testid={`button-read-${post.id}`}>
                        Read Article
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Get the latest tips and tutorials on image optimization delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                data-testid="input-newsletter-email"
              />
              <Button className="h-12 sm:h-10 px-6 text-base sm:text-sm" data-testid="button-subscribe-newsletter">
                Subscribe
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}