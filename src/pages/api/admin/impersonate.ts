import type { APIRoute } from "astro";

export const POST: APIRoute = async (context) => {
  const user = context.locals.user;
  
  // Ensure user is an admin or is currently an admin impersonating another role
  if (!user || (user.role !== 'admin' && user.realRole !== 'admin')) {
    return new Response("Unauthorized", { status: 403 });
  }

  const formData = await context.request.formData();
  const targetRole = formData.get("role") as string;

  if (targetRole === "reset" || targetRole === "admin") {
    context.cookies.delete("impersonate_role", { path: "/" });
    return context.redirect("/admin");
  }

  if (targetRole === "organizer") {
    context.cookies.set("impersonate_role", "organizer", { path: "/", maxAge: 60 * 60 * 24 * 7 });
    return context.redirect("/dashboard/organizador");
  }

  if (targetRole === "participant") {
    context.cookies.set("impersonate_role", "participant", { path: "/", maxAge: 60 * 60 * 24 * 7 });
    return context.redirect("/dashboard/participante");
  }

  return context.redirect("/admin");
};
