import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO & Canonical Redirection Middleware
 * 
 * Ensures all traffic is consolidated onto myabacuspro.com.
 * Performs redirects for default subdomains and handles legacy blog routing.
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
  // These paths should NEVER live under the /blog/ prefix.
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

  // Safety Check: Next.js internals, API, and assets
  if (
    !firstPathSegment || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 3. Fix "Incorrect Blog Prefix" Error
  // If the URL is /blog/practice-features (as seen in user screenshot), 
  // we must redirect it BACK to /practice-features where the page exists.
  if (pathname.startsWith('/blog/') && segments.length === 2) {
    const slug = segments[1].toLowerCase();
    if (knownRootPaths.has(slug)) {
      url.pathname = `/${slug}`;
      return NextResponse.redirect(url, 307);
    }
  }

  // 4. Legacy Blog Slug Logic
  // For single-level paths (e.g. /my-post), if it's NOT a core app route, 
  // we assume it's an old blog link and prefix it.
  if (segments.length === 1) {
    if (knownRootPaths.has(firstPathSegment)) {
      return NextResponse.next();
    } else {
      url.pathname = `/blog/${firstPathSegment}`;
      // Using 307 to avoid caching issues during fixes
      return NextResponse.redirect(url, 307);
    }
  }

  // Multi-level paths like /exams/arena/paper-10 are untouched by the redirect engine
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files (images, favicon, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
