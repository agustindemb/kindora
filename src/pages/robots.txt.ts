import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://kindora.com.ar/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
