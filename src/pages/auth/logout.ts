import type { APIRoute } from "astro";
import { auth } from "../../lib/auth/auth";

export const ALL: APIRoute = async (context) => {
  try {
    // 1. Call Better Auth native sign out to invalidate session in DB
    await auth.api.signOut({
      headers: context.request.headers,
    });
  } catch (e) {
    console.warn("Failed to sign out session in Better Auth:", e);
  }

  // 2. Clear both standard and secure session cookies
  context.cookies.delete("better-auth.session_token", { path: "/" });
  context.cookies.delete("__secure-better-auth.session_token", { path: "/" });

  const reason = context.url.searchParams.get("reason");
  if (reason === "idle") {
    return context.redirect("/login?reason=idle");
  }

  // Redirect to home by default
  return context.redirect("/");
};
