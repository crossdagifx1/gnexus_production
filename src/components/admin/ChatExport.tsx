import { useState } from 'react';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
  status: string;
}

interface ChatExportProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
}

export const ChatExport = ({ conversation, messages }: ChatExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportAsText = () => {
    if (!conversation || messages.length === 0) return;

    setIsExporting(true);
    try {
      let content = `Conversation Export\n`;
      content += `==================\n\n`;
      content += `Session ID: ${conversation.session_id}\n`;
      content += `Date: ${new Date(conversation.created_at).toLocaleString()}\n`;
      content += `Status: ${conversation.status}\n`;
      if (conversation.user_email) {
        content += `User Email: ${conversation.user_email}\n`;
      }
      if (conversation.user_name) {
        content += `User Name: ${conversation.user_name}\n`;
      }
      content += `\n---\n\n`;

      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'Customer' : 'Tsion (AI)';
        const time = new Date(msg.created_at).toLocaleString();
        content += `[${time}] ${sender}:\n${msg.content}\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${conversation.session_id.slice(-8)}-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Chat exported as text file' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = () => {
    if (!conversation || messages.length === 0) return;

    setIsExporting(true);
    try {
      const exportData = {
        conversation: {
          id: conversation.id,
          session_id: conversation.session_id,
          user_email: conversation.user_email,
          user_name: conversation.user_name,
          created_at: conversation.created_at,
          status: conversation.status,
        },
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        })),
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${conversation.session_id.slice(-8)}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Chat exported as JSON file' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  if (!conversation || messages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON (.json)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
