// client/src/pages/blog.tsx
import { SEOHead } from '@/components/SEOHead';
import { getAllBlogPosts } from '@/data/blogPosts';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import { Clock, User, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react'; // ← ADD THIS

export default function Blog() {
  const allPosts = getAllBlogPosts();
  
  const featuredPost = allPosts.find(p => p.slug === 'how-to-use-microjpeg') ?? allPosts[0];
  
  const recentPosts = allPosts
    .filter(p => p.id !== featuredPost.id)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const categories = ['Tutorials', 'Photography', 'WordPress', 'API', 'SEO'];

  // ← ADD STATE HERE (top level)
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? recentPosts
    : recentPosts.filter(p => p.category === selectedCategory);

  const seoData = {
    title: 'Image Optimization Blog - Tips, Tutorials & Best Practices | MicroJPEG',
    description: 'Expert guides on image compression, optimization techniques, and web performance.',
    keywords: 'image optimization blog, image compression tutorials, web performance tips',
  };

  return (
    <>
      <SEOHead {...seoData} canonicalUrl="https://microjpeg.com/blog" />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Image Optimization <span className="text-blue-600">Expert Blog</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Professional guides, tutorials, and best practices for image compression and web performance.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12 sm:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Featured Article</h2>
              
              <Card className="overflow-hidden shadow-lg">
                <div className="lg:flex">
                  <div className="lg:w-2/3 p-6 lg:p-8 order-2 lg:order-1">
                    <Badge className="mb-4 bg-blue-100 text-blue-800">{featuredPost.category}</Badge>
                    <h3 className="text-3xl font-bold mb-4">
                      <Link href={`/blog/${featuredPost.slug}`} className="hover:text-blue-600">
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">{featuredPost.excerpt}</p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-6">
                      <div className="flex items-center"><User className="w-4 h-4 mr-2" />{featuredPost.author}</div>
                      <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{featuredPost.readTime} min</div>
                      <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" />
                        {new Date(featuredPost.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button size="lg">Read Full Article</Button>
                    </Link>
                  </div>

                  <div className="lg:w-1/3 bg-gradient-to-br from-blue-50 to-purple-50 p-6 lg:p-8 flex flex-col items-center justify-center order-1 lg:order-2">
                    {featuredPost.image ? (
                      <img 
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full max-w-sm h-auto rounded-lg shadow-lg border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-3xl font-bold text-white">#{featuredPost.id}</span>
                      </div>
                    )}
                    <p className="mt-4 text-gray-700 font-semibold">Featured Guide</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Recent Posts with Filter */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Recent Articles</h2>
              
              <div className="flex flex-wrap gap-2">
                {['All', ...categories].map(cat => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className={`cursor-pointer h-8 px-3 ${
                      selectedCategory === cat ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
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
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 border-2 border-dashed rounded-t-xl" />
                  )}
                  <div className="p-6">
                    <Badge className="mb-3 bg-gray-100 text-gray-800">{post.category}</Badge>
                    <h3 className="font-bold text-xl mb-3 line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{post.excerpt}</p>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>{post.readTime} min read</span>
                      <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">Read Article</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">Get image optimization tips in your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 border rounded-lg" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}