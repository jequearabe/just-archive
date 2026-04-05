import type { APIRoute } from 'astro';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email y contraseña requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar usuario
    const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      import.meta.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(
      JSON.stringify({ token, user: { id: user.id, email: user.email } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};