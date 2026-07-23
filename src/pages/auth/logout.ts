import type { APIRoute } from "astro";
import { db } from "../../lib/db/client";
import { session } from "../../lib/db/schema";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (context) => {
  const sessionToken = context.cookies.get("better-auth.session_token")?.value;

  if (sessionToken) {
    try {
      // 1. Delete session from database
      await db.delete(session).where(eq(session.token, sessionToken));
    } catch (e) {
      console.warn("Failed to delete session in DB during logout (falling back to clearing cookies):", e);
    }

    // 2. Clear cookie
    context.cookies.delete("better-auth.session_token", { path: "/" });
  }

  // Redirect to home
  return context.redirect("/");
};
