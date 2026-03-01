
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/dashboard/', '/api/'],
    },
    sitemap: 'https://abacusace-mmnqw.web.app/sitemap.xml',
  };
}
