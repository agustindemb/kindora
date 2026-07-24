import * as dotenv from "dotenv";
dotenv.config();

import pg from "pg";

console.log("🛠️ Creating analytics_events and announcements tables in Postgres DB...");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventName" TEXT NOT NULL,
    "userId" TEXT,
    "activityId" UUID,
    "organizationId" UUID,
    metadata TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "activityId" UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
  );
`);

console.log("✅ Analytics and Announcements tables created successfully!");

await client.end();
process.exit(0);
