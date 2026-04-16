
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

  // Blog path canonical check for missing /blog/ prefix in manual interlinks
  // If a path is long and doesn't match any standard route, we try to prefix it with /blog
  // (Safe only if blog slugs are unique and standard paths are known)
  const knownRootPaths = ['about', 'tests', 'blog', 'pricing', 'faq', 'contact', 'tool-preview', 'game', 'login', 'signup', 'profile', 'dashboard', 'progress', 'results', 'terms', 'privacy', 'cancellation-refund', 'subscription-success', 'suspended', 'admin'];
  const firstPathSegment = url.pathname.split('/')[1];

  if (firstPathSegment && !knownRootPaths.includes(firstPathSegment) && url.pathname.length > 20) {
     url.pathname = `/blog${url.pathname}`;
     return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
