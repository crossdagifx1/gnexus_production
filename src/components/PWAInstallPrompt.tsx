import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// PWAInstallPrompt - animations disabled
export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);

            // Check if user has dismissed before
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast({
                title: 'App Installing',
                description: 'G-Nexus is being added to your device!',
            });
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    return (
        <>
            {showPrompt && deferredPrompt && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm">
                    <div className="glass p-6 rounded-2xl border border-gold/30 shadow-lg">
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Download className="w-6 h-6 text-gold" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-display font-bold text-lg mb-2">
                                    Install G-Nexus
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Get quick access to G-Nexus right from your home screen!
                                </p>

                                <div className="flex gap-2">
                                    <Button
                                        variant="gold"
                                        size="sm"
                                        onClick={handleInstall}
                                        className="flex-1"
                                    >
                                        Install Now
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDismiss}
                                    >
                                        Later
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
