import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    TrendingUp,
    TrendingDown,
    Brain,
    Target,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    LineChart,
    PieChart,
    Zap,
    Database,
    Users,
    DollarSign,
    ShoppingCart,
    Eye,
    MousePointer,
    Calendar,
    RefreshCw,
    Download,
    Filter,
    Settings,
    Lightbulb,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';

interface Prediction {
    id: string;
    type: 'revenue' | 'traffic' | 'conversion' | 'churn' | 'engagement' | 'performance';
    title: string;
    description: string;
    currentValue: number;
    predictedValue: number;
    confidence: number;
    timeframe: string;
    accuracy: number;
    factors: string[];
    recommendations: string[];
    status: 'positive' | 'negative' | 'neutral';
    lastUpdated: Date;
}

interface Metric {
    name: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    prediction: {
        nextPeriod: number;
        confidence: number;
    };
}

const PredictiveAnalytics: React.FC = () => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const timeframes = [
        { value: '7d', label: 'Next 7 Days' },
        { value: '30d', label: 'Next 30 Days' },
        { value: '90d', label: 'Next 90 Days' },
        { value: '1y', label: 'Next Year' },
    ];

    const metricTypes = [
        { value: 'all', label: 'All Metrics' },
        { value: 'revenue', label: 'Revenue' },
        { value: 'traffic', label: 'Traffic' },
        { value: 'conversion', label: 'Conversion' },
        { value: 'engagement', label: 'Engagement' },
    ];

    useEffect(() => {
        generatePredictions();
        generateMetrics();
    }, [selectedTimeframe]);

    const generatePredictions = async () => {
        setIsGenerating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockPredictions: Prediction[] = [
            {
                id: '1',
                type: 'revenue',
                title: 'Revenue Forecast',
                description: 'Expected revenue growth based on current trends and seasonal patterns',
                currentValue: 125000,
                predictedValue: 145000,
                confidence: 85,
                timeframe: selectedTimeframe,
                accuracy: 92,
                factors: ['Seasonal demand increase', 'Marketing campaign impact', 'Customer retention rates'],
                recommendations: [
                    'Increase marketing budget by 15%',
                    'Focus on high-converting product categories',
                    'Optimize pricing for seasonal demand'
                ],
                status: 'positive',
                lastUpdated: new Date()
            },
            {
                id: '2',
                type: 'traffic',
                title: 'Website Traffic Prediction',
                description: 'Projected website traffic based on historical data and SEO performance',
                currentValue: 45000,
                predictedValue: 52000,
                confidence: 78,
                timeframe: selectedTimeframe,
                accuracy: 88,
                factors: ['SEO improvements', 'Content marketing efforts', 'Social media engagement'],
                recommendations: [
                    'Continue content marketing strategy',
                    'Optimize page load speed',
                    'Increase social media presence'
                ],
                status: 'positive',
                lastUpdated: new Date()
            },
            {
                id: '3',
                type: 'churn',
                title: 'Customer Churn Risk',
                description: 'Predicted customer churn rate and at-risk customer segments',
                currentValue: 5.2,
                predictedValue: 6.8,
                confidence: 72,
                timeframe: selectedTimeframe,
                accuracy: 85,
                factors: ['Competitor activity', 'Price sensitivity', 'Service quality issues'],
                recommendations: [
                    'Implement customer retention program',
                    'Review pricing strategy',
                    'Improve customer support response time'
                ],
                status: 'negative',
                lastUpdated: new Date()
            },
            {
                id: '4',
                type: 'conversion',
                title: 'Conversion Rate Forecast',
                description: 'Expected conversion rate changes based on user behavior analysis',
                currentValue: 3.8,
                predictedValue: 4.2,
                confidence: 81,
                timeframe: selectedTimeframe,
                accuracy: 90,
                factors: ['UI/UX improvements', 'A/B test results', 'User journey optimization'],
                recommendations: [
                    'Continue A/B testing program',
                    'Optimize checkout process',
                    'Improve mobile user experience'
                ],
                status: 'positive',
                lastUpdated: new Date()
            }
        ];

        setPredictions(mockPredictions);
        setIsGenerating(false);
    };

    const generateMetrics = () => {
        const mockMetrics: Metric[] = [
            {
                name: 'Revenue',
                value: 125000,
                change: 12.5,
                trend: 'up',
                prediction: {
                    nextPeriod: 145000,
                    confidence: 85
                }
            },
            {
                name: 'Active Users',
                value: 8500,
                change: 8.3,
                trend: 'up',
                prediction: {
                    nextPeriod: 9200,
                    confidence: 78
                }
            },
            {
                name: 'Conversion Rate',
                value: 3.8,
                change: -0.5,
                trend: 'down',
                prediction: {
                    nextPeriod: 4.2,
                    confidence: 81
                }
            },
            {
                name: 'Avg Session Duration',
                value: 4.2,
                change: 0,
                trend: 'stable',
                prediction: {
                    nextPeriod: 4.5,
                    confidence: 73
                }
            }
        ];

        setMetrics(mockMetrics);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'positive': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'negative': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
            case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'bg-green-500';
        if (confidence >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const filteredPredictions = selectedMetric === 'all'
        ? predictions
        : predictions.filter(p => p.type === selectedMetric);

    const exportPredictions = () => {
        const data = {
            predictions: filteredPredictions,
            metrics,
            timeframe: selectedTimeframe,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `predictive-analytics-${selectedTimeframe}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Predictive Analytics Engine</h1>
                    <p className="text-muted-foreground">AI-powered predictions and insights for data-driven decisions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {timeframes.map((timeframe) => (
                                <SelectItem key={timeframe.value} value={timeframe.value}>
                                    {timeframe.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={generatePredictions} disabled={isGenerating}>
                        {isGenerating ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Brain className="w-4 h-4 mr-2" />
                        )}
                        Generate
                    </Button>
                    <Button variant="outline" onClick={exportPredictions}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="predictions">Predictions</TabsTrigger>
                    <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((metric, index) => (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                                            <p className="text-2xl font-bold">
                                                {metric.name === 'Revenue' ? `$${metric.value.toLocaleString()}` :
                                                    metric.name === 'Conversion Rate' ? `${metric.value}%` :
                                                        metric.name === 'Avg Session Duration' ? `${metric.value}m` :
                                                            metric.value.toLocaleString()}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {getTrendIcon(metric.trend)}
                                                <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' :
                                                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                                                    }`}>
                                                    {metric.change > 0 ? '+' : ''}{metric.change}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Predicted</p>
                                            <p className="text-lg font-semibold">
                                                {metric.name === 'Revenue' ? `$${metric.prediction.nextPeriod.toLocaleString()}` :
                                                    metric.name === 'Conversion Rate' ? `${metric.prediction.nextPeriod}%` :
                                                        metric.name === 'Avg Session Duration' ? `${metric.prediction.nextPeriod}m` :
                                                            metric.prediction.nextPeriod.toLocaleString()}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(metric.prediction.confidence)}`} />
                                                <span className="text-xs text-muted-foreground">
                                                    {metric.prediction.confidence}% conf.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    AI Insights Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <span className="font-medium">Positive Trends</span>
                                        </div>
                                        <Badge variant="secondary">
                                            {predictions.filter(p => p.status === 'positive').length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="font-medium">Risk Areas</span>
                                        </div>
                                        <Badge variant="secondary">
                                            {predictions.filter(p => p.status === 'negative').length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium">Avg Confidence</span>
                                        </div>
                                        <Badge variant="secondary">
                                            {predictions.length > 0 ? Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length) : 0}%
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Top Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-2">
                                        {predictions.slice(0, 3).map(prediction => (
                                            <div key={prediction.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(prediction.status)}
                                                    <span className="font-medium text-sm">{prediction.title}</span>
                                                </div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                    {prediction.recommendations.slice(0, 2).map((rec, index) => (
                                                        <li key={index} className="flex items-start gap-1">
                                                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                                                            {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="predictions" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {metricTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredPredictions.map((prediction) => (
                            <Card key={prediction.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(prediction.status)}
                                            <CardTitle className="text-lg">{prediction.title}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(prediction.confidence)}`} />
                                            <span className="text-xs text-muted-foreground">
                                                {prediction.confidence}% confidence
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">{prediction.description}</p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Current</p>
                                                <p className="text-lg font-semibold">
                                                    {prediction.type === 'revenue' ? `$${prediction.currentValue.toLocaleString()}` :
                                                        prediction.type === 'conversion' || prediction.type === 'churn' ? `${prediction.currentValue}%` :
                                                            prediction.currentValue.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Predicted</p>
                                                <p className="text-lg font-semibold">
                                                    {prediction.type === 'revenue' ? `$${prediction.predictedValue.toLocaleString()}` :
                                                        prediction.type === 'conversion' || prediction.type === 'churn' ? `${prediction.predictedValue}%` :
                                                            prediction.predictedValue.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">Key Factors</p>
                                            <div className="flex flex-wrap gap-1">
                                                {prediction.factors.map((factor, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {factor}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-2">Recommendations</p>
                                            <ul className="text-xs space-y-1">
                                                {prediction.recommendations.map((rec, index) => (
                                                    <li key={index} className="flex items-start gap-1">
                                                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Accuracy: {prediction.accuracy}%</span>
                                            <span>Updated: {prediction.lastUpdated.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Performance Metrics with Predictions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {metrics.map((metric, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold">{metric.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Current: {metric.name === 'Revenue' ? `$${metric.value.toLocaleString()}` :
                                                        metric.name === 'Conversion Rate' ? `${metric.value}%` :
                                                            metric.name === 'Avg Session Duration' ? `${metric.value}m` :
                                                                metric.value.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">Predicted Next Period</p>
                                                <p className="text-lg font-semibold">
                                                    {metric.name === 'Revenue' ? `$${metric.prediction.nextPeriod.toLocaleString()}` :
                                                        metric.name === 'Conversion Rate' ? `${metric.prediction.nextPeriod}%` :
                                                            metric.name === 'Avg Session Duration' ? `${metric.prediction.nextPeriod}m` :
                                                                metric.prediction.nextPeriod.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getTrendIcon(metric.trend)}
                                                <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' :
                                                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                                                    }`}>
                                                    {metric.change > 0 ? '+' : ''}{metric.change}% from last period
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(metric.prediction.confidence)}`} />
                                                <span className="text-sm text-muted-foreground">
                                                    {metric.prediction.confidence}% confidence
                                                </span>
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
};

export default PredictiveAnalytics;
