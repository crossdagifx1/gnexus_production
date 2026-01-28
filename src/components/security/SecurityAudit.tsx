import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldX,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    RefreshCw,
    Download,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    Key,
    FileWarning,
    Server,
    Database,
    Globe,
    Wifi,
    WifiOff,
    Bug,
    Fingerprint,
    ScanLine,
    Activity,
    TrendingUp,
    TrendingDown,
    Clock,
    History,
    FileText,
    Settings,
    Filter,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SecurityIssue {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    status: 'open' | 'in_progress' | 'resolved' | 'ignored';
    affectedAssets: string[];
    recommendations: string[];
    detectedAt: Date;
    resolvedAt?: Date;
}

interface ComplianceStatus {
    standard: string;
    status: 'compliant' | 'partial' | 'non_compliant';
    score: number;
    requirements: {
        name: string;
        status: 'passed' | 'failed' | 'pending';
    }[];
    lastAudit: Date;
}

interface ThreatDetection {
    id: string;
    type: string;
    source: string;
    target: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    blocked: boolean;
    timestamp: Date;
}

const SecurityAudit: React.FC = () => {
    const [securityScore, setSecurityScore] = useState(78);
    const [isScanning, setIsScanning] = useState(false);
    const [issues, setIssues] = useState<SecurityIssue[]>([]);
    const [compliance, setCompliance] = useState<ComplianceStatus[]>([]);
    const [threats, setThreats] = useState<ThreatDetection[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        generateMockData();
    }, []);

    const generateMockData = () => {
        const mockIssues: SecurityIssue[] = [
            {
                id: '1',
                title: 'Outdated SSL Certificate',
                description: 'SSL certificate will expire in 15 days. Renewal required to maintain secure connections.',
                severity: 'high',
                category: 'SSL/TLS',
                status: 'open',
                affectedAssets: ['api.gnexus.com', 'app.gnexus.com'],
                recommendations: ['Renew SSL certificate', 'Enable auto-renewal'],
                detectedAt: new Date(Date.now() - 86400000)
            },
            {
                id: '2',
                title: 'Weak Password Policy',
                description: 'Some user accounts have passwords that do not meet security requirements.',
                severity: 'medium',
                category: 'Authentication',
                status: 'in_progress',
                affectedAssets: ['User accounts (12 affected)'],
                recommendations: ['Enforce password complexity', 'Require password reset'],
                detectedAt: new Date(Date.now() - 172800000)
            },
            {
                id: '3',
                title: 'Unpatched Dependencies',
                description: 'Several npm packages have known vulnerabilities and require updates.',
                severity: 'critical',
                category: 'Dependencies',
                status: 'open',
                affectedAssets: ['package.json', 'node_modules'],
                recommendations: ['Run npm audit fix', 'Update critical packages'],
                detectedAt: new Date(Date.now() - 3600000)
            },
            {
                id: '4',
                title: 'Missing Rate Limiting',
                description: 'API endpoints lack rate limiting, making them vulnerable to DoS attacks.',
                severity: 'high',
                category: 'API Security',
                status: 'open',
                affectedAssets: ['/api/auth', '/api/data'],
                recommendations: ['Implement rate limiting', 'Add request throttling'],
                detectedAt: new Date(Date.now() - 259200000)
            },
            {
                id: '5',
                title: 'Secure Headers Missing',
                description: 'Security headers like CSP, X-Frame-Options are not configured.',
                severity: 'medium',
                category: 'Headers',
                status: 'resolved',
                affectedAssets: ['All web pages'],
                recommendations: ['Configure security headers'],
                detectedAt: new Date(Date.now() - 604800000),
                resolvedAt: new Date(Date.now() - 86400000)
            }
        ];

        const mockCompliance: ComplianceStatus[] = [
            {
                standard: 'GDPR',
                status: 'compliant',
                score: 95,
                requirements: [
                    { name: 'Data Processing Records', status: 'passed' },
                    { name: 'Consent Management', status: 'passed' },
                    { name: 'Right to Erasure', status: 'passed' },
                    { name: 'Data Portability', status: 'pending' }
                ],
                lastAudit: new Date(Date.now() - 604800000)
            },
            {
                standard: 'SOC 2',
                status: 'partial',
                score: 78,
                requirements: [
                    { name: 'Security Controls', status: 'passed' },
                    { name: 'Availability', status: 'passed' },
                    { name: 'Confidentiality', status: 'failed' },
                    { name: 'Processing Integrity', status: 'pending' }
                ],
                lastAudit: new Date(Date.now() - 1209600000)
            },
            {
                standard: 'HIPAA',
                status: 'non_compliant',
                score: 45,
                requirements: [
                    { name: 'Access Controls', status: 'passed' },
                    { name: 'Audit Logs', status: 'failed' },
                    { name: 'Encryption', status: 'failed' },
                    { name: 'Training', status: 'pending' }
                ],
                lastAudit: new Date(Date.now() - 2592000000)
            }
        ];

        const mockThreats: ThreatDetection[] = [
            {
                id: '1',
                type: 'Brute Force Attack',
                source: '192.168.1.100',
                target: '/api/auth/login',
                severity: 'high',
                blocked: true,
                timestamp: new Date(Date.now() - 1800000)
            },
            {
                id: '2',
                type: 'SQL Injection Attempt',
                source: '10.0.0.55',
                target: '/api/search',
                severity: 'critical',
                blocked: true,
                timestamp: new Date(Date.now() - 3600000)
            },
            {
                id: '3',
                type: 'DDoS Attack',
                source: 'Multiple IPs',
                target: '/api/*',
                severity: 'critical',
                blocked: true,
                timestamp: new Date(Date.now() - 7200000)
            },
            {
                id: '4',
                type: 'XSS Attempt',
                source: '172.16.0.25',
                target: '/comments',
                severity: 'medium',
                blocked: true,
                timestamp: new Date(Date.now() - 14400000)
            }
        ];

        setIssues(mockIssues);
        setCompliance(mockCompliance);
        setThreats(mockThreats);
    };

    const runSecurityScan = async () => {
        setIsScanning(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setSecurityScore(Math.floor(Math.random() * 20) + 70);
        generateMockData();
        setIsScanning(false);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'low': return 'bg-blue-500 text-white';
            case 'info': return 'bg-gray-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'ignored': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getComplianceColor = (status: string) => {
        switch (status) {
            case 'compliant': return 'text-green-500';
            case 'partial': return 'text-yellow-500';
            case 'non_compliant': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getScoreGradient = () => {
        if (securityScore >= 80) return 'from-green-500 to-emerald-600';
        if (securityScore >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-600';
    };

    const filteredIssues = issues.filter(issue => {
        const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
        const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSeverity && matchesSearch;
    });

    const exportReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            securityScore,
            issues: filteredIssues,
            compliance,
            threats,
            summary: {
                criticalIssues: issues.filter(i => i.severity === 'critical' && i.status === 'open').length,
                highIssues: issues.filter(i => i.severity === 'high' && i.status === 'open').length,
                threatsBlocked: threats.filter(t => t.blocked).length
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Security Audit Center</h1>
                    <p className="text-muted-foreground">Monitor and manage your platform security</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={exportReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                    <Button onClick={runSecurityScan} disabled={isScanning}>
                        {isScanning ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                            </>
                        ) : (
                            <>
                                <ScanLine className="w-4 h-4 mr-2" />
                                Run Security Scan
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Security Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                            <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient()} p-1`}>
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold">{securityScore}</span>
                                        <span className="text-sm text-muted-foreground block">/ 100</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-semibold">Security Score</h3>
                                <p className="text-sm text-muted-foreground">
                                    {securityScore >= 80 ? 'Your security posture is strong' :
                                        securityScore >= 60 ? 'Some improvements needed' :
                                            'Critical security issues detected'}
                                </p>
                                <div className="flex gap-2">
                                    {securityScore >= 80 ? (
                                        <Badge className="bg-green-500">Secure</Badge>
                                    ) : securityScore >= 60 ? (
                                        <Badge className="bg-yellow-500">Moderate Risk</Badge>
                                    ) : (
                                        <Badge className="bg-red-500">High Risk</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Open Issues</p>
                                <p className="text-3xl font-bold text-red-500">
                                    {issues.filter(i => i.status === 'open').length}
                                </p>
                            </div>
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="mt-2 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                                {issues.filter(i => i.severity === 'critical' && i.status === 'open').length} Critical
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {issues.filter(i => i.severity === 'high' && i.status === 'open').length} High
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Threats Blocked</p>
                                <p className="text-3xl font-bold text-green-500">
                                    {threats.filter(t => t.blocked).length}
                                </p>
                            </div>
                            <ShieldCheck className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="threats">Threat Detection</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Security Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Encryption Coverage</span>
                                    <div className="flex items-center gap-2 w-1/2">
                                        <Progress value={92} className="flex-1" />
                                        <span className="text-sm font-medium">92%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Access Control</span>
                                    <div className="flex items-center gap-2 w-1/2">
                                        <Progress value={88} className="flex-1" />
                                        <span className="text-sm font-medium">88%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Data Protection</span>
                                    <div className="flex items-center gap-2 w-1/2">
                                        <Progress value={75} className="flex-1" />
                                        <span className="text-sm font-medium">75%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Network Security</span>
                                    <div className="flex items-center gap-2 w-1/2">
                                        <Progress value={85} className="flex-1" />
                                        <span className="text-sm font-medium">85%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[200px]">
                                    <div className="space-y-3">
                                        {threats.slice(0, 5).map((threat) => (
                                            <div key={threat.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-2">
                                                    {threat.blocked ? (
                                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <ShieldX className="w-4 h-4 text-red-500" />
                                                    )}
                                                    <span className="text-sm">{threat.type}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {threat.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Compliance Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Compliance Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {compliance.map((item) => (
                                    <div key={item.standard} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">{item.standard}</h4>
                                            <Badge className={item.status === 'compliant' ? 'bg-green-500' :
                                                item.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'}>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={item.score} className="flex-1" />
                                            <span className="text-sm font-medium">{item.score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vulnerabilities" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vulnerabilities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                            {filteredIssues.map((issue) => (
                                <Card key={issue.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={getSeverityColor(issue.severity)}>
                                                        {issue.severity.toUpperCase()}
                                                    </Badge>
                                                    <Badge className={getStatusColor(issue.status)}>
                                                        {issue.status.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge variant="outline">{issue.category}</Badge>
                                                </div>
                                                <h3 className="font-semibold text-lg">{issue.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>

                                                <div className="mt-4 space-y-2">
                                                    <div>
                                                        <span className="text-xs font-medium text-muted-foreground">Affected Assets:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {issue.affectedAssets.map((asset, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {asset}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-muted-foreground">Recommendations:</span>
                                                        <ul className="mt-1 text-sm space-y-1">
                                                            {issue.recommendations.map((rec, idx) => (
                                                                <li key={idx} className="flex items-start gap-1">
                                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                                                                    {rec}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <p>Detected: {issue.detectedAt.toLocaleDateString()}</p>
                                                {issue.resolvedAt && (
                                                    <p className="text-green-500">Resolved: {issue.resolvedAt.toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6">
                    {compliance.map((item) => (
                        <Card key={item.standard}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className={getComplianceColor(item.status)} />
                                        {item.standard} Compliance
                                    </CardTitle>
                                    <Badge className={item.status === 'compliant' ? 'bg-green-500' :
                                        item.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'}>
                                        Score: {item.score}%
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {item.requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <span className="font-medium">{req.name}</span>
                                            <div className="flex items-center gap-2">
                                                {req.status === 'passed' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                ) : req.status === 'failed' ? (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <Clock className="w-5 h-5 text-yellow-500" />
                                                )}
                                                <Badge variant="outline">
                                                    {req.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-xs text-muted-foreground">
                                    Last audit: {item.lastAudit.toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="threats" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bug className="w-5 h-5" />
                                Real-time Threat Detection
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px]">
                                <div className="space-y-3">
                                    {threats.map((threat) => (
                                        <div key={threat.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge className={getSeverityColor(threat.severity)}>
                                                            {threat.severity.toUpperCase()}
                                                        </Badge>
                                                        {threat.blocked ? (
                                                            <Badge className="bg-green-500">BLOCKED</Badge>
                                                        ) : (
                                                            <Badge className="bg-red-500">ACTIVE</Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold">{threat.type}</h4>
                                                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                                                        <p><span className="font-medium">Source:</span> {threat.source}</p>
                                                        <p><span className="font-medium">Target:</span> {threat.target}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {threat.timestamp.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SecurityAudit;
