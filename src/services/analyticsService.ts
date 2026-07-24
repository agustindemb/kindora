import { db } from "../lib/db/client";
import { analyticsEvents } from "../lib/db/schema";
import { sql, gte, eq, desc } from "drizzle-orm";

export interface EventPayload {
  eventName: 'user_signup' | 'org_signup' | 'activity_created' | 'activity_viewed' | 'join_clicked' | 'registration_completed' | 'org_verified' | 'activity_shared';
  userId?: string;
  activityId?: string;
  organizationId?: string;
  metadata?: string;
}

export const analyticsService = {
  async track(payload: EventPayload): Promise<void> {
    try {
      await db.insert(analyticsEvents).values({
        eventName: payload.eventName,
        userId: payload.userId || null,
        activityId: payload.activityId || null,
        organizationId: payload.organizationId || null,
        metadata: payload.metadata || null,
      });
    } catch (err) {
      console.warn(`[Analytics] Error tracking event ${payload.eventName}:`, err);
    }
  },

  async getAdminMetrics() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Active Users (Events in last 24h & 7d)
      const [dauRes] = await db
        .select({ count: sql`count(distinct ${analyticsEvents.userId})::int` })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, oneDayAgo));

      const [wauRes] = await db
        .select({ count: sql`count(distinct ${analyticsEvents.userId})::int` })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, sevenDaysAgo));

      // Event Counts
      const [viewsRes] = await db
        .select({ count: sql`count(${analyticsEvents.id})::int` })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventName, 'activity_viewed'));

      const [joinsRes] = await db
        .select({ count: sql`count(${analyticsEvents.id})::int` })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventName, 'registration_completed'));

      const totalViews = viewsRes?.count || 0;
      const totalJoins = joinsRes?.count || 0;
      const conversionRate = totalViews > 0 ? ((totalJoins / totalViews) * 100).toFixed(1) : "0.0";

      // Recent events feed
      const recentEvents = await db
        .select()
        .from(analyticsEvents)
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(20);

      return {
        dau: dauRes?.count || 0,
        wau: wauRes?.count || 0,
        totalViews,
        totalJoins,
        conversionRate,
        recentEvents,
      };
    } catch (err) {
      console.error("[Analytics] Error loading metrics:", err);
      return {
        dau: 0,
        wau: 0,
        totalViews: 0,
        totalJoins: 0,
        conversionRate: "0.0",
        recentEvents: [],
      };
    }
  }
};
