export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: API_BASE_URL not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    const upstream = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => '');
      return new Response(
        JSON.stringify({ error: `Upstream error ${upstream.status}`, message: errorText }),
        { status: upstream.status || 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream SSE through to the client
    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'text/event-stream');
    headers.set('Cache-Control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


