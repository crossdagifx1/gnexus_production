-- Create conversations table
create table if not exists public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'New Chat',
  model text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pinned boolean default false not null,
  last_message text
);

-- Create messages table
create table if not exists public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  model text -- Store which model generated this message (for assistants)
);

-- Enable RLS
alter table public.ai_conversations enable row level security;

alter table public.ai_messages enable row level security;

-- Policies for ai_conversations
create policy "Users can view their own conversations" on public.ai_conversations for
select using (auth.uid () = user_id);

create policy "Users can insert their own conversations" on public.ai_conversations for
insert
with
    check (auth.uid () = user_id);

create policy "Users can update their own conversations" on public.ai_conversations for
update using (auth.uid () = user_id);

create policy "Users can delete their own conversations" on public.ai_conversations for delete using (auth.uid () = user_id);

-- Policies for ai_messages
create policy "Users can view messages of their conversations" on public.ai_messages for
select using (
        exists (
            select 1
            from public.ai_conversations
            where
                id = public.ai_messages.conversation_id
                and user_id = auth.uid ()
        )
    );

create policy "Users can insert messages to their conversations" on public.ai_messages for
insert
with
    check (
        exists (
            select 1
            from public.ai_conversations
            where
                id = public.ai_messages.conversation_id
                and user_id = auth.uid ()
        )
    );

-- Realtime subscriptions
alter publication supabase_realtime
add
table public.ai_conversations;

alter publication supabase_realtime add table public.ai_messages;