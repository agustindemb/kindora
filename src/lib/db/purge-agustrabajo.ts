import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./client";
import { user, session, account, organizationMembers, inscriptions, bookmarks } from "./schema";
import { eq, or } from "drizzle-orm";

console.log("🧹 Purging agustrabajo24@gmail.com and any deleted users from Supabase PostgreSQL...");

const targetUsers = await db
  .select()
  .from(user)
  .where(or(eq(user.email, "agustrabajo24@gmail.com")));

for (const u of targetUsers) {
  console.log(`Deleting user data for ${u.email} [ID: ${u.id}]...`);
  await db.delete(session).where(eq(session.userId, u.id));
  await db.delete(account).where(eq(account.userId, u.id));
  await db.delete(organizationMembers).where(eq(organizationMembers.userId, u.id));
  await db.delete(inscriptions).where(eq(inscriptions.userId, u.id));
  await db.delete(bookmarks).where(eq(bookmarks.userId, u.id));
  await db.delete(user).where(eq(user.id, u.id));
  console.log(`✅ Fully purged user ${u.email}!`);
}

console.log("🎉 Cleanup complete!");
process.exit(0);
