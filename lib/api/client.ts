/* Thin fetch wrapper shared by every domain in lib/api/. Relative URLs hit
   this same Expo server (the routes under app/api/), so there is nothing to
   configure for local dev or for a same-origin deploy. */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || res.statusText);
  }

  return (await res.json()) as T;
}
