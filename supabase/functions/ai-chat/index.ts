import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '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';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Fallback models in order of preference (all free)
const MODELS = [
  'google/gemini-2.0-flash-thinking-exp:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'xiaomi/mimo-v2-flash:free'
];
const CURRENT_MODEL = MODELS[0]; // Use first model by default

const systemPrompt = `You are Tsion, a friendly and professional customer support agent at G-Squad, a digital agency in Addis Ababa, Ethiopia.

PERSONALITY:
- You are warm, helpful, and genuinely care about helping customers
- You speak naturally like a real person, not robotic
- Use casual but professional language
- Occasionally use Ethiopian greetings like "Selam" or "Ameseginalehu" (thank you)

RESPONSE RULES:
- Keep responses SHORT (2-3 sentences max)
- Be conversational and friendly
- Always guide toward booking a consultation or getting a quote
- End with a question or clear next step

ABOUT G-SQUAD:
- Web Development, 3D Architecture, AI Automation
- Flagship: G-Nexus business platform

PRICING (Starting from):
- Websites: 50,000 ETB
- E-commerce: 150,000 ETB
- 3D Renders: 25,000 ETB/scene
- AI Chatbots: 100,000 ETB

SALES FOCUS:
- Understand their problem first
- Show how we can help
- Create urgency: "Want me to set up a free consultation?"
- Contact: hello@g-squad.dev`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate OpenRouter API key is configured
    if (!OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY is not set!');
      return new Response(
        JSON.stringify({
          error: 'AI service not configured',
          response: "The AI chat service is not configured yet. Please check OPENROUTER_SETUP.md for setup instructions, or contact us at hello@g-squad.dev for immediate assistance."
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, sessionId, conversationId } = await req.json();

    if (!message) {
      throw new Error('No message provided');
    }

    console.log('📨 Received message:', message.substring(0, 50), '... | Session:', sessionId);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({ session_id: sessionId })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
      } else {
        convId = newConv.id;
      }
    }

    // Save user message
    if (convId) {
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        role: 'user',
        content: message
      });
    }

    // Get conversation history
    let messages = [{ role: 'system', content: systemPrompt }];

    if (convId) {
      const { data: history } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (history) {
        messages = [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content }))
        ];
      }
    } else {
      messages.push({ role: 'user', content: message });
    }

    // Call OpenRouter API with fallback free models (with retry for rate limits)
    console.log(`🤖 Calling OpenRouter with model: ${CURRENT_MODEL}`);
    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://g-squad.dev',
          'X-Title': 'G-Squad Support'
        },
        body: JSON.stringify({
          model: CURRENT_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (response.status === 429 && retryCount < maxRetries) {
        const waitTime = (retryCount + 1) * 2;
        console.log(`⏳ Rate limited, retrying in ${waitTime} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        retryCount++;
        continue;
      }
      break;
    }

    if (!response!.ok) {
      const errorText = await response!.text();
      console.error('❌ OpenRouter API error:', response!.status, errorText);

      // If still rate limited after retries, return friendly message
      if (response!.status === 429) {
        return new Response(
          JSON.stringify({
            response: "I'm experiencing high demand right now. Please wait a moment and try again, or contact us at hello@g-squad.dev for immediate assistance.",
            conversationId: convId
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`OpenRouter API error: ${response!.status}`);
    }

    const data = await response!.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not process your request.';

    console.log('✅ AI Response:', assistantMessage.substring(0, 100), '...');

    // Save assistant message
    if (convId) {
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: assistantMessage
      });
    }

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        conversationId: convId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error in ai-chat function:', errorMessage);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        response: "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly at hello@g-squad.dev"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
