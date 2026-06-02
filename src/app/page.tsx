'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Zap, Target, ArrowRight, Loader2, BookOpen, Calendar, Rocket } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import placeholderImages from '@/lib/placeholder-images.json';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { format } from 'date-fns';
import type { BlogPost } from '@/types';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" aria-hidden="true" />,
    title: 'Timed Challenges',
    description: 'Test your speed and accuracy against the clock. Complete up to 150 questions in our hardest levels.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />,
    title: 'Multiple Test Types',
    description: 'Practice Addition, Subtraction, Multiplication, and Division across various difficulty levels.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" aria-hidden="true" />,
    title: 'Focus on Improvement',
    description: 'Track your progress with detailed reports and focus on honing your mental math skills.',
  },
];

export default function Home() {
  usePageBackground('');
  const { user } = useAuth();
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const db = getFirestore(firebaseApp);
        const blogRef = collection(db, 'blogs');
        const q = query(blogRef, orderBy('createdAt', 'desc'), limit(6));
        const snapshot = await getDocs(q);
        const fetchedBlogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as BlogPost));
        setLatestBlogs(fetchedBlogs);
      } catch (error) {
        console.error("Failed to fetch homepage blogs:", error);
      } finally {
        setBlogsLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="space-y-24">
      <section aria-labelledby="hero-heading">
        <div className="space-y-6 text-center">
          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-foreground font-headline uppercase">
            Master Mental Math with <span className="text-primary">My Abacus Pro</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium">
            Sharpen your mind and boost your calculation speed. The ultimate digital training ground for ancient math techniques.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl">
              <Link href={user ? "/tests" : "/practice-features"}>
                Explore Features <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg font-black rounded-2xl">
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full" aria-label="Visual Preview">
         <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden border-4 border-primary/20 shadow-2xl">
             <Image 
                src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/abacus_hero.webp?alt=media"
                alt="Student using My Abacus Pro for learning mental math"
                fill
                className="object-cover"
                data-ai-hint="abacus education"
                priority
             />
         </div>
      </section>

      <section className="w-full" aria-labelledby="features-heading">
        <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-black font-headline uppercase tracking-tight">Why Choose <span className="text-primary">Our Platform</span>?</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto font-medium text-lg">We turn traditional practice into an engaging, timed challenge for modern students.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-none rounded-3xl bg-card/50 backdrop-blur-sm p-4">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-5 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="mt-4 font-black uppercase text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="w-full bg-slate-900 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Join the Elite Race</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Our Hall of Fame celebrates the top students worldwide every week. Start your practice streak today and climb the ranks.
          </p>
          <Button asChild className="h-14 px-12 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-transform">
             <Link href="/signup"><Rocket className="mr-2 h-5 w-5" /> Start Your Journey</Link>
          </Button>
        </div>
      </section>

      <section className="w-full" aria-labelledby="blog-heading">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <div className="text-center md:text-left">
              <h2 id="blog-heading" className="text-3xl font-black font-headline uppercase tracking-tight">Latest from our <span className="text-primary">Blog</span></h2>
              <p className="text-muted-foreground font-medium text-lg">Expert training tips and mental arithmetic insights.</p>
            </div>
            <Button asChild variant="outline" className="h-12 rounded-full border-primary/20 hover:border-primary text-primary px-8 font-black uppercase tracking-widest text-xs">
              <Link href="/blog">View All Articles <BookOpen className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {blogsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestBlogs.map((post) => (
                <Card key={post.id} className="flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 group border-primary/5 bg-card rounded-3xl">
                  {post.image && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        data-ai-hint="abacus blog"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 backdrop-blur-sm uppercase font-black text-[9px] tracking-widest border-none">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader className="flex-grow space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 
                        {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>
                  </CardHeader>
                  <CardFooter className="pt-0 pb-8 px-6">
                    <Button asChild variant="link" className="p-0 h-auto font-black uppercase tracking-widest text-[10px] text-primary">
                      <Link href={`/blog/${post.slug || post.id}`} className="flex items-center">
                        Read Story <ArrowRight className="ml-1 w-3 h-3" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
