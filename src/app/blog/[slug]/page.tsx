
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { format } from 'date-fns';
import type { BlogPost } from '@/types';
import { ShareButton } from '@/components/blog/ShareButton';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
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
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
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

  return (
    <article className="max-w-4xl mx-auto space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button asChild variant="ghost" className="hover:bg-primary/5">
        <Link href="/blog">
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Blog
        </Link>
      </Button>

      <div className="space-y-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> 
            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" /> 
            {post.author}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter leading-tight text-slate-900">
          {post.title}
        </h1>
      </div>

      <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20">
        <Image
          src={post.image || 'https://picsum.photos/seed/math/1200/600'}
          alt={post.title}
          fill
          className="object-cover"
          priority
          data-ai-hint="abacus learning"
        />
      </div>

      <div className="james-clear-style px-4 sm:px-0">
        <div 
          className="content-area"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="cta-section">
          <h4>Ready to master mental math?</h4>
          <p className="text-lg mb-4">Join thousands of students building lightning-fast calculation skills on our digital platform.</p>
          <Link href="/signup">Try our free abacus practice tool here</Link>
        </div>

        <Separator className="my-12" />
        
        <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-primary/10 mb-12">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Written By</p>
            <p className="text-lg font-bold text-slate-900">{post.author}</p>
          </div>
          <ShareButton title={post.title} />
        </div>
      </div>
    </article>
  );
}
