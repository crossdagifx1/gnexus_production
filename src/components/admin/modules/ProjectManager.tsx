import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, Globe, Calendar, Tag, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { nexus, type Project } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function ProjectManager() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getProjects();
            setProjects(data);
        } catch (error) {
            toast.error('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Basic validation
            if (!currentProject.title) {
                toast.error('Title is required');
                return;
            }

            await nexus.saveProject({
                ...currentProject,
                category: currentProject.category || 'Web Development',
                status: currentProject.status || 'draft'
            });

            toast.success('Project saved successfully');
            setIsDialogOpen(false);
            loadProjects();
            setCurrentProject({});
        } catch (error) {
            console.error(error);
            toast.error('Failed to save project');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await nexus.deleteProject(id);
            toast.success('Project deleted');
            loadProjects();
        } catch (error) {
            toast.error('Failed to delete project');
        }
    }

    const startEdit = (project: Project) => {
        setCurrentProject({ ...project });
        setIsDialogOpen(true);
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Portfolio Engine</h1>
                    <p className="text-muted-foreground">Manage your case studies and project showcase.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setCurrentProject({});
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentProject.id ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                            <DialogDescription>
                                Add details about your latest work.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Project Title</label>
                                    <Input
                                        value={currentProject.title || ''}
                                        onChange={e => setCurrentProject(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. Nexus Dashboard"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client</label>
                                    <Input
                                        value={currentProject.client || ''}
                                        onChange={e => setCurrentProject(p => ({ ...p, client: e.target.value }))}
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    value={currentProject.description || ''}
                                    onChange={e => setCurrentProject(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief overview..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Input
                                        value={currentProject.category || ''}
                                        onChange={e => setCurrentProject(p => ({ ...p, category: e.target.value }))}
                                        placeholder="e.g. Web App"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={currentProject.status || 'draft'}
                                        onChange={e => setCurrentProject(p => ({ ...p, status: e.target.value as any }))}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image URL</label>
                                <Input
                                    value={currentProject.image_url || ''}
                                    onChange={e => setCurrentProject(p => ({ ...p, image_url: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Project URL</label>
                                <Input
                                    value={currentProject.project_url || ''}
                                    onChange={e => setCurrentProject(p => ({ ...p, project_url: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Project'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="hidden sm:flex">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="group bg-card hover:bg-card/80 border border-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                        >
                            <div className="aspect-video bg-muted relative overflow-hidden">
                                {project.image_url ? (
                                    <img
                                        src={project.image_url}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        <Globe className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={project.status === 'published' ? 'default' : 'secondary'} className="shadow-lg">
                                        {project.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{project.category}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => startEdit(project)}>
                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            {project.project_url && (
                                                <DropdownMenuItem onClick={() => window.open(project.project_url, '_blank')}>
                                                    <Globe className="w-4 h-4 mr-2" /> View Live
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project.id)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                    {project.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(project.created_at || Date.now()).toLocaleDateString()}</span>
                                    {project.featured && (
                                        <span className="ml-auto text-yellow-500 flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Featured
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div >
    );
}
