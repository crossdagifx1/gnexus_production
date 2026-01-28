import React from 'react';
import {
    Facebook,
    Twitter,
    Linkedin,
    Copy,
    Check,
    Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareButtonsProps {
    url?: string;
    title?: string;
    description?: string;
    hashtags?: string[];
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
    url,
    title,
    description,
    hashtags = [],
}) => {
    const [copied, setCopied] = React.useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareTitle = title || document.title;
    const shareDescription = description || '';

    // Web Share API support
    const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share;

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: shareTitle,
                text: shareDescription,
                url: shareUrl,
            });
            toast.success('Shared successfully!');
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                toast.error('Failed to share');
            }
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}${hashtags.length ? `&hashtags=${hashtags.join(',')}` : ''}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    const handleSocialShare = (platform: keyof typeof shareLinks) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex items-center gap-2">
            {canUseNativeShare && (
                <Button onClick={handleNativeShare} variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            )}

            {!canUseNativeShare && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyLink}>
                            {copied ? (
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 mr-2" />
                            )}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};
