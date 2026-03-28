'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog-posts';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function BlogPostPage() {
  usePageBackground('');
  const { slug } = useParams();
  const router = useRouter();
  
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Article not found.</h1>
        <Button onClick={() => router.push('/blog')} className="mt-4">Back to Blog</Button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button asChild variant="ghost" className="hover:bg-primary/5">
        <Link href="/blog">
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Blog
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm font-black uppercase tracking-widest text-primary">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1">
            {post.category}
          </Badge>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {post.date}</span>
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter leading-tight">
          {post.title}
        </h1>
      </div>

      <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <div 
            className="prose prose-lg max-w-none prose-primary text-slate-700 leading-relaxed font-medium"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <Separator className="my-12" />
          
          <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-primary/10">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Written By</p>
              <p className="text-lg font-bold">{post.author}</p>
            </div>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-primary to-orange-600 p-8 rounded-[2rem] text-white shadow-xl sticky top-24">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Start Training Now</h3>
            <p className="text-white/80 font-bold mb-6 text-sm">Join thousands of students and become a Human Calculator.</p>
            <Button asChild className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest h-14 rounded-xl text-xs">
              <Link href="/signup">Join For Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
