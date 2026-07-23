import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "../db/client";
import { organizations, organizationMembers, organizationStats, follows, user } from "../db/schema";
import { mockOrganizations, mockOrganizationStats } from "../db/mocks";

export type OrganizationSelect = typeof organizations.$inferSelect;
export type OrganizationInsert = typeof organizations.$inferInsert;
export type MemberSelect = typeof organizationMembers.$inferSelect;
export type StatsSelect = typeof organizationStats.$inferSelect;

// Local in-memory store for mocks
const activeOrgs = [...mockOrganizations];
const activeStats = [...mockOrganizationStats];
const activeMembers: MemberSelect[] = [
  { id: "mem-1", organizationId: "org-1", userId: "usr_org", role: "owner", createdAt: new Date() },
  { id: "mem-2", organizationId: "org-2", userId: "usr_org", role: "owner", createdAt: new Date() },
  { id: "mem-3", organizationId: "org-3", userId: "usr_org", role: "admin", createdAt: new Date() },
  { id: "mem-4", organizationId: "org-4", userId: "usr_org", role: "editor", createdAt: new Date() },
];
const activeFollows: { userId: string; organizationId: string; createdAt: Date }[] = [
  { userId: "usr_part", organizationId: "org-1", createdAt: new Date() }
];

export const organizationRepository = {
  async findById(id: string): Promise<OrganizationSelect | null> {
    try {
      const results = await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)))
        .limit(1);
      return results[0] || null;
    } catch (error) {
      console.warn("DB Connection failed, using mock organizations fallback.");
      return activeOrgs.find(o => o.id === id && !o.deletedAt) || null;
    }
  },

  async findBySlug(slug: string): Promise<OrganizationSelect | null> {
    try {
      const results = await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.slug, slug), isNull(organizations.deletedAt)))
        .limit(1);
      return results[0] || null;
    } catch (error) {
      console.warn("DB Connection failed, using mock organizations fallback.");
      return activeOrgs.find(o => o.slug === slug && !o.deletedAt) || null;
    }
  },

  async create(data: Omit<OrganizationInsert, "id" | "createdAt">, ownerUserId: string): Promise<OrganizationSelect> {
    try {
      return await db.transaction(async (tx) => {
        const orgResults = await tx.insert(organizations).values(data).returning();
        const org = orgResults[0];

        await tx.insert(organizationStats).values({
          organizationId: org.id,
          followers: 0,
          activitiesCount: 0,
          participantsCount: 0,
          views: 0,
          reviewsCount: 0,
          rating: "0.00",
        });

        await tx.insert(organizationMembers).values({
          organizationId: org.id,
          userId: ownerUserId,
          role: "owner",
        });

        return org;
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating organization creation.");
      const orgId = `org-${Math.random().toString(36).substr(2, 9)}`;
      const newOrg: OrganizationSelect = {
        id: orgId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        mission: data.mission || null,
        type: data.type,
        logo: data.logo || null,
        banner: data.banner || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        contactPerson: data.contactPerson || null,
        website: data.website || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        foundedAt: data.foundedAt ? new Date(data.foundedAt) : null,
        verifiedAt: null,
        verifiedBy: null,
        verificationLevel: "none",
        createdAt: new Date(),
        deletedAt: null,
      };

      activeOrgs.push(newOrg);
      activeStats.push({
        organizationId: orgId,
        followers: 0,
        activitiesCount: 0,
        participantsCount: 0,
        views: 0,
        reviewsCount: 0,
        rating: "0.00",
      });
      activeMembers.push({
        id: `mem-${Math.random().toString(36).substr(2, 9)}`,
        organizationId: orgId,
        userId: ownerUserId,
        role: "owner",
        createdAt: new Date(),
      });

      return newOrg;
    }
  },

  async update(id: string, data: Partial<OrganizationInsert>): Promise<OrganizationSelect> {
    try {
      const results = await db
        .update(organizations)
        .set(data)
        .where(eq(organizations.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulating organization update.");
      const idx = activeOrgs.findIndex(o => o.id === id);
      if (idx !== -1) {
        activeOrgs[idx] = { ...activeOrgs[idx], ...data } as OrganizationSelect;
        return activeOrgs[idx];
      }
      throw error;
    }
  },

  async softDelete(id: string): Promise<OrganizationSelect> {
    try {
      const results = await db
        .update(organizations)
        .set({ deletedAt: new Date() })
        .where(eq(organizations.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulating organization soft delete.");
      const idx = activeOrgs.findIndex(o => o.id === id);
      if (idx !== -1) {
        activeOrgs[idx].deletedAt = new Date();
        return activeOrgs[idx];
      }
      throw error;
    }
  },

  async addMember(organizationId: string, userId: string, role: "owner" | "admin" | "editor"): Promise<MemberSelect> {
    try {
      const results = await db
        .insert(organizationMembers)
        .values({ organizationId, userId, role })
        .returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulating membership add.");
      const newMember = {
        id: `mem-${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        userId,
        role,
        createdAt: new Date(),
      };
      activeMembers.push(newMember);
      return newMember;
    }
  },

  async removeMember(organizationId: string, userId: string): Promise<void> {
    try {
      await db
        .delete(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, userId)
          )
        );
    } catch (error) {
      console.warn("DB Connection failed, simulating membership removal.");
      const idx = activeMembers.findIndex(m => m.organizationId === organizationId && m.userId === userId);
      if (idx !== -1) activeMembers.splice(idx, 1);
    }
  },

  async getMembers(organizationId: string): Promise<(MemberSelect & { user: any })[]> {
    try {
      const results = await db
        .select({
          member: organizationMembers,
          userData: user,
        })
        .from(organizationMembers)
        .innerJoin(user, eq(organizationMembers.userId, user.id))
        .where(eq(organizationMembers.organizationId, organizationId));

      return results.map((r) => ({
        ...r.member,
        user: r.userData,
      }));
    } catch (error) {
      console.warn("DB Connection failed, simulating members fetch.");
      const { mockUsers } = await import("./userRepository");
      return activeMembers
        .filter(m => m.organizationId === organizationId)
        .map(m => ({
          ...m,
          user: mockUsers.find(u => u.id === m.userId) || { id: m.userId, name: "Usuario Mock", email: "mock@user.com", emailVerified: true, role: "participant", createdAt: new Date(), updatedAt: new Date() }
        }));
    }
  },

  async getUserOrganizations(userId: string): Promise<(OrganizationSelect & { role: string })[]> {
    try {
      const results = await db
        .select({
          org: organizations,
          memberRole: organizationMembers.role,
        })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(and(eq(organizationMembers.userId, userId), isNull(organizations.deletedAt)));

      return results.map((r) => ({
        ...r.org,
        role: r.memberRole,
      }));
    } catch (error) {
      console.warn("DB Connection failed, simulating user organizations fetch.");
      return activeMembers
        .filter(m => m.userId === userId)
        .map(m => {
          const org = activeOrgs.find(o => o.id === m.organizationId && !o.deletedAt);
          if (!org) return null;
          return { ...org, role: m.role };
        })
        .filter(Boolean) as any[];
    }
  },

  async getStats(organizationId: string): Promise<StatsSelect | null> {
    try {
      const results = await db
        .select()
        .from(organizationStats)
        .where(eq(organizationStats.organizationId, organizationId))
        .limit(1);
      return results[0] || null;
    } catch (error) {
      console.warn("DB Connection failed, using mock stats.");
      return activeStats.find(s => s.organizationId === organizationId) || null;
    }
  },

  async updateStats(organizationId: string, stats: Partial<StatsSelect>): Promise<void> {
    try {
      await db
        .update(organizationStats)
        .set(stats)
        .where(eq(organizationStats.organizationId, organizationId));
    } catch (error) {
      console.warn("DB Connection failed, simulating stats update.");
      const idx = activeStats.findIndex(s => s.organizationId === organizationId);
      if (idx !== -1) {
        activeStats[idx] = { ...activeStats[idx], ...stats } as StatsSelect;
      }
    }
  },

  async follow(userId: string, organizationId: string): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        await tx.insert(follows).values({ userId, organizationId }).onConflictDoNothing();
        await tx.update(organizationStats)
          .set({ followers: sql`${organizationStats.followers} + 1` })
          .where(eq(organizationStats.organizationId, organizationId));
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating follow.");
      const exists = activeFollows.some(f => f.userId === userId && f.organizationId === organizationId);
      if (!exists) {
        activeFollows.push({ userId, organizationId, createdAt: new Date() });
        const idx = activeStats.findIndex(s => s.organizationId === organizationId);
        if (idx !== -1) {
          activeStats[idx].followers++;
        }
      }
    }
  },

  async unfollow(userId: string, organizationId: string): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        const deleted = await tx
          .delete(follows)
          .where(and(eq(follows.userId, userId), eq(follows.organizationId, organizationId)))
          .returning();

        if (deleted.length > 0) {
          await tx.update(organizationStats)
            .set({ followers: sql`GREATEST(0, ${organizationStats.followers} - 1)` })
            .where(eq(organizationStats.organizationId, organizationId));
        }
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating unfollow.");
      const idx = activeFollows.findIndex(f => f.userId === userId && f.organizationId === organizationId);
      if (idx !== -1) {
        activeFollows.splice(idx, 1);
        const sIdx = activeStats.findIndex(s => s.organizationId === organizationId);
        if (sIdx !== -1) {
          activeStats[sIdx].followers = Math.max(0, activeStats[sIdx].followers - 1);
        }
      }
    }
  },

  async isFollowing(userId: string, organizationId: string): Promise<boolean> {
    try {
      const results = await db
        .select()
        .from(follows)
        .where(and(eq(follows.userId, userId), eq(follows.organizationId, organizationId)))
        .limit(1);
      return results.length > 0;
    } catch (error) {
      console.warn("DB Connection failed, using simulated follows.");
      return activeFollows.some(f => f.userId === userId && f.organizationId === organizationId);
    }
  },

  async listAll(verifiedOnly = false): Promise<OrganizationSelect[]> {
    try {
      let query = db.select().from(organizations).where(isNull(organizations.deletedAt));
      if (verifiedOnly) {
        query = db.select().from(organizations).where(
          and(
            isNull(organizations.deletedAt),
            sql`${organizations.verifiedAt} IS NOT NULL`
          )
        );
      }
      return await query;
    } catch (error) {
      console.warn("DB Connection failed, returning mock organizations list.");
      if (verifiedOnly) {
        return activeOrgs.filter(o => o.verifiedAt && !o.deletedAt);
      }
      return activeOrgs.filter(o => !o.deletedAt);
    }
  },
};
