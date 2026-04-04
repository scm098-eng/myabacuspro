
import { MetadataRoute } from 'next';
import { getFirestoreDb } from '@/lib/firebase-admin';

/**
 * Dynamic Sitemap Generator
 * Ensures all paths point to the canonical custom domain.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://myabacuspro.com';
  
  // 1. Define static routes
  const staticPaths = [
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
  ];

  const routes = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Fetch dynamic blog routes from Firestore
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = getFirestoreDb();
    const snapshot = await db.collection('blogs').get();
    
    blogRoutes = snapshot.docs.map((doc) => {
      const data = doc.data();
      const lastMod = data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.createdAt?.toDate ? data.createdAt.toDate() : new Date());
      
      return {
        url: `${baseUrl}/blog/${data.slug || doc.id}`,
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error("Sitemap generation error (blogs):", error);
  }

  return [...routes, ...blogRoutes];
}
