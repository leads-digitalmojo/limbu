/* Server-only Anthropic access — AI-generated review replies (see
   app/api/reviews/generate-reply+api.ts, the only caller so far). Billed
   per request against ANTHROPIC_API_KEY's account. */
import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.anthropicApiKey() });
  return client;
}

/** A single system-prompted completion. Deliberately short max_tokens —
    every current caller generates a short reply, not a long document. */
export async function askClaude(system: string, userMessage: string, maxTokens = 800): Promise<string> {
  const response = await getClient().messages.create({
    model: 'claude-opus-5',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error(`Claude declined to respond${response.stop_details ? `: ${response.stop_details.category}` : ''}`);
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock) throw new Error('Claude returned no text content');
  return textBlock.text.trim();
}
