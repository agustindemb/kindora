import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./client";
import { organizationLogs, organizations } from "./schema";
import { eq, and, ne } from "drizzle-orm";

console.log("🧹 Running verification logs cleanup...");

// Delete verification_requested logs for orgs that are no longer 'none'
const verifiedOrgs = await db
  .select({ id: organizations.id, name: organizations.name, level: organizations.verificationLevel })
  .from(organizations)
  .where(ne(organizations.verificationLevel, "none"));

console.log(`Found ${verifiedOrgs.length} verified organizations.`);

for (const org of verifiedOrgs) {
  const deleted = await db
    .delete(organizationLogs)
    .where(
      and(
        eq(organizationLogs.organizationId, org.id),
        eq(organizationLogs.action, "verification_requested")
      )
    )
    .returning();
  if (deleted.length > 0) {
    console.log(`✅ Cleared pending request for: ${org.name} (${org.level})`);
  }
}

console.log("Done!");
process.exit(0);
