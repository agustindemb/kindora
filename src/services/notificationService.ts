import { db } from "../lib/db/client";
import { notifications, user } from "../lib/db/schema";
import { eq } from "drizzle-orm";

export interface CreateNotificationInput {
  userId: string;
  type: "activity_created" | "reminder" | "cancellation" | "verification";
  title: string;
  body: string;
  link?: string;
}

export const notificationService = {
  async send(input: CreateNotificationInput): Promise<typeof notifications.$inferSelect> {
    let notification: typeof notifications.$inferSelect;
    
    try {
      // 1. Insert notification in database
      const results = await db
        .insert(notifications)
        .values(input)
        .returning();
      notification = results[0];
    } catch (error) {
      console.warn("DB Connection failed in notificationService, generating mock notification object.");
      notification = {
        id: `notif-${Math.random().toString(36).substr(2, 9)}`,
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link || null,
        readAt: null,
        createdAt: new Date(),
      };
    }

    // 2. Fetch user details to simulate dispatch channels
    let u = { name: "Usuario", email: "correo@ejemplo.com", phone: null as string | null };
    try {
      const recipient = await db
        .select({ email: user.email, name: user.name, phone: user.phone })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (recipient.length > 0) {
        u = recipient[0];
      }
    } catch (error) {
      // fallback mock recipient
      if (input.userId === 'usr_org') u = { name: "María Gómez", email: "organizador@kindora.com", phone: "+5491155555555" };
      else if (input.userId === 'usr_part') u = { name: "Juan Pérez", email: "participante@kindora.com", phone: "+5491144444444" };
    }

    console.log(`\n==================================================`);
    console.log(`🔔 [NOTIFICACIÓN ENVIADA]`);
    console.log(`Para: ${u.name} <${u.email}>`);
    console.log(`Tipo: ${input.type.toUpperCase()}`);
    console.log(`Título: ${input.title}`);
    console.log(`Mensaje: ${input.body}`);
    if (input.link) console.log(`Enlace: ${input.link}`);
    
    // Simulate Email
    console.log(`[Email Dispatch] Enviando correo a ${u.email}... OK`);
    
    // Simulate WhatsApp if phone is present
    if (u.phone) {
      console.log(`[WhatsApp Dispatch] Enviando mensaje a ${u.phone} (MOCK)... OK`);
    }
    
    console.log(`==================================================\n`);

    return notification;
  },

  async getUserNotifications(userId: string): Promise<typeof notifications.$inferSelect[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(notifications.createdAt);
    } catch (error) {
      console.warn("DB Connection failed in notificationService, returning empty mock notifications.");
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.warn("DB Connection failed, ignoring markAsRead.");
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.warn("DB Connection failed, ignoring markAllAsRead.");
    }
  },
};
