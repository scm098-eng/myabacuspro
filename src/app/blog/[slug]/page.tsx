import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { format, isValid, parseISO } from 'date-fns';
import type { BlogPost } from '@/types';
import { ShareButton } from '@/components/blog/ShareButton';
import type { Metadata } from 'next';
import { cn, extractFirstImage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function normalizeDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') return val.toDate().toISOString();
  if (typeof val === 'string' && isValid(parseISO(val))) return val;
  if (val instanceof Date && isValid(val)) return val.toISOString();
  return new Date().toISOString();
}

function getBlogTheme(post: BlogPost) {
  const layout = post.layout || 'standard';
  const fontFamily = post.fontFamily || 'serif';
  const spacing = post.lineSpacing || 'relaxed';
  const dropCap = post.dropCap !== undefined ? post.dropCap : true;
  const imagePos = post.imagePosition || 'top';
  const imageFit = post.imageFit || 'cover';
  const headlineWeight = post.headlineWeight || 'black';
  const headlineCase = post.headlineCase || 'normal';
  const headlineSpacing = post.headlineSpacing || 'normal';

  return {
    container: cn(
      "mx-auto transition-all duration-700",
      layout === 'centered' ? "max-w-3xl px-6" : layout === 'magazine' ? "max-w-5xl px-4" : layout === 'columns' ? "max-w-6xl px-4" : "max-w-4xl px-4"
    ),
    header: cn(
      "space-y-6 mb-12",
      layout === 'centered' ? "text-center" : "text-left"
    ),
    headline: cn(
      "text-4xl md:text-6xl tracking-tight leading-tight text-slate-900 drop-shadow-sm",
      headlineWeight === 'black' ? "font-black" : headlineWeight === 'medium' ? "font-medium" : "font-bold",
      headlineCase === 'uppercase' ? "uppercase" : "normal-case",
      headlineSpacing === 'tight' ? "tracking-tighter" : headlineSpacing === 'wide' ? "tracking-widest" : "tracking-normal",
      fontFamily === 'serif' || fontFamily === 'elegant' ? "font-serif" : "font-headline"
    ),
    content: cn(
      "james-clear-style prose prose-slate lg:prose-xl dark:prose-invert max-w-none",
      fontFamily === 'serif' ? "font-serif" : fontFamily === 'elegant' ? "font-elegant" : fontFamily === 'impact' ? "font-impact" : "font-sans",
      spacing === 'tight' ? "leading-snug" : spacing === 'relaxed' ? "leading-relaxed" : spacing === 'wide' ? "leading-loose" : "leading-normal",
      dropCap && "drop-cap-enabled",
      layout === 'columns' && "md:columns-2 md:gap-12"
    ),
    imageContainer: cn(
      "relative overflow-hidden shadow-2xl mb-8 bg-slate-50 border",
      imagePos === 'top' ? "aspect-[3/2] w-full rounded-[2.5rem]" : "aspect-[2/3] w-full md:w-1/3 rounded-2xl",
      imagePos === 'left' && "md:float-left md:mr-10",
      imagePos === 'right' && "md:float-right md:ml-10"
    ),
    imageFit: imageFit === 'contain' ? 'object-contain' : 'object-cover'
  };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const db = getFirestore(firebaseApp);
    const blogRef = collection(db, 'blogs');
    const q = query(blogRef, where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    const contentImage = extractFirstImage(data.content || '');
    return { 
      id: doc.id, 
      ...data, 
      image: (data.image && data.image.trim() !== '') ? data.image : contentImage,
      createdAt: normalizeDate(data.createdAt) 
    } as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getRelatedPosts(category: string, currentId: string): Promise<BlogPost[]> {
  try {
    const db = getFirestore(firebaseApp);
    const blogRef = collection(db, 'blogs');
    const q = query(blogRef, where('category', '==', category), limit(4));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => {
        const data = doc.data();
        const contentImage = extractFirstImage(data.content || '');
        return { 
          id: doc.id, 
          ...data,
          image: (data.image && data.image.trim() !== '') ? data.image : contentImage
        } as BlogPost;
      })
      .filter(p => p.id !== currentId)
      .slice(0, 3);
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://myabacuspro.com/blog/${slug}`,
    },
    openGraph: { 
      title: post.title, 
      description: post.excerpt, 
      url: `https://myabacuspro.com/blog/${slug}`,
      images: [post.image || 'https://picsum.photos/seed/math/1200/600'] 
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  
  const relatedPosts = await getRelatedPosts(post.category, post.id);
  const theme = getBlogTheme(post);

  return (
    <article className="py-12">
      <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-700", theme.container)}>
        <Button asChild variant="ghost" className="mb-8 hover:bg-primary/5 rounded-full px-6">
          <Link href="/blog">
            <ChevronLeft className="mr-2 w-4 h-4" /> Back to Blog
          </Link>
        </Button>
        
        <div className={theme.header}>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full">{post.category}</Badge>
            <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> {format(new Date(post.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
              <User className="w-3 h-3" /> {post.author}
            </span>
          </div>
          <h1 className={theme.headline}>{post.title}</h1>
        </div>

        <div className="clearfix">
          {post.layout !== 'minimalist' && (post.showImage !== false) && post.image && (
            <div className={theme.imageContainer}>
              <Image src={post.image} alt={post.title} fill className={theme.imageFit} priority data-ai-hint="abacus learning" />
            </div>
          )}
          <div className={theme.content} dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="max-w-[700px] mx-auto mt-20">
          <div className="cta-section bg-gradient-to-br from-primary/5 to-transparent p-10 rounded-[2.5rem] border border-primary/10">
            <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">Ready to master mental math?</h4>
            <p className="text-lg font-medium text-slate-600 mb-8">Join thousands of students building lightning-fast calculation skills on our digital platform.</p>
            <Button asChild size="lg" className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl hover:scale-105 transition-transform">
              <Link href="/signup">Try Our Free Practice Tool</Link>
            </Button>
          </div>
          
          <Separator className="my-16" />
          
          <div className="flex justify-between items-center bg-slate-900 p-8 rounded-3xl shadow-2xl border border-white/10 mb-12 text-white">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Written By</p>
              <p className="text-2xl font-black tracking-tight font-headline">{post.author}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold opacity-60 uppercase tracking-widest hidden sm:block">Share Article</span>
              <ShareButton title={post.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="bg-muted/30 py-20 mt-20 border-y">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-black uppercase tracking-tighter font-headline">More in <span className="text-primary">{post.category}</span></h3>
              <p className="text-muted-foreground font-medium">Continue your learning journey with these related articles.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Card key={related.id} className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-all group">
                  {(related.showImage !== false) && (related.image) && (
                    <div className="relative aspect-[3/2] overflow-hidden">
                        <Image src={related.image} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{related.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2">{related.excerpt}</p>
                  </CardContent>
                  <CardContent className="pt-0 pb-6">
                    <Button asChild variant="link" className="p-0 h-auto font-black uppercase tracking-widest text-[10px]">
                      <Link href={`/blog/${related.slug}`}>
                        Read Now <ArrowRight className="ml-1 w-3 h-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
