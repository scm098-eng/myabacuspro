'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article on My Abacus Pro: ${title}`,
          url: url,
        });
        return; // Success, exit function
      } catch (err) {
        // If the user cancelled, we just stop
        if ((err as Error).name === 'AbortError') {
          return;
        }
        // For any other error (like Permission Denied), we proceed to the clipboard fallback
        console.warn('Native share failed or was denied, falling back to clipboard:', err);
      }
    }

    // Fallback for browsers without share support or when permission is denied
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied!',
        description: 'The article link has been copied to your clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="rounded-full h-12 w-12 hover:bg-primary/10 transition-colors"
      onClick={handleShare}
      title="Share Article"
    >
      <Share2 className="w-5 h-5 text-primary" />
    </Button>
  );
}
