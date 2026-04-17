import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { format, isValid, parseISO } from 'date-fns';
import type { BlogPost } from '@/types';
import type { Metadata } from 'next';
import { extractFirstImage } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Math & Mastery Blog | Mental Arithmetic Insights',
  description: 'Expert training tips, scientific benefits of abacus learning, and the latest updates from My Abacus Pro.',
  openGraph: {
    title: 'My Abacus Pro Blog',
    description: 'Master mental math with our expert-led articles and training guides.',
    url: 'https://myabacuspro.com/blog',
    type: 'website',
  }
};

function normalizeDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') return val.toDate().toISOString();
  if (typeof val === 'string') {
    const parsed = parseISO(val);
    if (isValid(parsed)) return val;
  }
  if (val instanceof Date && isValid(val)) return val.toISOString();
  return new Date().toISOString();
}

async function getBlogs(): Promise<BlogPost[]> {
  try {
    const db = getFirestore(firebaseApp);
    const blogRef = collection(db, 'blogs');
    const q = query(blogRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Logic to extract image from content if dedicated field is empty or undefined
      const contentImage = extractFirstImage(data.content || '');
      return {
        id: doc.id,
        ...data,
        image: (data.image && data.image.trim() !== '') ? data.image : contentImage,
        createdAt: normalizeDate(data.createdAt)
      } as BlogPost;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to fetch blogs from Firestore:", error);
    return [];
  }
}

export default async function BlogListingPage() {
  const blogs = await getBlogs();

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black font-headline uppercase tracking-tighter text-foreground sm:text-6xl">
          Math & Mastery <span className="text-primary">Blog</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Expert insights, training tips, and news from the world of mental arithmetic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((post) => (
          <Card key={post.slug || post.id} className="flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 group border-primary/10 bg-card">
            {(post.showImage !== false) && (post.image) && (
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint="abacus education"
                />
                <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 backdrop-blur-sm uppercase font-black text-[10px] tracking-widest border-none">
                    {post.category}
                    </Badge>
                </div>
              </div>
            )}
            <CardHeader className="flex-grow">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-bold uppercase tracking-tight">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> 
                  {format(new Date(post.createdAt), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> 
                  {post.author}
                </span>
              </div>
              <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                {post.title}
              </CardTitle>
              <p className="text-muted-foreground text-sm line-clamp-3 mt-3 leading-relaxed">
                {post.excerpt}
              </p>
            </CardHeader>
            <CardFooter className="pt-0 pb-6 px-6">
              <Button asChild className="w-full font-black uppercase tracking-widest text-xs h-12 shadow-lg">
                <Link href={`/blog/${post.slug}`}>
                  Read Article <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/20">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground font-bold">New articles are coming soon!</p>
        </div>
      )}
    </div>
  );
}
