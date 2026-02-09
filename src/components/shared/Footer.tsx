
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-card/95 backdrop-blur-sm shadow-inner mt-auto border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
             <Link href="/" className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <Logo />
             </Link>
             <p className="mt-2 text-sm text-muted-foreground max-w-xs">Sharpen your mind and boost your calculation speed.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              <div>
                  <h2 className="mb-6 text-sm font-semibold text-foreground uppercase">Navigate</h2>
                  <ul className="text-muted-foreground font-medium">
                      <li className="mb-4"><Link href="/" className="hover:text-primary">Home</Link></li>
                      <li className="mb-4"><Link href="/about" className="hover:text-primary">About Us</Link></li>
                      <li className="mb-4"><Link href="/tests" className="hover:text-primary">Practice Tests</Link></li>
                      <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                  </ul>
              </div>
              <div>
                  <h2 className="mb-6 text-sm font-semibold text-foreground uppercase">Support</h2>
                  <ul className="text-muted-foreground font-medium">
                      <li className="mb-4"><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                      <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                  </ul>
              </div>
              <div>
                  <h2 className="mb-6 text-sm font-semibold text-foreground uppercase">Legal</h2>
                  <ul className="text-muted-foreground font-medium">
                      <li className="mb-4"><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                      <li className="mb-4"><Link href="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
                      <li><Link href="/cancellation-refund" className="hover:text-primary">Cancellation & Refund</Link></li>
                  </ul>
              </div>
          </div>
        </div>
        <hr className="my-6 border-border sm:mx-auto lg:my-8" />
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} My Abacus Pro™. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
