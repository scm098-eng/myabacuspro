import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/profile/', 
        '/dashboard/', 
        '/progress/', 
        '/api/',
        '/suspended/'
      ],
    },
    sitemap: 'https://myabacuspro.com/sitemap.xml',
  };
}
