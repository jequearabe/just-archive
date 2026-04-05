import type { APIRoute } from 'astro';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, import.meta.env.JWT_SECRET) as any;
    return { id: decoded.userId };
  } catch {
    return null;
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  await query('DELETE FROM user_pages WHERE user_id = $1', [user.id]);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};