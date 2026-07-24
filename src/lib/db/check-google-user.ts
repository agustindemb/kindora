import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./client";
import { user, account, session } from "./schema";

console.log("🔍 Checking 'user' table in Supabase DB...");
const users = await db.select().from(user);
console.log(`Found ${users.length} users:`);
users.forEach(u => console.log(` - ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`));

console.log("\n🔍 Checking 'account' table in Supabase DB...");
const accounts = await db.select().from(account);
console.log(`Found ${accounts.length} accounts:`);
accounts.forEach(a => console.log(` - ID: ${a.id} | UserID: ${a.userId} | Provider: ${a.providerId} | AccountID: ${a.accountId}`));

console.log("\n🔍 Checking 'session' table in Supabase DB...");
const sessions = await db.select().from(session);
console.log(`Found ${sessions.length} active sessions:`);
sessions.forEach(s => console.log(` - ID: ${s.id} | UserID: ${s.userId} | Expires: ${s.expiresAt}`));

process.exit(0);
