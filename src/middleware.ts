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

  // 2. Blog path canonical check for missing /blog/ prefix in manual interlinks
  // This logic is intended for legacy SEO links that don't have the /blog/ prefix.
  // We MUST exclude core app routes to prevent 404s like /exams/arena/paper-10.
  const knownRootPaths = [
    'about', 'tests', 'blog', 'pricing', 'faq', 'contact', 'tool-preview', 
    'game', 'login', 'signup', 'profile', 'dashboard', 'progress', 'results', 
    'terms', 'privacy', 'cancellation-refund', 'subscription-success', 'suspended', 
    'admin', 'exams', 'api', '_next', 'favicon.ico'
  ];
  
  const segments = pathname.split('/').filter(Boolean);
  const firstPathSegment = segments[0];

  // If it's a known app route or already starts with /blog, do nothing.
  if (!firstPathSegment || knownRootPaths.includes(firstPathSegment)) {
     return NextResponse.next();
  }

  // Only redirect unknown long paths (likely old blog slugs) to the /blog/ prefix
  if (pathname.length > 20 && !pathname.startsWith('/blog/')) {
     url.pathname = `/blog${pathname}`;
     return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
