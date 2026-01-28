import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSecureForm, HoneypotField } from '@/hooks/useSecureForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const newsletterSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
    variant?: 'default' | 'compact' | 'inline';
    showName?: boolean;
    title?: string;
    description?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
    variant = 'default',
    showName = false,
    title = 'Stay Updated',
    description = 'Subscribe to our newsletter for the latest updates and insights.',
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<NewsletterFormData>({
        resolver: zodResolver(newsletterSchema),
        defaultValues: {
            email: '',
            name: '',
        },
    });

    const {
        honeypotField,
        honeypotValue,
        setHoneypotValue,
        createSecureSubmitHandler,
    } = useSecureForm(form, {
        honeypot: true,
        csrf: true,
        sanitize: true,
        rateLimit: { maxAttempts: 3, windowMs: 300000 }, // 3 attempts per 5 minutes
    });

    const onSubmit = createSecureSubmitHandler('newsletter-signup', async (data) => {
        setIsSubmitting(true);
        try {
            // TODO: Replace with your newsletter service (Mailchimp, SendGrid, etc.)
            // For now, storing in Supabase
            const { error } = await supabase.from('newsletter_subscribers').insert([
                {
                    email: data.email,
                    name: data.name || null,
                    subscribed_at: new Date().toISOString(),
                },
            ]);

            if (error) throw error;

            setIsSuccess(true);
            toast.success('Successfully subscribed to newsletter!');
            form.reset();

            setTimeout(() => setIsSuccess(false), 5000);
        } catch (error: any) {
            if (error.code === '23505') {
                // Duplicate email
                toast.info('You are already subscribed!');
            } else {
                console.error('Newsletter signup error:', error);
                toast.error('Failed to subscribe. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    });

    if (variant === 'compact') {
        return (
            <div className="space-y-3">
                {!isSuccess ? (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        {honeypotField && (
                            <HoneypotField
                                {...honeypotField}
                                value={honeypotValue}
                                onChange={setHoneypotValue}
                            />
                        )}
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                {...form.register('email')}
                                disabled={isSubmitting}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isSubmitting} size="sm">
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                        )}
                    </form>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Successfully subscribed!</span>
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'inline') {
        return !isSuccess ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 max-w-md">
                {honeypotField && (
                    <HoneypotField
                        {...honeypotField}
                        value={honeypotValue}
                        onChange={setHoneypotValue}
                    />
                )}
                <Input
                    type="email"
                    placeholder="your@email.com"
                    {...form.register('email')}
                    disabled={isSubmitting}
                    className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Subscribe
                </Button>
            </form>
        ) : (
            <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>Thanks for subscribing!</span>
            </div>
        );
    }

    // Default variant - full card
    return (
        <Card className="glass border-primary/20">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!isSuccess ? (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {honeypotField && (
                            <HoneypotField
                                {...honeypotField}
                                value={honeypotValue}
                                onChange={setHoneypotValue}
                            />
                        )}
                        {showName && (
                            <div>
                                <Input
                                    type="text"
                                    placeholder="Your name"
                                    {...form.register('name')}
                                    disabled={isSubmitting}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive mt-1">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>
                        )}
                        <div>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                {...form.register('email')}
                                disabled={isSubmitting}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive mt-1">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Subscribing...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" />
                                    Subscribe to Newsletter
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </form>
                ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Successfully Subscribed!</</h3>
            <p className="text-sm text-muted-foreground">
              Check your email for confirmation.
            </p>
          </div>
        )}
        </CardContent>
    </Card >
  );
};
