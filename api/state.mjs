const DEFAULT_SUPABASE_URL = "https://rhjyiokjttvhokvzdcaa.supabase.co";
const TABLE = "ar131_dashboard_snapshot";
const SECRET_ENV = "SUPABASE_SECRET_KEY";
const PART_SIZE = 2400000;

function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

    const supabaseUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
    const secretKey = process.env[SECRET_ENV];
    if (!supabaseUrl || !secretKey) {
      return json({
        error: `Thiếu SUPABASE_URL hoặc ${SECRET_ENV} trong Vercel Environment Variables.`
      }, 500);
    }

    const endpoint = `${supabaseUrl}/rest/v1/${TABLE}?select=web_payload,as_of,updated_at&scope=eq.current&limit=1`;
    const headers = { apikey: secretKey, accept: 'application/json' };
    if (!secretKey.startsWith('sb_secret_')) headers.Authorization = `Bearer ${secretKey}`;

    let response;
    try {
      response = await fetch(endpoint, { headers, cache: 'no-store' });
    } catch {
      return json({ error: 'Không kết nối được Supabase.' }, 502);
    }
    if (!response.ok) return json({ error: `Supabase trả về HTTP ${response.status}.` }, 502);

    const rows = await response.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row?.web_payload?.DATA?.bin) {
      return json({ error: 'Snapshot chưa có web_payload. Hãy chạy lại Cmc.Ar131.Publisher.' }, 503);
    }

    const text = JSON.stringify(row.web_payload);
    const id = String(row.web_payload.id || row.updated_at || 'current');
    const requestUrl = new URL(request.url);
    const requestedPart = requestUrl.searchParams.get('part');
    if (requestedPart !== null) {
      if (requestUrl.searchParams.get('id') !== id) return json({ ok: false, error: 'Snapshot đã thay đổi.' }, 409);
      const part = Number.parseInt(requestedPart, 10);
      const total = Math.ceil(text.length / PART_SIZE);
      if (!Number.isInteger(part) || part < 0 || part >= total)
        return json({ ok: false, error: 'Phần dữ liệu không hợp lệ.' }, 400);
      return json({ ok: true, chunk: text.slice(part * PART_SIZE, (part + 1) * PART_SIZE) });
    }

    const date = String(row.as_of || '').split('-').map(Number);
    return json({
      id,
      parts: Math.ceil(text.length / PART_SIZE),
      meta: {
        y: date[0] || 0,
        m: date[1] || 0,
        d: date[2] || 0,
        ts: row.updated_at,
        file: row.web_payload.DATA.meta?.file || 'SQL Server CMC / Bravo'
      }
    });
  }
};