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

// Auto-run schema migrations to add missing columns in PostgreSQL if needed
let migrationRan = false;
export async function ensureSchemaColumns() {
  if (migrationRan) return;
  migrationRan = true;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        ALTER TABLE activities ADD COLUMN IF NOT EXISTS "needsVolunteers" boolean DEFAULT true NOT NULL;
        ALTER TABLE activities ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "volunteerMode" text DEFAULT 'immediate' NOT NULL;
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS "volunteerFormSchema" text;
        ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS "volunteerAnswers" text;
        ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'registered' NOT NULL;
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deletedAt" timestamp;
      `);
    } finally {
      client.release();
    }
  } catch (e) {
    console.warn("[DB Auto Migration Warning]", e);
  }
}

// Trigger migration check non-blockingly
ensureSchemaColumns().catch(() => {});
