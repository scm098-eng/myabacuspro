
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO & Canonical Redirection Middleware
 * 
 * This middleware ensures that all traffic is consolidated onto the primary 
 * custom domain (myabacuspro.com). It performs 301 redirects for:
 * 1. Default Firebase subdomains (*.web.app, *.firebaseapp.com)
 * 2. WWW version (www.myabacuspro.com)
 * 
 * This resolves "Duplicate content" issues in Google Search Console and 
 * forces Google to index only the primary domain.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');

  // List of non-canonical domains that should be hidden from Search
  const nonCanonicalDomains = [
    'abacusace-mmnqw.web.app',
    'abacusace-mmnqw.firebaseapp.com',
    'www.myabacuspro.com'
  ];

  if (host && nonCanonicalDomains.includes(host)) {
    // Force protocol to https and host to primary domain
    url.protocol = 'https';
    url.host = 'myabacuspro.com';
    url.port = ''; // Ensure no port is carried over

    // 301 Permanent Redirect is critical for SEO value transfer
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
