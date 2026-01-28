import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Users,
    Activity,
    Cpu,
    Zap,
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    Eye,
    MousePointer,
    MessageSquare,
    Bot
} from 'lucide-react';

interface AnalyticsData {
    timestamp: string;
    activeUsers: number;
    totalRequests: number;
    aiRequests: number;
    responseTime: number;
    errorRate: number;
    cost: number;
}

interface UserBehavior {
    path: string;
    views: number;
    avgTimeSpent: number;
    bounceRate: number;
}

interface AIModelPerformance {
    model: string;
    requests: number;
    avgResponseTime: number;
    successRate: number;
    cost: number;
}

const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const [isLoading, setIsLoading] = useState(false);
    const [realtimeData, setRealtimeData] = useState<AnalyticsData[]>([]);
    const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([]);
    const [modelPerformance, setModelPerformance] = useState<AIModelPerformance[]>([]);
    const [liveMetrics, setLiveMetrics] = useState({
        activeUsers: 0,
        requestsPerSecond: 0,
        avgResponseTime: 0,
        errorRate: 0
    });

    // Generate mock data for demonstration
    useEffect(() => {
        const generateMockData = () => {
            const now = new Date();
            const data: AnalyticsData[] = [];

            for (let i = 23; i >= 0; i--) {
                const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
                data.push({
                    timestamp: timestamp.toISOString(),
                    activeUsers: Math.floor(Math.random() * 100) + 50,
                    totalRequests: Math.floor(Math.random() * 500) + 200,
                    aiRequests: Math.floor(Math.random() * 200) + 50,
                    responseTime: Math.random() * 1000 + 200,
                    errorRate: Math.random() * 5,
                    cost: Math.random() * 10 + 1
                });
            }

            return data;
        };

        const generateUserBehavior = (): UserBehavior[] => [
            { path: '/workflow', views: 1250, avgTimeSpent: 180, bounceRate: 25 },
            { path: '/chat', views: 980, avgTimeSpent: 240, bounceRate: 20 },
            { path: '/agent', views: 750, avgTimeSpent: 320, bounceRate: 15 },
            { path: '/admin', views: 450, avgTimeSpent: 420, bounceRate: 10 },
            { path: '/', views: 2100, avgTimeSpent: 90, bounceRate: 35 }
        ];

        const generateModelPerformance = (): AIModelPerformance[] => [
            { model: 'G-CORE Coder', requests: 450, avgResponseTime: 850, successRate: 98.5, cost: 4.50 },
            { model: 'G-CORE Marketer', requests: 320, avgResponseTime: 620, successRate: 97.2, cost: 3.20 },
            { model: 'G-CORE Planner', requests: 280, avgResponseTime: 580, successRate: 99.1, cost: 2.80 },
            { model: 'G-CORE Analyst', requests: 190, avgResponseTime: 720, successRate: 96.8, cost: 1.90 },
            { model: 'G-CORE Agent', requests: 150, avgResponseTime: 950, successRate: 95.5, cost: 1.50 }
        ];

        setRealtimeData(generateMockData());
        setUserBehavior(generateUserBehavior());
        setModelPerformance(generateModelPerformance());
    }, [timeRange]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveMetrics({
                activeUsers: Math.floor(Math.random() * 100) + 50,
                requestsPerSecond: Math.floor(Math.random() * 20) + 5,
                avgResponseTime: Math.floor(Math.random() * 500) + 200,
                errorRate: Math.random() * 3
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const MetricCard = ({ title, value, change, icon: Icon, unit = '' }: {
        title: string;
        value: number | string;
        change?: number;
        icon: React.ElementType;
        unit?: string;
    }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                            {unit}
                        </p>
                        {change !== undefined && (
                            <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                {Math.abs(change)}%
                            </div>
                        )}
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Real-time insights into your platform performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1h">Last Hour</SelectItem>
                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </Badge>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Users"
                    value={liveMetrics.activeUsers}
                    change={12.5}
                    icon={Users}
                />
                <MetricCard
                    title="Requests/Second"
                    value={liveMetrics.requestsPerSecond}
                    change={-2.3}
                    icon={Activity}
                />
                <MetricCard
                    title="Avg Response Time"
                    value={liveMetrics.avgResponseTime}
                    change={-8.1}
                    icon={Clock}
                    unit="ms"
                />
                <MetricCard
                    title="Error Rate"
                    value={liveMetrics.errorRate.toFixed(1)}
                    change={-15.2}
                    icon={TrendingDown}
                    unit="%"
                />
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
                    <TabsTrigger value="user-behavior">User Behavior</TabsTrigger>
                    <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Traffic Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={realtimeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(value) => new Date(value).toLocaleString()}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="activeUsers"
                                            stackId="1"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            name="Active Users"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="totalRequests"
                                            stackId="2"
                                            stroke="#82ca9d"
                                            fill="#82ca9d"
                                            name="Total Requests"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Response Time Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={realtimeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(value) => new Date(value).toLocaleString()}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="responseTime"
                                            stroke="#ff7300"
                                            strokeWidth={2}
                                            name="Response Time (ms)"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="errorRate"
                                            stroke="#ff0000"
                                            strokeWidth={2}
                                            name="Error Rate (%)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="ai-performance" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Model Performance Comparison</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={modelPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="model" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="requests" fill="#8884d8" name="Requests" />
                                        <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate (%)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>AI Request Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={modelPerformance}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ model, percent }) => `${model} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="requests"
                                        >
                                            {modelPerformance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Model Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Model</th>
                                            <th className="text-right p-2">Requests</th>
                                            <th className="text-right p-2">Avg Response Time</th>
                                            <th className="text-right p-2">Success Rate</th>
                                            <th className="text-right p-2">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modelPerformance.map((model, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2 font-medium">{model.model}</td>
                                                <td className="text-right p-2">{model.requests}</td>
                                                <td className="text-right p-2">{model.avgResponseTime}ms</td>
                                                <td className="text-right p-2">
                                                    <Badge variant={model.successRate > 97 ? 'default' : 'secondary'}>
                                                        {model.successRate}%
                                                    </Badge>
                                                </td>
                                                <td className="text-right p-2">${model.cost.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="user-behavior" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Page Views & Engagement</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={userBehavior}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="path" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="views" fill="#8884d8" name="Page Views" />
                                        <Bar dataKey="avgTimeSpent" fill="#82ca9d" name="Avg Time Spent (s)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Journey Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {userBehavior.map((page, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{page.path}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span>{page.views.toLocaleString()} views</span>
                                                <span>{page.avgTimeSpent}s avg</span>
                                                <Badge variant={page.bounceRate < 20 ? 'default' : 'secondary'}>
                                                    {page.bounceRate}% bounce
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="costs" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cost Breakdown by Model</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={modelPerformance}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ model, cost }) => `${model}: $${cost.toFixed(2)}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="cost"
                                        >
                                            {modelPerformance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cost Efficiency Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Total Daily Cost</span>
                                        </div>
                                        <span className="text-lg font-bold">
                                            ${modelPerformance.reduce((sum, model) => sum + model.cost, 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Cost per Request</span>
                                        </div>
                                        <span className="text-lg font-bold">
                                            ${(modelPerformance.reduce((sum, model) => sum + model.cost, 0) /
                                                modelPerformance.reduce((sum, model) => sum + model.requests, 0)).toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">Most Efficient Model</span>
                                        </div>
                                        <Badge variant="default">
                                            {modelPerformance.reduce((min, model) =>
                                                model.cost / model.requests < min.cost / min.requests ? model : min
                                            ).model}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnalyticsDashboard;
