-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'active'
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations"
ON public.chat_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update conversations"
ON public.chat_conversations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create chat messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create messages"
ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create portfolio projects table
CREATE TABLE public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    client TEXT,
    technologies TEXT[],
    project_url TEXT,
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio projects"
ON public.portfolio_projects FOR SELECT USING (true);

CREATE POLICY "Admins can manage portfolio projects"
ON public.portfolio_projects FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create site settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings"
ON public.site_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create handle_new_user function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name'
    );
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample portfolio projects
INSERT INTO public.portfolio_projects (title, description, category, image_url, client, technologies, featured) VALUES
('Habesha Coffee E-commerce', 'Complete online store for premium Ethiopian coffee with delivery tracking', 'web', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'Habesha Coffee Co.', ARRAY['React', 'Node.js', 'Stripe', 'PostgreSQL'], true),
('Addis Real Estate 3D Tours', 'Virtual 3D property tours for luxury apartments in Addis Ababa', '3d', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Prime Properties Ethiopia', ARRAY['Three.js', 'React', 'WebGL', 'Blender'], true),
('AI Customer Service Bot', 'Multi-language AI chatbot supporting Amharic, English, and Tigrinya', 'ai', 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800', 'Ethio Telecom', ARRAY['Python', 'TensorFlow', 'NLP', 'FastAPI'], true),
('Restaurant Order Management', 'Complete POS and order management system for Ethiopian restaurants', 'web', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Yod Abyssinia', ARRAY['Next.js', 'Supabase', 'Tailwind', 'PWA'], false),
('Architectural Visualization', 'Photorealistic 3D renders for commercial building projects', '3d', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 'Ethiopian Construction', ARRAY['Blender', 'Unreal Engine', 'V-Ray'], false),
('Inventory AI Prediction', 'Machine learning system for inventory demand forecasting', 'ai', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800', 'Shoa Supermarket', ARRAY['Python', 'Scikit-learn', 'React', 'Charts'], false),
('Fashion E-commerce Platform', 'Modern habesha kemis and traditional wear online store', 'web', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800', 'Lucy Fashion', ARRAY['Shopify', 'React', 'Node.js'], false),
('Hotel Virtual Experience', 'Interactive 3D hotel room and amenity explorer', '3d', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Sheraton Addis', ARRAY['Three.js', 'React Three Fiber', 'GSAP'], false);