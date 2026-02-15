import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, DollarSign, MessageSquare, Activity, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nexus } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function ChatAnalyticsManager() {
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [dateRange, setDateRange] = useState('30');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await nexus.getChatAnalytics(dateRange);
            setAnalytics(data.analytics || []);
            setStats(data.stats || {});
        } catch (error: any) {
            toast.error('Failed to load analytics: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalCost = analytics.reduce((sum, a) => sum + parseFloat(a.total_cost || 0), 0);
    const totalTokens = analytics.reduce((sum, a) => sum + parseInt(a.total_tokens_input || 0) + parseInt(a.total_tokens_output || 0), 0);
    const totalMessages = analytics.reduce((sum, a) => sum + parseInt(a.total_messages || 0), 0);

    const analyticsbyProvider = analytics.reduce((acc, a) => {
        if (!acc[a.provider]) acc[a.provider] = { messages: 0, cost: 0, tokens: 0 };
        acc[a.provider].messages += parseInt(a.total_messages || 0);
        acc[a.provider].cost += parseFloat(a.total_cost || 0);
        acc[a.provider].tokens += parseInt(a.total_tokens_input || 0) + parseInt(a.total_tokens_output || 0);
        return acc;
    }, {} as Record<string, any>);

    const analyticsByModel = analytics.reduce((acc, a) => {
        if (!acc[a.model]) acc[a.model] = { messages: 0, cost: 0, tokens: 0 };
        acc[a.model].messages += parseInt(a.total_messages || 0);
        acc[a.model].cost += parseFloat(a.total_cost || 0);
        acc[a.model].tokens += parseInt(a.total_tokens_input || 0) + parseInt(a.total_tokens_output || 0);
        return acc;
    }, {} as Record<string, any>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chat Analytics</h2>
                    <p className="text-muted-foreground">Monitor usage, costs, and performance</p>
                </div>
                <div className="flex gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            Total Conversations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_conversations?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">Active today: {stats.active_today || 0}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            Total Messages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In selected period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-500" />
                            Total Tokens
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Combined I/O</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-500" />
                            Total Cost
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">In selected period</p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown Tabs */}
            <Tabs defaultValue="provider" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="provider">By Provider</TabsTrigger>
                    <TabsTrigger value="model">By Model</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="provider" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(analyticsbyProvider).map(([provider, data]: [string, any]) => (
                            <Card key={provider}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{provider}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Messages:</span>
                                        <span className="font-medium">{data.messages.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tokens:</span>
                                        <span className="font-medium">{data.tokens.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Cost:</span>
                                        <span className="font-medium">${data.cost.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="model" className="space-y-4">
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left font-medium">Model</th>
                                    <th className="p-3 text-right font-medium">Messages</th>
                                    <th className="p-3 text-right font-medium">Tokens</th>
                                    <th className="p-3 text-right font-medium">Cost</th>
                                    <th className="p-3 text-right font-medium">Avg Cost/Msg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(analyticsByModel)
                                    .sort((a: any, b: any) => b[1].cost - a[1].cost)
                                    .map(([model, data]: [string, any]) => (
                                        <tr key={model} className="border-b">
                                            <td className="p-3 font-medium">{model}</td>
                                            <td className="p-3 text-right">{data.messages.toLocaleString()}</td>
                                            <td className="p-3 text-right">{data.tokens.toLocaleString()}</td>
                                            <td className="p-3 text-right">${data.cost.toFixed(4)}</td>
                                            <td className="p-3 text-right">
                                                ${(data.cost / data.messages).toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Activity</CardTitle>
                            <CardDescription>Message and cost trends over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {analytics
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 14)
                                    .map((day) => (
                                        <div key={day.date} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                            <span className="text-sm font-medium w-24">{day.date}</span>
                                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Messages: </span>
                                                    <span className="font-medium">{day.total_messages}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Tokens: </span>
                                                    <span className="font-medium">
                                                        {(parseInt(day.total_tokens_input) + parseInt(day.total_tokens_output)).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Cost: </span>
                                                    <span className="font-medium">${parseFloat(day.total_cost).toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
