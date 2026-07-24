import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import { magicLink } from "better-auth/plugins";
import { user as userTable } from "../db/schema";
import { eq } from "drizzle-orm";

const ADMIN_DOMAIN = "@proasc.com";

const isAdminEmail = (email: string) => email.toLowerCase().endsWith(ADMIN_DOMAIN);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3582",
  user: {
    fields: {
      role: {
        type: "string",
        defaultValue: "participant",
      },
      phone: {
        type: "string",
      },
      deletedAt: {
        type: "date",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      scope: ["email", "public_profile"],
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          // Auto-elevate @proasc.com accounts to admin on registration
          if (isAdminEmail(userData.email)) {
            console.log(`[Auth] Auto-elevating ${userData.email} to admin (proasc.com domain)`);
            return { data: { ...userData, role: "admin" } };
          }
          return { data: userData };
        },
      },
    },
    session: {
      create: {
        before: async (sessionData) => {
          // On every new session, verify the user's role is still correct
          // This handles the case where an existing user's role needs to be updated
          try {
            const [existingUser] = await db
              .select()
              .from(userTable)
              .where(eq(userTable.id, sessionData.userId))
              .limit(1);

            if (existingUser && isAdminEmail(existingUser.email) && existingUser.role !== "admin") {
              console.log(`[Auth] Upgrading existing user ${existingUser.email} to admin on login`);
              await db
                .update(userTable)
                .set({ role: "admin", updatedAt: new Date() })
                .where(eq(userTable.id, existingUser.id));
            }
          } catch (e) {
            console.error("[Auth] Error checking user role on session create:", e);
          }
          return { data: sessionData };
        },
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(`\n==================================================`);
        console.log(`📬 [MAGIC LINK SENT]`);
        console.log(`Destinatario: ${email}`);
        console.log(`Enlace de Acceso: ${url}`);
        console.log(`==================================================\n`);

        try {
          console.log(`[Webhook Dispatch] Enviando datos a n8n para despachar correo a ${email}...`);
          const response = await fetch("https://n8n.proasc.com/webhook/e373f47c-12de-4e27-8c51-56efb8df0b8d", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              url,
            }),
          });
          if (response.ok) {
            console.log(`[Webhook Dispatch] Webhook enviado con éxito. Status: ${response.status}`);
          } else {
            console.warn(`[Webhook Dispatch] El webhook falló. Status: ${response.status}`);
          }
        } catch (webhookErr) {
          console.error("[Webhook Dispatch] Error enviando webhook a n8n:", webhookErr);
        }
      },
    }),
  ],
});
