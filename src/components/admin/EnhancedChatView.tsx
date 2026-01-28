import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Bot, User as UserIcon, Clock, 
  CheckCircle2, XCircle, Archive, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatExport } from './ChatExport';
import { ConversationSearch } from './ConversationSearch';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  is_read?: boolean;
}

interface Conversation {
  id: string;
  session_id: string;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
  updated_at: string;
  status: string;
  resolved_at: string | null;
  resolved_by: string | null;
  last_message_at: string | null;
  message_count?: number;
  last_message_preview?: string;
}

interface EnhancedChatViewProps {
  onConversationSelect?: (id: string) => void;
}

export const EnhancedChatView = ({ onConversationSelect }: EnhancedChatViewProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', dateRange: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch conversations with message counts
  const fetchConversations = async () => {
    try {
      const { data: convData } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (convData) {
        // Get message counts and last messages for each conversation
        const conversationsWithDetails = await Promise.all(
          convData.map(async (conv) => {
            const { data: messages } = await supabase
              .from('chat_messages')
              .select('content, role')
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
              last_message_preview: messages?.[0]?.content?.slice(0, 50) || '',
            };
          })
        );

        setConversations(conversationsWithDetails);
        setFilteredConversations(conversationsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setChatMessages(data || []);
    setSelectedConversation(conversationId);
    onConversationSelect?.(conversationId);

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false);
  };

  // Handle conversation status change
  const handleStatusChange = async (conversationId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) updateData.resolved_by = user.id;
      }

      const { error } = await supabase
        .from('chat_conversations')
        .update(updateData)
        .eq('id', conversationId);

      if (error) throw error;

      toast({ title: `Conversation marked as ${newStatus}` });
      fetchConversations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  // Filter conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => {
        if (filters.status === 'resolved') return c.resolved_at !== null;
        return c.status === filters.status;
      });
    }

    // Apply date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let cutoff = today;

      if (filters.dateRange === 'week') {
        cutoff = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (filters.dateRange === 'month') {
        cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      filtered = filtered.filter(c => new Date(c.created_at) >= cutoff);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.session_id.toLowerCase().includes(query) ||
        c.user_email?.toLowerCase().includes(query) ||
        c.last_message_preview?.toLowerCase().includes(query)
      );
    }

    setFilteredConversations(filtered);
  }, [conversations, filters, searchQuery]);

  // Set up real-time subscription
  useEffect(() => {
    fetchConversations();

    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_conversations' },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          if (payload.new.conversation_id === selectedConversation) {
            setChatMessages(prev => [...prev, payload.new as ChatMessage]);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const getConversationDuration = (conv: Conversation) => {
    const start = new Date(conv.created_at);
    const end = conv.resolved_at ? new Date(conv.resolved_at) : new Date(conv.last_message_at || conv.updated_at);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.round(diffHours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Conversations</h3>
          <Badge variant="secondary">{filteredConversations.length}</Badge>
        </div>

        <ConversationSearch
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          activeFilters={filters}
        />

        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => fetchMessages(conv.id)}
                className={`w-full p-3 rounded-xl text-left transition-colors ${
                  selectedConversation === conv.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      conv.resolved_at ? 'bg-blue-500' : 
                      conv.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'
                    }`} />
                    <span className="text-sm font-medium truncate">
                      #{conv.session_id.slice(-8)}
                    </span>
                  </div>
                  <Badge 
                    variant={selectedConversation === conv.id ? 'secondary' : 'outline'} 
                    className="text-xs"
                  >
                    {conv.message_count}
                  </Badge>
                </div>

                {conv.last_message_preview && (
                  <p className={`text-xs truncate mb-1 ${
                    selectedConversation === conv.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {conv.last_message_preview}...
                  </p>
                )}

                <div className={`flex items-center justify-between text-xs ${
                  selectedConversation === conv.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  <span>{formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getConversationDuration(conv)}
                  </div>
                </div>

                {conv.user_email && (
                  <p className={`text-xs mt-1 truncate ${
                    selectedConversation === conv.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    📧 {conv.user_email}
                  </p>
                )}
              </motion.button>
            ))}
            {filteredConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No conversations found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat View */}
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Chat History</h3>
              {selectedConv && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {chatMessages.length} messages • Started {format(new Date(selectedConv.created_at), 'MMM d, h:mm a')}
                  </p>
                  <Badge variant={selectedConv.resolved_at ? 'default' : 'outline'}>
                    {selectedConv.resolved_at ? 'Resolved' : selectedConv.status}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedConv && !selectedConv.resolved_at && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange(selectedConv.id, 'resolved')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
              )}
              <ChatExport conversation={selectedConv || null} messages={chatMessages} />
            </div>
          </div>
        </div>

        {/* Messages */}
        {selectedConversation ? (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {msg.role === 'user' ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${
                        msg.role === 'user' ? 'text-primary-foreground/80' : 'text-foreground'
                      }`}>
                        {msg.role === 'user' ? 'Customer' : 'Tsion (AI)'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-2 ${
                      msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to view chat history</p>
            <p className="text-sm mt-1">Real-time updates enabled</p>
          </div>
        )}
      </div>
    </div>
  );
};
