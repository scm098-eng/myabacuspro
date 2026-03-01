
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://abacusace-mmnqw.web.app';
  
  const routes = [
    '',
    '/about',
    '/tests',
    '/pricing',
    '/faq',
    '/contact',
    '/tool-preview',
    '/terms',
    '/privacy',
    '/cancellation-refund',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
