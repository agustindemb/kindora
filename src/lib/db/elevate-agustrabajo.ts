import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./client";
import { user, organizations, organizationMembers, organizationStats } from "./schema";
import { eq } from "drizzle-orm";

console.log("🛠️ Checking user agustrabajo24@gmail.com in DB...");
const targetUsers = await db.select().from(user).where(eq(user.email, "agustrabajo24@gmail.com"));

if (targetUsers.length === 0) {
  console.log("⚠️ User agustrabajo24@gmail.com not found in DB.");
  process.exit(0);
}

const targetUser = targetUsers[0];
console.log(`Found user: ID=${targetUser.id}, Name=${targetUser.name}, Role=${targetUser.role}`);

// Update role to organizer
await db.update(user).set({ role: "organizer", updatedAt: new Date() }).where(eq(user.id, targetUser.id));
console.log("✅ Updated role of agustrabajo24@gmail.com to 'organizer'!");

// Check if user has an organization
const members = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, targetUser.id));
if (members.length === 0) {
  console.log("📦 Creating organization for agustrabajo24@gmail.com...");
  const [newOrg] = await db.insert(organizations).values({
    name: "Organización " + targetUser.name,
    slug: "organizacion-" + Math.random().toString(36).substring(2, 8),
    description: "Organización social y comunitaria creada en Kindora.",
    mission: "Generar un impacto positivo en nuestra comunidad.",
    type: "NGO",
    email: targetUser.email,
    verificationLevel: "none",
  }).returning();

  await db.insert(organizationMembers).values({
    organizationId: newOrg.id,
    userId: targetUser.id,
    role: "owner",
  });

  await db.insert(organizationStats).values({
    organizationId: newOrg.id,
    followers: 0,
    activitiesCount: 0,
    participantsCount: 0,
    views: 0,
    reviewsCount: 0,
    rating: "0.00",
  });

  console.log(`✅ Created organization "${newOrg.name}" [ID: ${newOrg.id}]!`);
} else {
  console.log(`User is already linked to ${members.length} organization(s).`);
}

process.exit(0);
