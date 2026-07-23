import { auth } from "./lib/auth/auth";
import { defineMiddleware } from "astro:middleware";
import { db } from "./lib/db/client";
import { user as userTable } from "./lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_DOMAIN = "@proasc.com";

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (session?.user?.id) {
      // Always fetch fresh user data from DB — never trust the session cache for roles
      const [freshUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1);

      if (freshUser) {
        // Auto-elevate @proasc.com accounts to admin if not already
        if (freshUser.email.toLowerCase().endsWith(ADMIN_DOMAIN) && freshUser.role !== "admin") {
          console.log(`[Middleware] Auto-elevating ${freshUser.email} to admin`);
          await db
            .update(userTable)
            .set({ role: "admin", updatedAt: new Date() })
            .where(eq(userTable.id, freshUser.id));
          freshUser.role = "admin";
        }

        // Support Admin Role Impersonation (View Mode)
        const realRole = freshUser.role;
        const impersonateCookie = context.cookies.get("impersonate_role")?.value;
        
        let activeRole = realRole;
        let isImpersonating = false;

        if (realRole === "admin" && impersonateCookie && ["organizer", "participant"].includes(impersonateCookie)) {
          activeRole = impersonateCookie;
          isImpersonating = true;
        }

        // Merge fresh DB data into the session user so pages see current role
        context.locals.user = { 
          ...session.user, 
          ...freshUser, 
          role: activeRole,
          realRole: realRole,
          isImpersonating: isImpersonating
        };
        context.locals.session = session.session;
      } else {
        context.locals.user = null;
        context.locals.session = null;
      }
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch (error) {
    console.error("Error retrieving session in middleware:", error);
    context.locals.user = null;
    context.locals.session = null;
  }

  return next();
});
