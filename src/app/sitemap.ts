
import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://myabacuspro.com';
  
  const routes = [
    '',
    '/about',
    '/tests',
    '/tests/beads-value',
    '/tests/basic',
    '/tests/small-sister',
    '/tests/big-brother',
    '/tests/combination',
    '/tests/practice',
    '/blog',
    '/pricing',
    '/faq',
    '/contact',
    '/tool-preview',
    '/game',
    '/terms',
    '/privacy',
    '/cancellation-refund',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes];
}
