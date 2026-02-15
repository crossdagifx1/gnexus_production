import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { nexus } from '@/lib/api/nexus-core';

interface ShareDialogProps {
    conversationId: string;
    conversationTitle: string;
}

export function ShareDialog({ conversationId, conversationTitle }: ShareDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [accessLevel, setAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');
    const [enableExpiry, setEnableExpiry] = useState(false);
    const [expiryDays, setExpiryDays] = useState(7);
    const [copied, setCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateShareLink = async () => {
        setIsGenerating(true);

        try {
            const expiresAt = enableExpiry
                ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
                : null;

            const response = await fetch('/api.php?action=share_conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    conversation_id: conversationId,
                    access_level: accessLevel,
                    expires_at: expiresAt
                })
            });

            const data = await response.json();

            if (data.success) {
                setShareUrl(data.data.shareUrl);
                toast.success('Share link generated');
            } else {
                throw new Error(data.error || 'Failed to generate link');
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Conversation</DialogTitle>
                    <DialogDescription>
                        Share "{conversationTitle}" with others
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Access Level */}
                    <div className="space-y-2">
                        <Label htmlFor="access-level">Access Level</Label>
                        <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                            <SelectTrigger id="access-level">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="view">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">View Only</div>
                                            <div className="text-xs text-muted-foreground">
                                                Can read messages
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="comment">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">Can Comment</div>
                                            <div className="text-xs text-muted-foreground">
                                                Can add comments
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="edit">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <div>
                                            <div className="font-medium">Can Edit</div>
                                            <div className="text-xs text-muted-foreground">
                                                Full access
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="enable-expiry">Link Expiration</Label>
                            <div className="text-xs text-muted-foreground">
                                Auto-expire link after set days
                            </div>
                        </div>
                        <Switch
                            id="enable-expiry"
                            checked={enableExpiry}
                            onCheckedChange={setEnableExpiry}
                        />
                    </div>

                    {enableExpiry && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2"
                        >
                            <Label htmlFor="expiry-days">Expires in (days)</Label>
                            <Input
                                id="expiry-days"
                                type="number"
                                min="1"
                                max="365"
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                            />
                        </motion.div>
                    )}

                    {/* Share URL */}
                    {shareUrl ? (
                        <div className="space-y-2">
                            <Label>Share Link</Label>
                            <div className="flex gap-2">
                                <Input value={shareUrl} readOnly />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            {enableExpiry && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Expires in {expiryDays} days
                                </p>
                            )}
                        </div>
                    ) : (
                        <Button
                            onClick={generateShareLink}
                            disabled={isGenerating}
                            className="w-full"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Share Link'}
                        </Button>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
