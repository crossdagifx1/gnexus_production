import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Activity, User, Shield, Settings, FolderOpen, 
  MessageSquare, RefreshCw, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface ActivityEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string;
}

export const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityIcon = (action: string) => {
    if (action.includes('role')) return Shield;
    if (action.includes('project')) return FolderOpen;
    if (action.includes('chat') || action.includes('conversation')) return MessageSquare;
    if (action.includes('setting')) return Settings;
    return Activity;
  };

  const getActivityColor = (action: string) => {
    if (action.includes('delete')) return 'text-destructive';
    if (action.includes('create') || action.includes('add')) return 'text-green-500';
    if (action.includes('update') || action.includes('edit')) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Activity Log</h4>
          <p className="text-sm text-muted-foreground">Recent admin actions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchActivities}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.action);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  <div className={`p-2 rounded-lg bg-background ${getActivityColor(activity.action)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{activity.action}</span>
                      {activity.target_type && (
                        <Badge variant="outline" className="text-xs">
                          {activity.target_type}
                        </Badge>
                      )}
                    </div>
                    {activity.user_email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {activity.user_email}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
