import { useEffect, useLayoutEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: any;
  authoritative?: boolean;
}

// Use useLayoutEffect on client, useEffect on server (SSR safety)
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function SEOHead({
  title,
  description,
  keywords,
  ogImage = '/og-default.jpg',
  canonicalUrl,
  structuredData,
  authoritative = false
}: SEOHeadProps) {
  
  // Use useLayoutEffect for synchronous DOM updates (runs before paint)
  // This ensures meta tags are set BEFORE Puppeteer captures the HTML
  useIsomorphicLayoutEffect(() => {
    // If authoritative, mark this as the primary SEO source
    if (authoritative) {
      (window as any).__seo_authoritative = true;
    }

    // Set document title immediately
    document.title = title;
    
    // Helper to set meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    
    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', 'website', true);
    if (canonicalUrl) {
      setMetaTag('og:url', canonicalUrl, true);
    }
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);
    
    // CRITICAL FIX: Canonical URL - Remove any existing and set the correct one
    if (canonicalUrl) {
      // Remove ALL existing canonical links first (there might be a default one)
      const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
      existingCanonicals.forEach(link => link.remove());
      
      // Create new canonical link
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      document.head.appendChild(link);
    }
    
    // Structured Data - Remove existing and add new
    if (structuredData) {
      // Remove existing structured data scripts to avoid duplicates
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());
      
      // Handle array of structured data objects
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      
      dataArray.forEach((data, index) => {
        if (data) {
          const script = document.createElement('script');
          script.setAttribute('type', 'application/ld+json');
          script.setAttribute('data-seo-index', String(index));
          script.textContent = JSON.stringify(data);
          document.head.appendChild(script);
        }
      });
    }

    // Cleanup function
    return () => {
      // Don't cleanup on unmount - we want SEO tags to persist
      // This prevents flashing during navigation
    };
  }, [title, description, keywords, ogImage, canonicalUrl, structuredData, authoritative]);

  return null;
}
