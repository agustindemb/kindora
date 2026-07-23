import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
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
