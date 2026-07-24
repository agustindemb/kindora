import { emailTemplate } from "./emailTemplates";

export interface EmailPayload {
  to: string;
  subject: string;
  type: 'account_created' | 'organization_approved' | 'activity_registration' | 'activity_volunteer' | 'new_volunteer_alert' | 'activity_reminder' | 'activity_cancelled' | 'activity_updated';
  html: string;
}

const WEBHOOK_URL = "https://n8n.proasc.com/webhook/76465112-aae0-4075-a2b0-3526dce48359";

export const emailService = {
  async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      console.log(`[EmailService] Triggering email (${payload.type}) to ${payload.to}...`);
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.to,
          subject: payload.subject,
          type: payload.type,
          html: payload.html,
          sentAt: new Date().toISOString(),
        }),
      });
      console.log(`[EmailService] Email (${payload.type}) sent to ${payload.to} successfully.`);
    } catch (err) {
      console.warn(`[EmailService] Error sending email (${payload.type}) to ${payload.to}:`, err);
    }
  },

  async sendAccountCreated(userEmail: string, userName: string) {
    const html = emailTemplate.accountCreated({ userName });
    await this.sendEmail({
      to: userEmail,
      subject: "¡Bienvenido/a a Kindora! 💚",
      type: "account_created",
      html,
    });
  },

  async sendOrganizationApproved(orgEmail: string, orgName: string) {
    const html = emailTemplate.orgApproved({ orgName });
    await this.sendEmail({
      to: orgEmail,
      subject: "¡Tu Organización ha sido verificada en Kindora! 🛡️",
      type: "organization_approved",
      html,
    });
  },

  async sendActivityRegistration(userEmail: string, userName: string, activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string }) {
    const html = emailTemplate.activityRegistration({ userName, activity });
    await this.sendEmail({
      to: userEmail,
      subject: `Inscripción confirmada: ${activity.title} 📅`,
      type: "activity_registration",
      html,
    });
  },

  async sendActivityReminder(userEmail: string, userName: string, activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string }) {
    const html = emailTemplate.activityReminder({ userName, activity });
    await this.sendEmail({
      to: userEmail,
      subject: `Recordatorio: Mañana tenés ${activity.title} ⏰`,
      type: "activity_reminder",
      html,
    });
  },

  async sendActivityCancelled(userEmail: string, userName: string, activityTitle: string, reason?: string) {
    const html = emailTemplate.activityCancelled({ userName, activityTitle, reason });
    await this.sendEmail({
      to: userEmail,
      subject: `Aviso importante: Cancelación de ${activityTitle} ⚠️`,
      type: "activity_cancelled",
      html,
    });
  },

  async sendActivityUpdated(userEmail: string, userName: string, activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string }) {
    const html = emailTemplate.activityUpdated({ userName, activity });
    await this.sendEmail({
      to: userEmail,
      subject: `Actualización en tu actividad: ${activity.title} 🔄`,
      type: "activity_updated",
      html,
    });
  },

  async sendVolunteerRegistration(userEmail: string, userName: string, activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string }) {
    const html = emailTemplate.activityVolunteer({ userName, activity });
    await this.sendEmail({
      to: userEmail,
      subject: `¡Gracias por ofrecerte como voluntario/a en: ${activity.title}! 🌱`,
      type: "activity_volunteer",
      html,
    });
  },

  async sendNewVolunteerAlert(orgEmail: string, orgName: string, info: { volunteerName: string; volunteerEmail: string; activityTitle: string; activityId: string; activitySlug: string }) {
    const html = emailTemplate.newVolunteerAlert({ orgName, info });
    await this.sendEmail({
      to: orgEmail,
      subject: `🌱 Nuevo voluntario/a en tu actividad: ${info.activityTitle}`,
      type: "new_volunteer_alert",
      html,
    });
  },

  async sendVolunteerStatusUpdate(userEmail: string, userName: string, activityTitle: string, status: 'approved' | 'rejected') {
    const html = emailTemplate.volunteerStatusChanged({ userName, activityTitle, status });
    await this.sendEmail({
      to: userEmail,
      subject: status === 'approved' ? `¡Solicitud de voluntariado aprobada en ${activityTitle}! 🌱` : `Novedades sobre tu postulación en ${activityTitle}`,
      type: "activity_volunteer",
      html,
    });
  },
};
