import * as dotenv from "dotenv";
dotenv.config();

import pg from "pg";

console.log("🛠️ Adding missing Better Auth columns to 'account' table in Postgres DB...");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  ALTER TABLE "account" 
  ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamp,
  ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" timestamp,
  ADD COLUMN IF NOT EXISTS "scope" text;
`);

console.log("✅ Columns 'accessTokenExpiresAt', 'refreshTokenExpiresAt', and 'scope' added successfully to 'account' table!");

await client.end();
process.exit(0);
