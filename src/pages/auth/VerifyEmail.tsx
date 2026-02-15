import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { api } from '@/context/AuthContext';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        const verifyEmail = async () => {
            try {
                await api.post('?action=verify-email', { token });
                setStatus('success');
                setMessage('Email verified successfully!');
                toast.success('Email verified! You can now log in.');
                setTimeout(() => navigate('/login'), 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed');
                toast.error('Verification failed');
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {status === 'loading' && (
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {status === 'loading' && 'Verifying Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === 'success' && (
                        <div className="space-y-4">
                            <p className="text-sm text-center text-muted-foreground">
                                Redirecting to login in 3 seconds...
                            </p>
                            <Button className="w-full" asChild>
                                <Link to="/login">Go to Login</Link>
                            </Button>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <p className="text-sm text-center text-muted-foreground">
                                The verification link may have expired or is invalid.
                            </p>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/login">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Request New Link
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
