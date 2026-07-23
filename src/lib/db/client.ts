import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

// DATABASE_URL is retrieved from process.env (or import.meta.env inside Astro context)
const connectionString = 
  (typeof import.meta !== 'undefined' && import.meta.env?.DATABASE_URL) || 
  process.env.DATABASE_URL || 
  "postgresql://postgres:postgres_password@localhost:5432/kindora";

// Create pool configuration
const poolConfig: pg.PoolConfig = {
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Enable SSL for remote databases (like Supabase)
if (connectionString.includes("supabase") || connectionString.includes("pooler")) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Create pg Pool
export const pool = new pg.Pool(poolConfig);

// Initialize Drizzle client
export const db = drizzle(pool, { schema });
