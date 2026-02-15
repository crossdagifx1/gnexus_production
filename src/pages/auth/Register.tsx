import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { UserPlus, Loader2, Check, X } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const passwordRequirements = [
        { text: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { text: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { text: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { text: 'One number', test: (p: string) => /[0-9]/.test(p) },
        { text: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!termsAccepted) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        setLoading(true);

        try {
            await register(
                formData.username,
                formData.email,
                formData.password,
                formData.fullName
            );
            toast.success('Account created! Please check your email to verify your account.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 gradient-mesh opacity-40" />
            <div className="absolute inset-0 tibeb-pattern opacity-10" />

            <Card className="w-full max-w-md shadow-2xl glass-v2 relative z-10 border-white/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-coffee flex items-center justify-center shadow-lg shadow-gold/20">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold font-display tracking-tight">Create Account</CardTitle>
                    <CardDescription className="text-muted-foreground">Join G-Nexus AI Suite today</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => updateField('fullName', e.target.value)}
                                required
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-gold/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={(e) => updateField('username', e.target.value)}
                                required
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-gold/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                required
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-gold/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                required
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-gold/50"
                            />
                            {formData.password && (
                                <div className="text-xs space-y-1 mt-2">
                                    {passwordRequirements.map((req, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-1 ${req.test(formData.password)
                                                ? 'text-green-400'
                                                : 'text-muted-foreground'
                                                }`}
                                        >
                                            {req.test(formData.password) ? (
                                                <Check className="w-3 h-3" />
                                            ) : (
                                                <X className="w-3 h-3" />
                                            )}
                                            <span>{req.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                required
                                disabled={loading}
                                className="bg-black/20 border-white/10 focus:border-gold/50"
                            />
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="terms"
                                checked={termsAccepted}
                                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                disabled={loading}
                                className="data-[state=checked]:bg-gold data-[state=checked]:border-gold border-white/20"
                            />
                            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer text-muted-foreground">
                                I agree to the{' '}
                                <Link to="/terms" className="text-gold hover:text-gold-glow hover:underline transition-colors">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-gold hover:text-gold-glow hover:underline transition-colors">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading} variant="gold">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="text-gold hover:text-gold-glow hover:underline font-medium transition-colors">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
