import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./client";
import { user } from "./schema";
import { like } from "drizzle-orm";

const rows = await db
  .update(user)
  .set({ role: "admin", updatedAt: new Date() })
  .where(like(user.email, "%@proasc.com"))
  .returning();

console.log("✅ Updated users to admin:");
rows.forEach((r) => console.log(` - ${r.email} → ${r.role}`));

process.exit(0);
