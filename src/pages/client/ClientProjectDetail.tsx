import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Download,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Folder
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function ClientProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProjectDetails();
        }
    }, [id]);

    const fetchProjectDetails = async () => {
        try {
            const response = await axios.get(
                `${API_URL}?action=project_details&id=${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setProject(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch project details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'pending': 'bg-yellow-500',
            'in-progress': 'bg-blue-500',
            'review': 'bg-purple-500',
            'completed': 'bg-green-500',
            'cancelled': 'bg-red-500',
            'on-hold': 'bg-gray-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    const getMilestoneIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
                <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/client/projects')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/client/projects')}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-bold">{project.project.project_name}</h1>
                            <Badge className={getStatusColor(project.project.status)}>
                                {project.project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Project ID: {project.project.id}</p>
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{project.project.progress_percentage}%</span>
                        </div>
                        <Progress value={project.project.progress_percentage} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Project Details Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Service Type</CardTitle>
                        <Folder className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold capitalize">
                            {project.project.service_type.replace('-', ' ')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Budget</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {project.project.budget ? `$${parseFloat(project.project.budget).toFixed(2)}` : 'N/A'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Start Date</CardTitle>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {project.project.start_date
                                ? format(new Date(project.project.start_date), 'MMM dd, yyyy')
                                : 'Not set'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {project.project.deadline
                                ? format(new Date(project.project.deadline), 'MMM dd, yyyy')
                                : 'Not set'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            {project.project.description && (
                <Card>
                    <CardHeader>
                        <CardTitle>Project Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {project.project.description}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Milestones */}
            <Card>
                <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                    <CardDescription>Project timeline and deliverables</CardDescription>
                </CardHeader>
                <CardContent>
                    {project.milestones && project.milestones.length > 0 ? (
                        <div className="space-y-4">
                            {project.milestones.map((milestone: any, index: number) => (
                                <div key={milestone.id} className="flex gap-4">
                                    {/* Timeline connector */}
                                    <div className="flex flex-col items-center">
                                        {getMilestoneIcon(milestone.status)}
                                        {index < project.milestones.length - 1 && (
                                            <div className="w-0.5 h-full bg-border mt-2" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold">{milestone.milestone_name}</h4>
                                                {milestone.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {milestone.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'}>
                                                {milestone.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            {milestone.due_date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                                                </div>
                                            )}
                                            {milestone.completed_at && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Completed: {format(new Date(milestone.completed_at), 'MMM dd, yyyy')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No milestones defined yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Deliverables/Files */}
            <Card>
                <CardHeader>
                    <CardTitle>Deliverables</CardTitle>
                    <CardDescription>Download project files and resources</CardDescription>
                </CardHeader>
                <CardContent>
                    {project.files && project.files.length > 0 ? (
                        <div className="space-y-3">
                            {project.files.map((file: any) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(file.file_name)}
                                        <div>
                                            <p className="font-medium">{file.file_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {file.file_size && (
                                                    <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                )}
                                                <span>•</span>
                                                <span>
                                                    Uploaded {format(new Date(file.uploaded_at), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No files uploaded yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activity Log */}
            {project.activity && project.activity.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Project updates and changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {project.activity.slice(0, 10).map((activity: any) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.action_description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
