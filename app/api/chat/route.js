import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 50 seconds
export const maxDuration = 120;

export async function POST(req) {
  const { messages } = await req.json();

  // System prompt loaded from environment variable for security
  const systemPrompt = process.env.LUNA_SYSTEM_PROMPT;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    tools: {
      google_search: google.tools.googleSearch({}),
      url_context: google.tools.urlContext({}),
    },
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    temperature: 0.7,
    maxTokens: 4000,
  });

  return result.toUIMessageStreamResponse();
}
