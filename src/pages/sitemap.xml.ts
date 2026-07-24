import type { APIRoute } from "astro";
import { db } from "../lib/db/client";
import { activities, organizations, categories } from "../lib/db/schema";
import { isNull, eq, and } from "drizzle-orm";

export const GET: APIRoute = async ({ request }) => {
  const baseUrl = "https://kindora.proasc.com";

  const staticPages = [
    "",
    "/explorar",
    "/login",
    "/ciudad/buenos-aires",
    "/ciudad/cordoba",
    "/ciudad/rosario",
    "/ciudad/tigre",
    "/categoria/autismo",
    "/categoria/discapacidad",
    "/categoria/medio-ambiente",
    "/categoria/voluntariado",
  ];

  let dynamicPages: string[] = [];

  try {
    const activeActs = await db
      .select({ id: activities.id, slug: activities.slug, updatedAt: activities.createdAt })
      .from(activities)
      .where(and(isNull(activities.deletedAt), eq(activities.status, "published")));

    activeActs.forEach((a) => {
      dynamicPages.push(`/actividad/${a.id}-${a.slug}`);
    });

    const activeOrgs = await db
      .select({ id: organizations.id })
      .from(organizations);

    activeOrgs.forEach((o) => {
      dynamicPages.push(`/organizacion/${o.id}`);
    });
  } catch (e) {}

  const allUrls = [...staticPages, ...dynamicPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === "" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
