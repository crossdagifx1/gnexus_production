import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, FolderOpen, Settings,
  Users, LogOut, Menu, X, ChevronRight, BarChart3,
  Bot, Eye, Trash2, Edit2, Plus, Loader2, Shield, User as UserIcon,
  TrendingUp, Clock, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectFormDialog } from '@/components/admin/ProjectFormDialog';
import { UserRolesManager } from '@/components/admin/UserRolesManager';
import { EnhancedChatView } from '@/components/admin/EnhancedChatView';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { ActivityLog } from '@/components/admin/ActivityLog';
import { LightErrorBoundary } from '@/components/ErrorBoundary';
import type { User } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string;
  client: string | null;
  featured: boolean | null;
  created_at: string;
  image_url: string | null;
  technologies: string[] | null;
  project_url: string | null;
}

interface DashboardStats {
  totalChats: number;
  totalProjects: number;
  activeConversations: number;
  avgRating: number;
  todayChats: number;
}

interface RecentConversation {
  id: string;
  session_id: string;
  user_email: string | null;
  created_at: string;
  status: string;
  message_count: number;
  last_message_preview: string;
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalChats: 0,
    totalProjects: 0,
    activeConversations: 0,
    avgRating: 0,
    todayChats: 0,
  });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [newChatCount, setNewChatCount] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      } else {
        setIsLoading(false);
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Real-time subscription for new chats notification
  useEffect(() => {
    const channel = supabase
      .channel('new-chats-notification')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_conversations' },
        () => {
          setNewChatCount(prev => prev + 1);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Clear notification when switching to chats tab
  useEffect(() => {
    if (activeTab === 'chats') {
      setNewChatCount(0);
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      // Fetch conversations with message counts
      const { data: convData } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch projects
      const { data: projData } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('created_at', { ascending: false });

      setProjects(projData || []);

      // Fetch ratings for average
      const { data: ratingsData } = await supabase
        .from('chat_ratings')
        .select('rating');

      const avgRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((a, b) => a + b.rating, 0) / ratingsData.length
        : 0;

      // Calculate today's chats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayChats = convData?.filter(c => new Date(c.created_at) >= today).length || 0;

      // Get recent conversations with message counts
      const recentConvs = await Promise.all(
        (convData || []).slice(0, 5).map(async (conv) => {
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          return {
            ...conv,
            message_count: count || 0,
            last_message_preview: messages?.[0]?.content?.slice(0, 40) || '',
          };
        })
      );

      setRecentConversations(recentConvs);

      // Calculate stats
      setStats({
        totalChats: convData?.length || 0,
        totalProjects: projData?.length || 0,
        activeConversations: convData?.filter(c => c.status === 'active').length || 0,
        avgRating: Math.round(avgRating * 10) / 10,
        todayChats,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: user?.id,
        user_email: user?.email,
        action: 'Deleted project',
        target_type: 'portfolio_project',
        target_id: projectId,
      });

      toast({ title: 'Project deleted successfully' });
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error deleting project',
        variant: 'destructive'
      });
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'chats', icon: MessageSquare, label: 'AI Chats', badge: newChatCount },
    { id: 'projects', icon: FolderOpen, label: 'Portfolio' },
    { id: 'users', icon: Shield, label: 'User Roles' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -240 }}
        className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">G</span>
            </div>
            <div>
              <h2 className="font-bold">G-Squad</h2>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-6'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold capitalize">{activeTab === 'users' ? 'User Roles' : activeTab}</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Today: {stats.todayChats}</Badge>
                  </div>
                  <h3 className="text-2xl font-bold">{stats.totalChats}</h3>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <Bot className="w-5 h-5 text-green-500" />
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 text-xs">Live</Badge>
                  </div>
                  <h3 className="text-2xl font-bold">{stats.activeConversations}</h3>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <FolderOpen className="w-5 h-5 text-purple-500" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Portfolio</Badge>
                  </div>
                  <h3 className="text-2xl font-bold">{stats.totalProjects}</h3>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 bg-card border border-border rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Rating</Badge>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {stats.avgRating > 0 ? `${stats.avgRating}/5` : 'N/A'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </motion.div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Conversations */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Recent Conversations</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('chats')}
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recentConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => setActiveTab('chats')}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">#{conv.session_id.slice(-8)}</p>
                              <Badge variant="outline" className="text-xs">
                                {conv.message_count} msgs
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message_preview || 'No messages yet'}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${conv.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'
                            }`} />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {recentConversations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No conversations yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Log */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <ActivityLog />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chats' && (
            <LightErrorBoundary>
              <EnhancedChatView />
            </LightErrorBoundary>
          )}

          {activeTab === 'projects' && (
            <div className="bg-card border border-border rounded-2xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold">Portfolio Projects</h3>
                <Button size="sm" onClick={handleAddProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.category}</Badge>
                      </TableCell>
                      <TableCell>{project.client || '-'}</TableCell>
                      <TableCell>
                        {project.featured ? (
                          <Badge className="bg-primary">Featured</Badge>
                        ) : (
                          <Badge variant="secondary">Standard</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProject(project)}
                            aria-label={`Edit ${project.title}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive" aria-label={`Delete ${project.title}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the project "{project.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'users' && (
            <LightErrorBoundary>
              <div className="bg-card border border-border rounded-2xl p-6">
                <UserRolesManager />
              </div>
            </LightErrorBoundary>
          )}

          {activeTab === 'analytics' && (
            <LightErrorBoundary>
              <div className="bg-card border border-border rounded-2xl p-6">
                <AdminAnalytics />
              </div>
            </LightErrorBoundary>
          )}

          {activeTab === 'settings' && (
            <LightErrorBoundary>
              <div className="bg-card border border-border rounded-2xl p-6">
                <AdminSettings />
              </div>
            </LightErrorBoundary>
          )}
        </div>
      </main>

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        project={editingProject}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Admin;
