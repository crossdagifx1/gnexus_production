-- Add new columns to chat_conversations
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Add is_read column to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Create chat_ratings table for customer feedback
CREATE TABLE public.chat_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_ratings
ALTER TABLE public.chat_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_ratings
CREATE POLICY "Anyone can create ratings" 
ON public.chat_ratings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all ratings" 
ON public.chat_ratings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin_settings table for configurable settings
CREATE TABLE public.admin_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_settings
CREATE POLICY "Admins can manage settings" 
ON public.admin_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view settings" 
ON public.admin_settings 
FOR SELECT 
USING (true);

-- Create activity_log table for tracking admin actions
CREATE TABLE public.activity_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_log
CREATE POLICY "Admins can view activity log" 
ON public.activity_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create activity log entries" 
ON public.activity_log 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default admin settings
INSERT INTO public.admin_settings (key, value, description) VALUES
('chat_settings', '{"agent_name": "Tsion", "greeting_message": "Hi! I am Tsion, your AI assistant from G-Squad. How can I help you today?", "business_hours_start": "09:00", "business_hours_end": "18:00", "auto_response_enabled": false, "quick_replies": ["Tell me about your services", "I need a quote", "Contact sales"]}', 'Chat widget configuration'),
('notification_settings', '{"email_notifications": true, "sound_enabled": true, "new_chat_alert": true}', 'Notification preferences'),
('company_settings', '{"name": "G-Squad", "email": "info@g-squad.net", "phone": "+251 911 123456", "social_links": {"facebook": "", "twitter": "", "linkedin": "", "instagram": ""}}', 'Company information')
ON CONFLICT (key) DO NOTHING;

-- Create trigger to update last_message_at on chat_conversations
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_conversations 
    SET last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_new_message_update_conversation ON public.chat_messages;
CREATE TRIGGER on_new_message_update_conversation
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;