/* POST /api/posts/generate-caption — a real AI-written Magic Post caption
   via Claude, replacing the random-template picker that used to live in
   app/posts/new.tsx. Body: { businessName, city, phone, address, prompt,
   lang, keywords }. */
import { askClaude } from '../../../lib/server/anthropic';

type Body = {
  businessName?: string; city?: string; phone?: string; address?: string;
  prompt?: string; lang?: 'en' | 'hi'; keywords?: string[];
};

const SYSTEM = `You write short, punchy social media captions for a local business's Google Business Profile / social post. Rules:
- 2-4 short lines, plenty of energy, at most 2 emoji.
- Weave in the business's name, address and phone naturally near the end.
- End with 2-4 relevant hashtags built from the given keywords and city (no spaces, no punctuation inside a hashtag).
- Write in the requested language only.
- Never invent facts (prices, offers, dates) not present in the prompt.
- Output only the caption text, nothing else — no markdown, no quotes around it.`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { businessName, city, phone, address, prompt, lang = 'en', keywords = [] } = body;
  if (!businessName || !prompt) return Response.json({ error: 'missing_fields' }, { status: 400 });

  const userMessage = [
    `Language: ${lang === 'hi' ? 'Hindi' : 'English'}`,
    `Business: ${businessName}`,
    address ? `Address: ${address}` : null,
    city ? `City: ${city}` : null,
    phone ? `Phone: ${phone}` : null,
    keywords.length ? `Keywords to weave in as hashtags: ${keywords.join(', ')}` : null,
    `What the post is about: ${prompt}`,
  ].filter(Boolean).join('\n');

  try {
    const caption = await askClaude(SYSTEM, userMessage, 300);
    return Response.json({ caption });
  } catch (e) {
    return Response.json({ error: 'anthropic_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
