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
    // We get the URL directly on the client
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article on My Abacus Pro: ${title}`,
          url: url,
        });
      } catch (err) {
        // We ignore abort errors (when user cancels the share sheet)
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
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
