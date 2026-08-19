/* GET /api/gmb/status — is a Google account connected in this session? */
import { readSession } from '../../../lib/server/session';

export async function GET(request: Request) {
  const session = readSession<{ email: string | null }>(request);
  return Response.json({ connected: !!session, email: session?.email ?? null });
}
