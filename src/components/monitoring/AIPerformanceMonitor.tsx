import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity, Cpu, Zap, Clock, DollarSign, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle, RefreshCw, BarChart3, Bot, Gauge, Timer, Coins
} from 'lucide-react';

interface ModelMetrics { name: string; requests: number; avgLatency: number; successRate: number; tokensUsed: number; cost: number; trend: 'up' | 'down' | 'stable'; }
interface AlertItem { id: string; type: 'warning' | 'error' | 'info'; message: string; model: string; timestamp: Date; }

const AIPerformanceMonitor: React.FC = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const [activeTab, setActiveTab] = useState('overview');
    const [liveMetrics, setLiveMetrics] = useState({ totalRequests: 0, avgLatency: 0, successRate: 0, totalCost: 0 });

    const [models] = useState<ModelMetrics[]>([
        { name: 'G-CORE Coder', requests: 12450, avgLatency: 850, successRate: 98.5, tokensUsed: 2450000, cost: 24.50, trend: 'up' },
        { name: 'G-CORE Marketer', requests: 8320, avgLatency: 620, successRate: 97.2, tokensUsed: 1680000, cost: 16.80, trend: 'stable' },
        { name: 'G-CORE Planner', requests: 6280, avgLatency: 580, successRate: 99.1, tokensUsed: 1250000, cost: 12.50, trend: 'up' },
        { name: 'G-CORE Analyst', requests: 4190, avgLatency: 720, successRate: 96.8, tokensUsed: 890000, cost: 8.90, trend: 'down' },
        { name: 'G-CORE Agent', requests: 3150, avgLatency: 950, successRate: 95.5, tokensUsed: 720000, cost: 7.20, trend: 'stable' },
    ]);

    const [alerts] = useState<AlertItem[]>([
        { id: '1', type: 'warning', message: 'High latency detected', model: 'G-CORE Agent', timestamp: new Date(Date.now() - 1800000) },
        { id: '2', type: 'error', message: 'Rate limit approaching', model: 'G-CORE Coder', timestamp: new Date(Date.now() - 3600000) },
        { id: '3', type: 'info', message: 'New model version available', model: 'G-CORE Planner', timestamp: new Date(Date.now() - 7200000) },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveMetrics({
                totalRequests: Math.floor(Math.random() * 1000) + 34000,
                avgLatency: Math.floor(Math.random() * 200) + 650,
                successRate: 97 + Math.random() * 2,
                totalCost: 65 + Math.random() * 10
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getTrendIcon = (trend: string) => {
        switch (trend) { case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />; case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />; default: return <Activity className="w-4 h-4 text-yellow-500" />; }
    };

    const getAlertIcon = (type: string) => {
        switch (type) { case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />; case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />; default: return <CheckCircle className="w-4 h-4 text-blue-500" />; }
    };

    const totalTokens = models.reduce((sum, m) => sum + m.tokensUsed, 0);
    const formatNumber = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">AI Performance Monitor</h1><p className="text-muted-foreground">Real-time AI model performance metrics</p></div>
                <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="1h">Last Hour</SelectItem><SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem><SelectItem value="30d">Last 30 Days</SelectItem></SelectContent>
                    </Select>
                    <Badge variant="outline" className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Live</Badge>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[{ label: 'Total Requests', value: formatNumber(liveMetrics.totalRequests), icon: Zap, color: 'text-blue-500' },
                { label: 'Avg Latency', value: `${liveMetrics.avgLatency}ms`, icon: Timer, color: 'text-yellow-500' },
                { label: 'Success Rate', value: `${liveMetrics.successRate.toFixed(1)}%`, icon: CheckCircle, color: 'text-green-500' },
                { label: 'Total Cost', value: `$${liveMetrics.totalCost.toFixed(2)}`, icon: Coins, color: 'text-purple-500' }
                ].map((metric, i) => (
                    <Card key={i}><CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm text-muted-foreground">{metric.label}</p><p className="text-2xl font-bold">{metric.value}</p></div>
                            <metric.icon className={`w-8 h-8 ${metric.color}`} />
                        </div>
                    </CardContent></Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="models">Models</TabsTrigger>
                    <TabsTrigger value="costs">Costs</TabsTrigger><TabsTrigger value="alerts">Alerts</TabsTrigger></TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="w-5 h-5" />Model Performance</CardTitle></CardHeader>
                            <CardContent><div className="space-y-4">
                                {models.map((model) => (
                                    <div key={model.name} className="space-y-2">
                                        <div className="flex items-center justify-between"><span className="text-sm font-medium">{model.name}</span>
                                            <div className="flex items-center gap-2">{getTrendIcon(model.trend)}<span className="text-sm">{model.successRate}%</span></div></div>
                                        <Progress value={model.successRate} className="h-2" />
                                    </div>
                                ))}
                            </div></CardContent>
                        </Card>

                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" />Token Usage</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-center mb-4"><p className="text-4xl font-bold">{formatNumber(totalTokens)}</p><p className="text-muted-foreground">Total tokens used</p></div>
                                <div className="space-y-3">
                                    {models.map((model) => (
                                        <div key={model.name} className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${models.indexOf(model) * 60}, 70%, 50%)` }} />
                                            <span className="flex-1 text-sm">{model.name}</span>
                                            <span className="text-sm font-medium">{formatNumber(model.tokensUsed)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="models">
                    <Card><CardContent className="p-0"><ScrollArea className="h-[500px]">
                        <table className="w-full">
                            <thead className="bg-muted/50 sticky top-0"><tr>
                                <th className="text-left p-4">Model</th><th className="text-right p-4">Requests</th><th className="text-right p-4">Avg Latency</th>
                                <th className="text-right p-4">Success Rate</th><th className="text-right p-4">Tokens</th><th className="text-right p-4">Cost</th><th className="text-right p-4">Trend</th>
                            </tr></thead>
                            <tbody>
                                {models.map((model) => (
                                    <tr key={model.name} className="border-b hover:bg-muted/30">
                                        <td className="p-4 font-medium">{model.name}</td>
                                        <td className="text-right p-4">{formatNumber(model.requests)}</td>
                                        <td className="text-right p-4">{model.avgLatency}ms</td>
                                        <td className="text-right p-4"><Badge variant={model.successRate > 97 ? 'default' : 'secondary'}>{model.successRate}%</Badge></td>
                                        <td className="text-right p-4">{formatNumber(model.tokensUsed)}</td>
                                        <td className="text-right p-4">${model.cost.toFixed(2)}</td>
                                        <td className="text-right p-4">{getTrendIcon(model.trend)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea></CardContent></Card>
                </TabsContent>

                <TabsContent value="costs">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card><CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" />Cost Breakdown</CardTitle></CardHeader>
                            <CardContent><div className="space-y-4">
                                {models.map((model) => (
                                    <div key={model.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <span className="font-medium">{model.name}</span>
                                        <span className="text-lg font-bold">${model.cost.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30">
                                    <span className="font-bold">Total</span>
                                    <span className="text-2xl font-bold">${models.reduce((s, m) => s + m.cost, 0).toFixed(2)}</span>
                                </div>
                            </div></CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle>Cost per Request</CardTitle></CardHeader>
                            <CardContent><div className="space-y-3">
                                {models.map((model) => (
                                    <div key={model.name} className="flex items-center justify-between">
                                        <span className="text-sm">{model.name}</span>
                                        <span className="font-medium">${(model.cost / model.requests * 1000).toFixed(4)}/1K req</span>
                                    </div>
                                ))}
                            </div></CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="alerts">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Recent Alerts</CardTitle></CardHeader>
                        <CardContent><ScrollArea className="h-[400px]"><div className="space-y-3">
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg ${alert.type === 'error' ? 'bg-red-500/10 border border-red-500/30' : alert.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                                    {getAlertIcon(alert.type)}
                                    <div className="flex-1"><p className="font-medium">{alert.message}</p>
                                        <p className="text-sm text-muted-foreground">{alert.model} · {alert.timestamp.toLocaleString()}</p></div>
                                    <Button variant="ghost" size="sm">Dismiss</Button>
                                </div>
                            ))}
                        </div></ScrollArea></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AIPerformanceMonitor;
