import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO & Canonical Redirection Middleware
 * 
 * Ensures all traffic is consolidated onto myabacuspro.com.
 * Performs redirects for default subdomains and legacy versions.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const pathname = url.pathname;

  // 1. Domain Canonicalization
  const nonCanonicalDomains = [
    'abacusace-mmnqw.web.app',
    'abacusace-mmnqw.firebaseapp.com',
    'www.myabacuspro.com'
  ];

  if (host && nonCanonicalDomains.includes(host)) {
    url.protocol = 'https';
    url.host = 'myabacuspro.com';
    url.port = ''; 

    return NextResponse.redirect(url, 301);
  }

  // 2. Define Core Application Routes
  // These are the root paths that should NEVER be redirected to the blog.
  const knownRootPaths = new Set([
    'about', 
    'tests', 
    'blog', 
    'pricing', 
    'faq', 
    'contact', 
    'tool-preview', 
    'game', 
    'login', 
    'signup', 
    'profile', 
    'dashboard', 
    'progress', 
    'results', 
    'terms', 
    'privacy', 
    'cancellation-refund', 
    'subscription-success', 
    'suspended', 
    'admin', 
    'exams', 
    'api', 
    'practice-features',
    '_next', 
    'favicon.ico'
  ]);
  
  const segments = pathname.split('/').filter(Boolean);
  const firstPathSegment = segments[0]?.toLowerCase();

  // SAFETY CHECKS:
  // - If the path is empty (homepage)
  // - If it's already a blog path
  // - If it's a known core application route
  // - If it's an internal Next.js path or API
  if (
    !firstPathSegment || 
    pathname.startsWith('/blog/') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    knownRootPaths.has(firstPathSegment)
  ) {
    return NextResponse.next();
  }

  // 3. Robust Legacy Blog Redirect Logic
  // We only redirect if it is a single-level path (a "slug") that isn't in our whitelist.
  // This ensures that multi-level paths (like /exams/arena/paper-10) remain untouched.
  if (segments.length === 1 && !knownRootPaths.has(firstPathSegment)) {
    url.pathname = `/blog/${firstPathSegment}`;
    // Using 307 (Temporary Redirect) for now to prevent browser caching while we verify the fix.
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files (images, favicon, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
