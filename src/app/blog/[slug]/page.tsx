
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { format, isValid, parseISO } from 'date-fns';
import type { BlogPost } from '@/types';
import { ShareButton } from '@/components/blog/ShareButton';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Normalizes date input to an ISO string.
 */
function normalizeDate(val: any): string {
  if (!val) return new Date().toISOString();
  if (val && typeof val.toDate === 'function') return val.toDate().toISOString();
  if (typeof val === 'string' && isValid(parseISO(val))) return val;
  if (val instanceof Date && isValid(val)) return val.toISOString();
  return new Date().toISOString();
}

/**
 * Determines styles based on deterministic seed (slug) or manual settings.
 * Ensures every blog has a unique "identity".
 */
function getBlogTheme(post: BlogPost) {
  // Deterministic styles based on title length or slug
  const seed = post.slug.length;
  
  const layout = post.layout || (seed % 3 === 0 ? 'centered' : seed % 2 === 0 ? 'magazine' : 'standard');
  const fontFamily = post.fontFamily || (seed % 3 === 0 ? 'serif' : seed % 2 === 0 ? 'sans' : 'modern');
  const spacing = post.lineSpacing || (seed % 2 === 0 ? 'relaxed' : 'wide');
  const dropCap = post.dropCap !== undefined ? post.dropCap : true;

  // Headline Identity Logic
  const headlineWeight = post.headlineWeight || (seed % 2 === 0 ? 'black' : 'bold');
  const headlineCase = post.headlineCase || (seed % 3 === 0 ? 'uppercase' : 'normal');
  const headlineSpacing = post.headlineSpacing || (seed % 2 === 0 ? 'tight' : 'normal');

  return {
    container: cn(
      "mx-auto transition-all duration-700",
      layout === 'centered' ? "max-w-3xl px-6" : layout === 'magazine' ? "max-w-5xl px-4" : "max-w-4xl px-4"
    ),
    header: cn(
      "space-y-6 mb-12",
      layout === 'centered' ? "text-center" : "text-left"
    ),
    headline: cn(
      "text-4xl md:text-6xl font-headline tracking-tighter leading-none text-slate-900 drop-shadow-sm",
      headlineWeight === 'black' ? "font-black" : "font-bold",
      headlineCase === 'uppercase' ? "uppercase" : "normal-case",
      headlineSpacing === 'tight' ? "tracking-tighter" : headlineSpacing === 'wide' ? "tracking-widest" : "tracking-normal"
    ),
    content: cn(
      "prose prose-slate lg:prose-xl dark:prose-invert max-w-none",
      fontFamily === 'serif' ? "font-serif" : fontFamily === 'modern' ? "font-headline tracking-tight" : "font-sans",
      spacing === 'relaxed' ? "leading-relaxed" : spacing === 'wide' ? "leading-loose" : "leading-normal",
      dropCap && "drop-cap-enabled"
    ),
    image: cn(
      "relative w-full overflow-hidden shadow-2xl mb-12",
      layout === 'magazine' ? "aspect-[21/9] rounded-3xl" : "aspect-video rounded-[2.5rem]"
    )
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
    return {
      id: doc.id,
      ...data,
      createdAt: normalizeDate(data.createdAt)
    } as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) return { title: 'Article Not Found' };
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image || 'https://picsum.photos/seed/math/1200/600'],
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const theme = getBlogTheme(post);

  return (
    <article className={cn("py-12 animate-in fade-in slide-in-from-bottom-4 duration-700", theme.container)}>
      <Button asChild variant="ghost" className="mb-8 hover:bg-primary/5 rounded-full px-6">
        <Link href="/blog">
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Blog
        </Link>
      </Button>

      <div className={theme.header}>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Badge className="bg-primary text-white border-none px-4 py-1.5 rounded-full">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3" /> 
            {format(new Date(post.createdAt), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
            <User className="w-3 h-3" /> 
            {post.author}
          </span>
        </div>
        
        <h1 className={theme.headline}>
          {post.title}
        </h1>
      </div>

      <div className={theme.image}>
        <Image
          src={post.image || 'https://picsum.photos/seed/math/1200/600'}
          alt={post.title}
          fill
          className="object-cover"
          priority
          data-ai-hint="abacus learning"
        />
      </div>

      <div className="james-clear-style">
        <div 
          className={theme.content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="cta-section bg-gradient-to-br from-primary/5 to-transparent p-10 rounded-[2.5rem] border border-primary/10 mt-20">
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
    </article>
  );
}
