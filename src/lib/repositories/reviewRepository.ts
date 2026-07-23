import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "../db/client";
import { reviews, user, activities, organizationStats } from "../db/schema";
import { mockReviews } from "../db/mocks";

export type ReviewSelect = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;

const activeReviews = [...mockReviews];

export const reviewRepository = {
  async create(data: Omit<ReviewInsert, "id" | "createdAt">): Promise<ReviewSelect> {
    try {
      return await db.transaction(async (tx) => {
        const results = await tx.insert(reviews).values(data).returning();
        const review = results[0];

        const act = await tx
          .select({ organizationId: activities.organizationId })
          .from(activities)
          .where(eq(activities.id, review.activityId))
          .limit(1);

        if (act.length > 0) {
          const orgId = act[0].organizationId;
          await this._recalculateOrganizationStats(tx, orgId);
        }

        return review;
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating review creation.");
      const reviewId = `rev-${Math.random().toString(36).substr(2, 9)}`;
      
      const newReview = {
        id: reviewId,
        activityId: data.activityId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment,
        images: data.images || null,
        createdAt: new Date(),
        deletedAt: null
      };

      activeReviews.push(newReview);

      // Simulate Recalculate Stats in mocks
      const { activeActivities } = await import("./activityRepository");
      const act = activeActivities.find((a) => a.id === data.activityId);
      if (act) {
        const orgId = act.organizationId;
        const orgReviews = activeReviews.filter(r => {
          const matchingAct = activeActivities.find(a => a.id === r.activityId);
          return matchingAct ? matchingAct.organizationId === orgId && !r.deletedAt : false;
        });

        const count = orgReviews.length;
        const sum = orgReviews.reduce((acc, r) => acc + r.rating, 0);
        const rating = count > 0 ? (sum / count).toFixed(2) : "0.00";

        const { organizationRepository } = await import("./organizationRepository");
        await organizationRepository.updateStats(orgId, {
          reviewsCount: count,
          rating: rating
        });
      }

      return newReview;
    }
  },

  async getByActivity(activityId: string): Promise<(any & { user: any })[]> {
    try {
      const results = await db
        .select({
          rev: reviews,
          u: user,
        })
        .from(reviews)
        .innerJoin(user, eq(reviews.userId, user.id))
        .where(and(eq(reviews.activityId, activityId), isNull(reviews.deletedAt)))
        .orderBy(sql`${reviews.createdAt} desc`);

      return results.map((r) => ({
        ...r.rev,
        user: r.u,
      }));
    } catch (error) {
      console.warn("DB Connection failed, filtering reviews in mocks.");
      const { mockUsers } = await import("./userRepository");
      return activeReviews
        .filter((r) => r.activityId === activityId && !r.deletedAt)
        .map((r) => ({
          ...r,
          user: mockUsers.find((u) => u.id === r.userId) || { id: r.userId, name: "Usuario Mock", email: "mock@user.com", role: "participant" }
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  },

  async getByOrganization(organizationId: string): Promise<(any & { user: any; activityTitle: string })[]> {
    try {
      const results = await db
        .select({
          rev: reviews,
          u: user,
          activityTitle: activities.title,
        })
        .from(reviews)
        .innerJoin(user, eq(reviews.userId, user.id))
        .innerJoin(activities, eq(reviews.activityId, activities.id))
        .where(
          and(
            eq(activities.organizationId, organizationId),
            isNull(reviews.deletedAt),
            isNull(activities.deletedAt)
          )
        )
        .orderBy(sql`${reviews.createdAt} desc`);

      return results.map((r) => ({
        ...r.rev,
        user: r.u,
        activityTitle: r.activityTitle,
      }));
    } catch (error) {
      console.warn("DB Connection failed, filtering reviews for org in mocks.");
      const { activeActivities } = await import("./activityRepository");
      const { mockUsers } = await import("./userRepository");

      const orgActivityIds = activeActivities
        .filter((a) => a.organizationId === organizationId && !a.deletedAt)
        .map((a) => a.id);

      return activeReviews
        .filter((r) => orgActivityIds.includes(r.activityId) && !r.deletedAt)
        .map((r) => {
          const act = activeActivities.find((a) => a.id === r.activityId);
          return {
            ...r,
            user: mockUsers.find((u) => u.id === r.userId) || { id: r.userId, name: "Usuario Mock", email: "mock@user.com", role: "participant" },
            activityTitle: act ? act.title : "Actividad",
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  },

  async softDelete(id: string): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        const deleted = await tx
          .update(reviews)
          .set({ deletedAt: new Date() })
          .where(eq(reviews.id, id))
          .returning();

        if (deleted.length > 0) {
          const review = deleted[0];
          const act = await tx
            .select({ organizationId: activities.organizationId })
            .from(activities)
            .where(eq(activities.id, review.activityId))
            .limit(1);

          if (act.length > 0) {
            const orgId = act[0].organizationId;
            await this._recalculateOrganizationStats(tx, orgId);
          }
        }
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating review soft delete.");
      const review = activeReviews.find(r => r.id === id);
      if (review) {
        review.deletedAt = new Date();
        
        // Recalculate
        const { activeActivities } = await import("./activityRepository");
        const act = activeActivities.find((a) => a.id === review.activityId);
        if (act) {
          const orgId = act.organizationId;
          const orgReviews = activeReviews.filter(r => {
            const matchingAct = activeActivities.find(a => a.id === r.activityId);
            return matchingAct ? matchingAct.organizationId === orgId && !r.deletedAt : false;
          });

          const count = orgReviews.length;
          const sum = orgReviews.reduce((acc, r) => acc + r.rating, 0);
          const rating = count > 0 ? (sum / count).toFixed(2) : "0.00";

          const { organizationRepository } = await import("./organizationRepository");
          await organizationRepository.updateStats(orgId, {
            reviewsCount: count,
            rating: rating
          });
        }
      }
    }
  },

  async _recalculateOrganizationStats(tx: any, organizationId: string): Promise<void> {
    const statsResult = await tx
      .select({
        count: sql<number>`count(${reviews.id})::int`,
        avgRating: sql<string>`coalesce(avg(${reviews.rating})::numeric(3,2), '0.00')`,
      })
      .from(reviews)
      .innerJoin(activities, eq(reviews.activityId, activities.id))
      .where(
        and(
          eq(activities.organizationId, organizationId),
          isNull(reviews.deletedAt),
          isNull(activities.deletedAt)
        )
      );

    const count = statsResult[0]?.count || 0;
    const rating = statsResult[0]?.avgRating || "0.00";

    await tx
      .update(organizationStats)
      .set({
        reviewsCount: count,
        rating: rating,
      })
      .where(eq(organizationStats.organizationId, organizationId));
  },
};
