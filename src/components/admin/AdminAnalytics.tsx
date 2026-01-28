import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Clock, TrendingUp, TrendingDown,
  Users, Star, BarChart3, Activity, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalConversations: number;
  todayConversations: number;
  weekConversations: number;
  avgResponseTime: number;
  avgMessagesPerConversation: number;
  satisfactionScore: number;
  resolvedRate: number;
  activeConversations: number;
  conversationsByDay: { date: string; count: number }[];
  hourlyActivity: { hour: string; count: number }[];
  statusDistribution: { name: string; value: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(142 76% 36%)', 'hsl(var(--destructive))'];

export const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      // Fetch conversations
      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch messages for avg calculation
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('conversation_id, created_at, role')
        .order('created_at', { ascending: true });

      // Fetch ratings
      const { data: ratings } = await supabase
        .from('chat_ratings')
        .select('rating');

      const convList = conversations || [];
      const msgList = messages || [];
      const ratingList = ratings || [];

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate metrics
      const todayConversations = convList.filter(c => new Date(c.created_at) >= today).length;
      const weekConversations = convList.filter(c => new Date(c.created_at) >= weekAgo).length;
      const activeConversations = convList.filter(c => c.status === 'active').length;
      const resolvedConversations = convList.filter(c => c.resolved_at).length;

      // Messages per conversation
      const messageCountByConv: Record<string, number> = {};
      msgList.forEach(m => {
        messageCountByConv[m.conversation_id] = (messageCountByConv[m.conversation_id] || 0) + 1;
      });
      const avgMessages = Object.keys(messageCountByConv).length > 0
        ? Object.values(messageCountByConv).reduce((a, b) => a + b, 0) / Object.keys(messageCountByConv).length
        : 0;

      // Satisfaction score
      const avgRating = ratingList.length > 0
        ? ratingList.reduce((a, b) => a + b.rating, 0) / ratingList.length
        : 0;

      // Calculate actual average response time
      const responseTimes: number[] = [];
      for (let i = 0; i < msgList.length - 1; i++) {
        if (msgList[i].role === 'user' && msgList[i + 1].role === 'assistant') {
          const userTime = new Date(msgList[i].created_at).getTime();
          const assistantTime = new Date(msgList[i + 1].created_at).getTime();
          const diffInSeconds = (assistantTime - userTime) / 1000;
          responseTimes.push(diffInSeconds);
        }
      }
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : null;

      // Conversations by day (last 7 days)
      const dayData: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { weekday: 'short' });
        dayData[key] = 0;
      }
      convList.forEach(c => {
        const cDate = new Date(c.created_at);
        if (cDate >= weekAgo) {
          const key = cDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (dayData[key] !== undefined) {
            dayData[key]++;
          }
        }
      });
      const conversationsByDay = Object.entries(dayData).map(([date, count]) => ({ date, count }));

      // Hourly activity
      const hourData: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        hourData[`${i.toString().padStart(2, '0')}:00`] = 0;
      }
      convList.forEach(c => {
        const hour = new Date(c.created_at).getHours();
        const key = `${hour.toString().padStart(2, '0')}:00`;
        hourData[key]++;
      });
      const hourlyActivity = Object.entries(hourData).map(([hour, count]) => ({ hour, count }));

      // Status distribution
      const statusCounts: Record<string, number> = { active: 0, closed: 0, resolved: 0 };
      convList.forEach(c => {
        const status = c.resolved_at ? 'resolved' : (c.status || 'active');
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const statusDistribution = Object.entries(statusCounts)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

      setData({
        totalConversations: convList.length,
        todayConversations,
        weekConversations,
        avgResponseTime: avgResponseTime !== null ? Math.round(avgResponseTime * 10) / 10 : 0,
        avgMessagesPerConversation: Math.round(avgMessages * 10) / 10,
        satisfactionScore: Math.round(avgRating * 10) / 10,
        resolvedRate: convList.length > 0 ? Math.round((resolvedConversations / convList.length) * 100) : 0,
        activeConversations,
        conversationsByDay,
        hourlyActivity,
        statusDistribution,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">Real-time insights into your chat performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Chats</p>
                  <p className="text-2xl font-bold">{data.todayConversations}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {data.todayConversations > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Active today</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No chats yet today</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{data.weekConversations}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <span className="text-muted-foreground">Last 7 days</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Messages</p>
                  <p className="text-2xl font-bold">{data.avgMessagesPerConversation}</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                <span className="text-muted-foreground">Per conversation</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                  <p className="text-2xl font-bold">
                    {data.satisfactionScore > 0 ? `${data.satisfactionScore}/5` : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {data.satisfactionScore >= 4 ? (
                  <span className="text-green-500">Excellent</span>
                ) : data.satisfactionScore >= 3 ? (
                  <span className="text-yellow-500">Good</span>
                ) : data.satisfactionScore > 0 ? (
                  <span className="text-orange-500">Needs improvement</span>
                ) : (
                  <span className="text-muted-foreground">No ratings yet</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversations This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.conversationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourlyActivity.filter((_, i) => i % 2 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">{data.totalConversations}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-green-500">{data.activeConversations}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold">{data.resolvedRate}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{data.avgResponseTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
