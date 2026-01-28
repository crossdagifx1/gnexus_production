import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface CookiePreferences {
    necessary: boolean; // Always true
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
};

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export const CookieConsent: React.FC = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

        if (!consent) {
            // Show banner after a short delay
            setTimeout(() => setShowBanner(true), 1000);
        }

        if (savedPreferences) {
            try {
                setPreferences(JSON.parse(savedPreferences));
            } catch {
                setPreferences(DEFAULT_PREFERENCES);
            }
        }
    }, []);

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
        setPreferences(prefs);

        // Initialize services based on preferences
        if (prefs.analytics) {
            initializeAnalytics();
        }

        setShowBanner(false);
        setShowSettings(false);
    };

    const acceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true,
        };
        savePreferences(allAccepted);
    };

    const acceptNecessary = () => {
        savePreferences(DEFAULT_PREFERENCES);
    };

    const saveCustomPreferences = () => {
        savePreferences(preferences);
    };

    const initializeAnalytics = () => {
        // Initialize Google Analytics or other analytics services
        if (window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: preferences.analytics ? 'granted' : 'denied',
                ad_storage: preferences.marketing ? 'granted' : 'denied',
                functionality_storage: preferences.functional ? 'granted' : 'denied',
            });
        }
    };

    if (!showBanner) {
        return null;
    }

    return (
        <>
            {/* Cookie Banner */}
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom">
                <Card className="glass border-primary/20 max-w-4xl mx-auto">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Cookie className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Cookie Preferences</CardTitle>
                                    <CardDescription className="mt-1">
                                        We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowBanner(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
                        <Button onClick={acceptAll} className="flex-1 sm:flex-none gap-2">
                            Accept All
                        </Button>
                        <Button onClick={acceptNecessary} variant="outline" className="flex-1 sm:flex-none">
                            Necessary Only
                        </Button>
                        <Dialog open={showSettings} onOpenChange={setShowSettings}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                                    <Settings className="h-4 w-4" />
                                    Customize
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Cookie Settings</DialogTitle>
                                    <DialogDescription>
                                        Manage your cookie preferences. Necessary cookies are always enabled.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    {/* Necessary Cookies */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="necessary" className="text-base font-medium">
                                                Necessary Cookies
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Required for the website to function properly.
                                            </p>
                                        </div>
                                        <Switch id="necessary" checked disabled />
                                    </div>

                                    {/* Analytics Cookies */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="analytics" className="text-base font-medium">
                                                Analytics Cookies
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Help us understand how you use our website.
                                            </p>
                                        </div>
                                        <Switch
                                            id="analytics"
                                            checked={preferences.analytics}
                                            onCheckedChange={(checked) =>
                                                setPreferences({ ...preferences, analytics: checked })
                                            }
                                        />
                                    </div>

                                    {/* Marketing Cookies */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="marketing" className="text-base font-medium">
                                                Marketing Cookies
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Used to deliver personalized advertisements.
                                            </p>
                                        </div>
                                        <Switch
                                            id="marketing"
                                            checked={preferences.marketing}
                                            onCheckedChange={(checked) =>
                                                setPreferences({ ...preferences, marketing: checked })
                                            }
                                        />
                                    </div>

                                    {/* Functional Cookies */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="functional" className="text-base font-medium">
                                                Functional Cookies
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Enable enhanced functionality and personalization.
                                            </p>
                                        </div>
                                        <Switch
                                            id="functional"
                                            checked={preferences.functional}
                                            onCheckedChange={(checked) =>
                                                setPreferences({ ...preferences, functional: checked })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={() => setShowSettings(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={saveCustomPreferences}>
                                        Save Preferences
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};

// Helper to check if user has consented to specific cookie type
export const hasCookieConsent = (type: keyof CookiePreferences): boolean => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!savedPreferences) return false;

    try {
        const preferences: CookiePreferences = JSON.parse(savedPreferences);
        return preferences[type];
    } catch {
        return false;
    }
};
