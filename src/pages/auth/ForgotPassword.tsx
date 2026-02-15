import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '@/context/AuthContext';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('?action=forgot-password', { email });
            setSubmitted(true);
            toast.success('Password reset instructions sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
                {/* Background Effects */}
                <div className="absolute inset-0 gradient-mesh opacity-40" />
                <div className="absolute inset-0 tibeb-pattern opacity-10" />

                <Card className="w-full max-w-md shadow-2xl glass-v2 relative z-10 border-white/10">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <Mail className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold font-display tracking-tight">Check Your Email</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            We've sent password reset instructions to {email}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Click the link in the email to reset your password. The link will expire in 1
                                hour.
                            </p>
                            <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:text-gold-glow" asChild>
                                <Link to="/login">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 gradient-mesh opacity-40" />
            <div className="absolute inset-0 tibeb-pattern opacity-10" />

            <Card className="w-full max-w-md shadow-2xl glass-v2 relative z-10 border-white/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-coffee flex items-center justify-center shadow-lg shadow-gold/20">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold font-display tracking-tight">Forgot Password?</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your email and we'll send you reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-gold/50"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading} variant="gold">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Reset Link
                                </>
                            )}
                        </Button>

                        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-white/5" asChild>
                            <Link to="/login">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Login
                            </Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
