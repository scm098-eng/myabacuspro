import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO & Canonical Redirection Middleware
 * 
 * Ensures all traffic is consolidated onto myabacuspro.com.
 * Performs 301 redirects for default subdomains and legacy versions.
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
  const firstPathSegment = segments[0];

  // SAFETY: If the path is empty, is a known app route, or already has the /blog/ prefix, do nothing.
  if (!firstPathSegment || knownRootPaths.has(firstPathSegment) || pathname.startsWith('/blog/')) {
    return NextResponse.next();
  }

  // 3. Robust Legacy Blog Redirect Logic
  // We only redirect if:
  // a) It is a single-level path (e.g. /how-to-calculate-fast)
  // b) It is NOT one of our known core app segments
  // This prevents multi-level app routes (like /exams/arena/paper-12) from ever being touched.
  if (segments.length === 1 && !knownRootPaths.has(firstPathSegment)) {
    url.pathname = `/blog/${firstPathSegment}`;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files (images, favicon, etc)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
