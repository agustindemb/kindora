import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./client";
import { activities, activityImages } from "./schema";
import { eq, isNull } from "drizzle-orm";

const acts = await db.select().from(activities).where(isNull(activities.deletedAt));
console.log(`ALL ACTIVE DB ACTIVITIES (${acts.length}):`);
for (const a of acts) {
  const imgs = await db.select().from(activityImages).where(eq(activityImages.activityId, a.id));
  console.log(`- [${a.id}] "${a.title}" (slug: ${a.slug}) -> ${imgs.length} imgs: ${imgs.map(i => i.url).join(', ')}`);
}

process.exit(0);
