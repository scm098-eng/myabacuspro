'use client';

import { Share2, Link as LinkIcon, Facebook, Twitter, Linkedin, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = useState(false);

  useEffect(() => {
    // Check for native share support after mount to satisfy TS and avoid hydration mismatch
    setIsShareSupported(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const getShareUrl = () => typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(getShareUrl());
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
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

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article on My Abacus Pro: ${title}`,
          url: getShareUrl(),
        });
        return;
      } catch (err) {
        // If the user cancelled or permission denied, stop or fallback
        if ((err as Error).name === 'AbortError') {
          return;
        }
        console.warn('Native share failed, falling back to clipboard:', err);
      }
    }
    handleCopyLink();
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-4 h-4 text-[#1DA1F2]" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4 text-[#0A66C2]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-12 w-12 hover:bg-primary/10 transition-colors"
          title="Share Article"
        >
          <Share2 className="w-5 h-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        {socialPlatforms.map((platform) => (
          <DropdownMenuItem key={platform.name} asChild>
            <a 
              href={platform.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer w-full py-2"
            >
              {platform.icon}
              <span className="font-medium">{platform.name}</span>
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem 
          onClick={handleCopyLink} 
          className="flex items-center gap-2 cursor-pointer py-2"
        >
          <LinkIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Copy Link</span>
        </DropdownMenuItem>
        {isShareSupported && (
          <DropdownMenuItem 
            onClick={handleNativeShare} 
            className="flex items-center gap-2 cursor-pointer py-2 border-t mt-1 pt-3"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-xs text-muted-foreground">More Options</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}