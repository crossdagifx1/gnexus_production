# OpenRouter AI Setup Guide

This guide will help you set up the AI chat functionality using OpenRouter.

## What is OpenRouter?

OpenRouter is a unified API that provides access to multiple AI models (GPT-4, Claude, Gemini, etc.) through a single interface. It's a cost-effective way to add AI capabilities to your application.

## Setup Instructions

### 1. Get an OpenRouter API Key

1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in (you can use Google/GitHub)
3. Click "Create Key" and give it a name (e.g., "G-Squad Chat")
4. **Copy the API key immediately** - you won't be able to see it again!

### 2. Add API Key to Supabase

The Supabase edge function needs the API key as an environment variable. You have two options:

#### Option A: Using Supabase Dashboard (Recommended for Production)

1. Go to your Supabase project dashboard: [https://supabase.com/dashboard/project/jopqobzwojitrlllhpsn](https://supabase.com/dashboard/project/jopqobzwojitrlllhpsn)
2. Navigate to **Settings** → **Edge Functions**
3. Under "Secrets", click **Add Secret**
4. Set name: `OPENROUTER_API_KEY`
5. Set value: Your OpenRouter API key
6. Click **Add Secret**

#### Option B: Using Supabase CLI (For Local Development)

If you have Supabase CLI installed:

```bash
# Set the secret
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...

# Verify it was set
supabase secrets list
```

### 3. Deploy/Restart Edge Function

After adding the secret:

**For Production (Supabase Dashboard):**
- The edge function should automatically pick up the new secret
- If not, redeploy: `supabase functions deploy ai-chat`

**For Local Development:**
- Stop your local Supabase (if running)
- Create a `.env.local` file in `supabase/.env.local`:
  ```
  OPENROUTER_API_KEY=sk-or-v1-your-key-here
  SUPABASE_URL=https://jopqobzwojitrlllhpsn.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- Restart: `supabase start`

### 4. Test the Chat

1. Run your dev server: `npm run dev`
2. Open the app in your browser
3. Click the chat widget (bottom-right)
4. Send a test message
5. You should get a response from Tsion!

## Troubleshooting

### "Sorry, I'm having connection issues"

This usually means:
- The API key is not set or incorrect
- Check Supabase logs: Dashboard → Logs → Edge Functions
- Verify the secret exists: `supabase secrets list`

### Rate Limit Errors

OpenRouter free tier has rate limits. The code includes automatic retry logic, but if you hit limits:
- Wait a few seconds and try again
- Consider upgrading your OpenRouter plan
- The code will show: "I'm experiencing high demand right now"

### Function Not Deploying

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref jopqobzwojitrlllhpsn

# Deploy the function
supabase functions deploy ai-chat
```

## Alternative AI Providers

If you prefer not to use OpenRouter, you can modify `supabase/functions/ai-chat/index.ts` to use:

### Direct OpenAI API
- Get key from: https://platform.openai.com/api-keys
- Change endpoint to: `https://api.openai.com/v1/chat/completions`
- Set header: `Authorization: Bearer YOUR_OPENAI_KEY`
- Use models like: `gpt-3.5-turbo`, `gpt-4`

### Anthropic Claude
- Get key from: https://console.anthropic.com/
- Use their SDK: `@anthropic-ai/sdk`
- Models: `claude-3-haiku-20240307`, `claude-3-sonnet-20240229`

### Google Gemini (Free!)
- Get key from: https://makersuite.google.com/app/apikey
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Completely free with generous limits

## Current Model

The chat currently uses: `xiaomi/mimo-v2-flash:free`
- This is a FREE model on OpenRouter
- No credit card required
- Good for testing and light usage

You can change the model in `supabase/functions/ai-chat/index.ts` (line 122).

Popular free alternatives:
- `google/gemini-2.0-flash-thinking-exp:free`
- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-3.1-8b-instruct:free`

## Cost Information

**OpenRouter Free Tier:**
- Several models available for free
- Rate limited (varies by model)
- No credit card needed

**Paid Usage:**
- Most powerful models are paid (GPT-4, Claude 3)
- Very affordable: ~$0.001-0.01 per message
- Check prices: https://openrouter.ai/docs#models

## Need Help?

- OpenRouter Docs: https://openrouter.ai/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Join OpenRouter Discord: https://discord.gg/openrouter
