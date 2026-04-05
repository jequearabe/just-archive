import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, import.meta.env.JWT_SECRET) as any;
    return { id: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  const result = await query('SELECT slug, title, content_json FROM user_pages WHERE user_id = $1', [user.id]);
  const page = result.rows[0] || { slug: '', title: '', content_json: { blocks: [] } };
  return new Response(JSON.stringify({ page }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  const body = await request.json();
  const { slug, title, content_json } = body;
  if (!slug || !slug.match(/^[a-z0-9\-_]+$/i)) {
    return new Response(JSON.stringify({ error: 'Slug inválido' }), { status: 400 });
  }
  const existing = await query('SELECT user_id FROM user_pages WHERE slug = $1', [slug]);
  if (existing.rows.length > 0 && existing.rows[0].user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Este slug ya está en uso' }), { status: 409 });
  }
  const result = await query(
    `INSERT INTO user_pages (user_id, slug, title, content_json, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       slug = EXCLUDED.slug,
       title = EXCLUDED.title,
       content_json = EXCLUDED.content_json,
       updated_at = NOW()
     RETURNING id, slug, title, content_json`,
    [user.id, slug, title || '', content_json || { blocks: [] }]
  );
  return new Response(JSON.stringify({ page: result.rows[0] }), { status: 200 });
};