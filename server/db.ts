import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use standard PostgreSQL connection (no WebSocket)
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

<<<<<<< HEAD
export const db = drizzle(pool, { schema });
=======
export const db = drizzle(pool, { schema });
>>>>>>> f397d1a8e99dee288b610662490cb299d6e9d559
