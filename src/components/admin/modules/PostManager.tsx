import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreHorizontal, FileText, Calendar, User, Eye, Edit, Trash2 } from 'lucide-react';
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
import { nexus, type BlogPost } from '@/lib/api/nexus-core';
import { toast } from 'sonner';

export default function PostManager() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getPosts();
            setPosts(data);
        } catch (error) {
            toast.error('Failed to load posts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!currentPost.title) {
                toast.error('Title is required');
                return;
            }

            await nexus.savePost({
                ...currentPost,
                status: currentPost.status || 'draft'
            });

            toast.success('Post saved successfully');
            setIsDialogOpen(false);
            loadPosts();
            setCurrentPost({});
        } catch (error) {
            toast.error('Failed to save post');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await nexus.deletePost(id);
            toast.success('Post deleted');
            loadPosts();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    }

    const startEdit = (post: BlogPost) => {
        setCurrentPost({ ...post });
        setIsDialogOpen(true);
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
                    <p className="text-muted-foreground">Manage your blog and articles.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setCurrentPost({});
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> New Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentPost.id ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                            <DialogDescription>
                                Write and publish your thoughts.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={currentPost.title || ''}
                                        onChange={e => setCurrentPost(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Enter post title..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug</label>
                                    <Input
                                        value={currentPost.slug || ''}
                                        onChange={e => setCurrentPost(p => ({ ...p, slug: e.target.value }))}
                                        placeholder="url-friendly-slug"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Excerpt</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                    value={currentPost.excerpt || ''}
                                    onChange={e => setCurrentPost(p => ({ ...p, excerpt: e.target.value }))}
                                    placeholder="Short summary for previews..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[300px] font-mono"
                                    value={currentPost.content || ''}
                                    onChange={e => setCurrentPost(p => ({ ...p, content: e.target.value }))}
                                    placeholder="Write your post content here (Markdown supported)..."
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Input
                                        value={currentPost.category || ''}
                                        onChange={e => setCurrentPost(p => ({ ...p, category: e.target.value }))}
                                        placeholder="Technology"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={currentPost.status || 'draft'}
                                        onChange={e => setCurrentPost(p => ({ ...p, status: e.target.value as any }))}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="review">In Review</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Read Time (min)</label>
                                    <Input
                                        type="number"
                                        value={currentPost.read_time_min || 5}
                                        onChange={e => setCurrentPost(p => ({ ...p, read_time_min: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentPost.featured || false}
                                        onChange={e => setCurrentPost(p => ({ ...p, featured: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    Featured Post
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentPost.trending || false}
                                        onChange={e => setCurrentPost(p => ({ ...p, trending: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    Trending
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Post'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="rounded-md border border-border/50 bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter posts..."
                            className="pl-9 bg-muted/50 border-none"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-border/50">
                    <AnimatePresence>
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                            >
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                        {post.cover_image ? (
                                            <img src={post.cover_image} alt="" className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <FileText className="w-6 h-6 text-muted-foreground/50" />
                                        )}
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium truncate">{post.title}</h3>
                                            {post.featured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Featured</Badge>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author_name || 'Admin'}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                                            <Badge variant="outline" className="text-xs py-0 h-5 font-normal">{post.status}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => startEdit(post)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Eye className="w-4 h-4 mr-2" /> Preview
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(post.id)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filteredPosts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No posts found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
