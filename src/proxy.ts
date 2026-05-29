import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO & Canonical Redirection Proxy
 * 
 * Ensures all traffic is consolidated onto myabacuspro.com.
 * Performs redirects for default subdomains and handles legacy blog routing safely.
 */
export function proxy(request: NextRequest) {
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
  // These paths should NEVER be intercepted or prefixed with /blog/.
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
  // If the URL already has /blog/ but points to a core page, redirect BACK to the root.
  if (pathname.startsWith('/blog/') && segments.length === 2) {
    const slug = segments[1].toLowerCase();
    if (knownRootPaths.has(slug)) {
      url.pathname = `/${slug}`;
      return NextResponse.redirect(url, 307);
    }
  }

  // 4. Legacy Blog Slug Logic
  // ONLY redirect root-level slugs that are NOT known app routes.
  // This ensures multi-level paths like /exams/arena/paper-10 are NEVER touched.
  if (segments.length === 1) {
    if (!knownRootPaths.has(firstPathSegment)) {
      url.pathname = `/blog/${firstPathSegment}`;
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files (images, favicon, etc)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
