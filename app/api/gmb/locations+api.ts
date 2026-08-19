/* GET /api/gmb/locations — the real Business Profile locations for the
   connected Google account, via the Account Management + Business Information
   APIs. Backs the "Connect location" picker in gmb-connect.tsx. */
import { readAccessToken } from '../../../lib/server/session';

export type GmbLocation = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  primaryCategory: string | null;
};

type GoogleAccount = { name: string };
type GoogleLocation = {
  name: string;
  title?: string;
  storefrontAddress?: { addressLines?: string[]; locality?: string };
  phoneNumbers?: { primaryPhone?: string };
  categories?: { primaryCategory?: { displayName?: string } };
};

export async function GET(request: Request) {
  const accessToken = readAccessToken(request);
  if (!accessToken) return Response.json({ error: 'not_connected' }, { status: 401 });

  const auth = { Authorization: `Bearer ${accessToken}` };

  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { headers: auth });
  if (!accountsRes.ok) {
    return Response.json({ error: 'google_error', detail: await accountsRes.text() }, { status: 502 });
  }
  const { accounts } = (await accountsRes.json()) as { accounts?: GoogleAccount[] };
  const account = accounts?.[0];
  if (!account) return Response.json({ locations: [] as GmbLocation[] });

  const readMask = 'name,title,storefrontAddress,phoneNumbers,categories';
  const locRes = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=${readMask}`,
    { headers: auth },
  );
  if (!locRes.ok) {
    return Response.json({ error: 'google_error', detail: await locRes.text() }, { status: 502 });
  }
  const { locations: raw } = (await locRes.json()) as { locations?: GoogleLocation[] };

  const locations: GmbLocation[] = (raw ?? []).map((l) => ({
    id: l.name,
    name: l.title ?? 'Untitled location',
    address: [l.storefrontAddress?.addressLines?.join(', '), l.storefrontAddress?.locality]
      .filter(Boolean).join(', ') || null,
    phone: l.phoneNumbers?.primaryPhone ?? null,
    primaryCategory: l.categories?.primaryCategory?.displayName ?? null,
  }));

  return Response.json({ locations });
}
