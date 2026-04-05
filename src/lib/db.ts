import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requiere SSL
});

export const query = (text: string, params?: any[]) => pool.query(text, params);