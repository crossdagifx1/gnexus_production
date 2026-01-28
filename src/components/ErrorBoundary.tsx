import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Log to error monitoring service (Sentry, LogRocket, etc.)
        if (import.meta.env.PROD) {
            // TODO: Integrate with error monitoring service
            // Example: Sentry.captureException(error, { extra: errorInfo });
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full glass border-destructive/20">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-full bg-destructive/10">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <CardTitle className="text-2xl">Something went wrong</CardTitle>
                            </div>
                            <CardDescription>
                                We encountered an unexpected error. Don't worry, our team has been notified.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {import.meta.env.DEV && this.state.error && (
                                <div className="p-4 rounded-lg bg-muted border border-border">
                                    <p className="font-mono text-sm text-destructive mb-2">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                                Stack trace
                                            </summary>
                                            <pre className="mt-2 text-xs overflow-auto max-h-64 p-2 bg-background rounded">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 flex-wrap">
                                <Button onClick={this.handleReset} variant="default" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button onClick={this.handleGoHome} variant="outline" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Go to Homepage
                                </Button>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                If this problem persists, please contact our support team.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Lightweight error boundary for non-critical sections
export const LightErrorBoundary: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
    children,
    fallback = <div className="p-4 text-sm text-muted-foreground">Failed to load this section</div>,
}) => {
    return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
};
