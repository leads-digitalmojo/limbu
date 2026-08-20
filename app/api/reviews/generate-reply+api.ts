/* POST /api/reviews/generate-reply — a real AI-generated review reply via
   Claude, replacing the canned-template picker that used to live in
   components/ReviewsScreen.tsx. Body: { businessName, rating, reviewText }. */
import { askClaude } from '../../../lib/server/anthropic';

type Body = { businessName?: string; rating?: number; reviewText?: string };

const SYSTEM = `You write short, warm, on-brand replies to Google Business Profile customer reviews for a local business owner. Rules:
- 2-4 sentences. No greeting header, no sign-off line, no markdown.
- Thank the customer by acknowledging something specific from their review when possible.
- For 4-5 star reviews: warm, appreciative, invite them back.
- For 3 star reviews: thank them, acknowledge the concern briefly, invite them to reach out directly.
- For 1-2 star reviews: apologize sincerely, do not get defensive, invite them to reach out directly to resolve it. Do not make excuses.
- Never invent specific facts (staff names, dates, promises) not in the review.
- Output only the reply text, nothing else.`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const { businessName, rating, reviewText } = body;
  if (!businessName || !rating || !reviewText) return Response.json({ error: 'missing_fields' }, { status: 400 });

  try {
    const reply = await askClaude(
      SYSTEM,
      `Business: ${businessName}\nRating: ${rating} out of 5 stars\nReview: "${reviewText}"\n\nWrite the reply.`,
    );
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ error: 'anthropic_error', detail: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
