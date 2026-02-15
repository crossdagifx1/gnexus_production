import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Sparkles,
    ArrowRight,
    CheckCircle,
    Shield,
    Zap,
    Users
} from 'lucide-react';

export function CTABanner() {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on auth pages or portal pages
    const hideOnPages = ['/login', '/register', '/client', '/admin', '/forgot-password', '/reset-password'];
    const shouldHide = hideOnPages.some(page => location.pathname.startsWith(page));

    if (shouldHide) return null;

    return (
        <section className="py-16 bg-gradient-to-br from-gold/5 via-background to-cyan/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold via-cyan to-gold p-1">
                    <div className="bg-background rounded-3xl p-12">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full mb-6">
                                <Sparkles className="w-4 h-4 text-gold" />
                                <span className="text-sm font-medium">Join 500+ Happy Clients</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                Transform Your Business with{' '}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold via-cyan to-gold">
                                    G-Nexus
                                </span>
                            </h2>

                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Get access to our exclusive client portal with real-time project tracking,
                                instant communication, and seamless invoice management.
                            </p>

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                    <p className="font-semibold">Free Forever</p>
                                    <p className="text-sm text-muted-foreground">No hidden fees or charges</p>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                        <Zap className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <p className="font-semibold">Instant Access</p>
                                    <p className="text-sm text-muted-foreground">Start in under 2 minutes</p>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
                                        <Shield className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <p className="font-semibold">Bank-Level Security</p>
                                    <p className="text-sm text-muted-foreground">Your data is safe with us</p>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    size="lg"
                                    variant="gold"
                                    className="text-lg px-10 py-7 shadow-xl shadow-gold/25 animate-pulse-glow group"
                                    onClick={() => navigate('/register')}
                                >
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-10 py-7"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign In
                                </Button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Cancel anytime</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>24/7 support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
