
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SEO Middleware: Redirects all traffic from default Firebase subdomains 
 * to the primary custom domain (myabacuspro.com).
 * 
 * This resolves "Duplicate without user-selected canonical" issues in GSC
 * and ensures only the custom domain appears in Google Search.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host');

  // List of non-canonical domains to redirect FROM
  const nonCanonicalDomains = [
    'abacusace-mmnqw.web.app',
    'abacusace-mmnqw.firebaseapp.com',
    'www.myabacuspro.com' // Consolidate www to non-www for clean SEO
  ];

  if (hostname && nonCanonicalDomains.includes(hostname)) {
    url.host = 'myabacuspro.com';
    // Use a 301 Permanent Redirect for SEO value transfer
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
