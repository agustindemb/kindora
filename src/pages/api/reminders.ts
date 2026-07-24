import type { APIRoute } from "astro";
import { db } from "../../lib/db/client";
import { activities, inscriptions, user } from "../../lib/db/schema";
import { eq, and, isNull, gte, lte } from "drizzle-orm";
import { emailService } from "../../services/emailService";

export const GET: APIRoute = async () => {
  try {
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Find activities starting in ~24 hours
    const upcomingActs = await db
      .select()
      .from(activities)
      .where(
        and(
          isNull(activities.deletedAt),
          eq(activities.status, "published"),
          gte(activities.startsAt, in23Hours),
          lte(activities.startsAt, in25Hours)
        )
      );

    let sentCount = 0;

    for (const act of upcomingActs) {
      // Find registered participants
      const enrolled = await db
        .select({ u: user })
        .from(inscriptions)
        .innerJoin(user, eq(inscriptions.userId, user.id))
        .where(
          and(
            eq(inscriptions.activityId, act.id),
            eq(inscriptions.status, "registered")
          )
        );

      for (const { u } of enrolled) {
        if (u.email) {
          await emailService.sendActivityReminder(u.email, u.name, {
            title: act.title,
            startsAt: act.startsAt,
            city: act.timezone || "Tu Ciudad",
            id: act.id,
            slug: act.slug,
          });
          sentCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, remindersSent: sentCount }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
