
import { MetadataRoute } from 'next';

/**
 * Standardized Robots.txt
 * Specifically points to the canonical custom domain's sitemap
 * to discourage indexing of secondary domains.
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
