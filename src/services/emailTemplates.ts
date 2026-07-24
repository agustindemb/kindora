const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kindora</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; color: #18181b; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; }
    .header { background: linear-gradient(135deg, #064e3b 0%, #09090b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-badge { background-color: #10b981; color: #ffffff; width: 36px; height: 36px; line-height: 36px; border-radius: 10px; display: inline-block; text-align: center; margin-right: 8px; font-weight: 800; }
    .body { padding: 32px 24px; font-size: 15px; line-height: 1.6; color: #27272a; }
    .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin-top: 20px; text-align: center; }
    .footer { background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }
    .card { background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-badge">K</span>indora
      </div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Kindora. Impacto positivo e inclusión social en tu comunidad.</p>
      <p>Powered by <a href="https://proasc.com" style="color: #10b981; text-decoration: none; font-weight: 600;">proasc.com</a></p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplate = {
  accountCreated({ userName }: { userName: string }) {
    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">¡Hola, ${userName}! 💚</h2>
      <p>Te damos una cálida bienvenida a <strong>Kindora</strong>, la plataforma que conecta personas con talleres, voluntariados y experiencias inclusivas en toda la comunidad.</p>
      <p>A partir de ahora podés explorar actividades cerca tuyo, anotarte en un click y guardar tus favoritas.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/explorar" class="btn">Explorar Actividades</a>
      </div>
    `);
  },

  orgApproved({ orgName }: { orgName: string }) {
    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">¡Felicitaciones, ${orgName}! 🛡️</h2>
      <p>Queremos informarte que la solicitud de verificación para tu organización ha sido <strong>aprobada por el equipo administrador de Kindora</strong>.</p>
      <p>Tu organización ahora cuenta con el sello oficial de verificación visible para toda la comunidad y podés comenzar a publicar voluntariados y talleres.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/dashboard/organizador" class="btn">Ir a mi Panel de Organización</a>
      </div>
    `);
  },

  activityRegistration({ userName, activity }: { userName: string; activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string } }) {
    const formattedDate = new Date(activity.startsAt).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">¡Inscripción confirmada! 📅</h2>
      <p>Hola <strong>${userName}</strong>, tu lugar para la siguiente actividad ya está reservado:</p>
      
      <div class="card">
        <h3 style="margin: 0 0 8px 0; color: #09090b; font-size: 16px;">${activity.title}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">🗓️ <strong>Fecha:</strong> ${formattedDate} hs</p>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">📍 <strong>Lugar:</strong> ${activity.address ? `${activity.address}, ${activity.city}` : activity.city}</p>
      </div>

      <p>Recibirás un recordatorio antes del inicio de la actividad.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/actividad/${activity.id}-${activity.slug}" class="btn">Ver Detalles de la Actividad</a>
      </div>
    `);
  },

  activityReminder({ userName, activity }: { userName: string; activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string } }) {
    const formattedDate = new Date(activity.startsAt).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">¡Recordatorio de Actividad! ⏰</h2>
      <p>Hola <strong>${userName}</strong>, te recordamos que mañana participás de:</p>
      
      <div class="card">
        <h3 style="margin: 0 0 8px 0; color: #09090b; font-size: 16px;">${activity.title}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">🗓️ <strong>Horario:</strong> ${formattedDate} hs</p>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">📍 <strong>Dirección:</strong> ${activity.address ? `${activity.address}, ${activity.city}` : activity.city}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/dashboard/participante" class="btn">Ver en Mi Cuenta</a>
      </div>
    `);
  },

  activityCancelled({ userName, activityTitle, reason }: { userName: string; activityTitle: string; reason?: string }) {
    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #dc2626;">Aviso de Cancelación ⚠️</h2>
      <p>Hola <strong>${userName}</strong>, la organización nos ha informado que la actividad <strong>${activityTitle}</strong> ha sido cancelada.</p>
      ${reason ? `<div class="card"><p style="margin: 0; color: #7f1d1d; font-size: 14px;"><strong>Motivo:</strong> ${reason}</p></div>` : ''}
      <p>Te invitamos a explorar otras actividades disponibles en tu zona.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/explorar" class="btn">Descubrir Otras Actividades</a>
      </div>
    `);
  },

  activityUpdated({ userName, activity }: { userName: string; activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string } }) {
    const formattedDate = new Date(activity.startsAt).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">Actualización de Actividad 🔄</h2>
      <p>Hola <strong>${userName}</strong>, la información de la actividad <strong>${activity.title}</strong> en la que estás inscripto/a se ha actualizado:</p>
      
      <div class="card">
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">🗓️ <strong>Nuevo Horario:</strong> ${formattedDate} hs</p>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">📍 <strong>Ubicación:</strong> ${activity.address ? `${activity.address}, ${activity.city}` : activity.city}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/actividad/${activity.id}-${activity.slug}" class="btn">Ver Información Actualizada</a>
      </div>
    `);
  },

  activityVolunteer({ userName, activity }: { userName: string; activity: { title: string; startsAt: Date | string; city: string; address?: string; id: string; slug: string } }) {
    const formattedDate = new Date(activity.startsAt).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">¡Gracias por tu voluntad de ayudar! 🌱</h2>
      <p>Hola <strong>${userName}</strong>, tu solicitud como <strong>voluntario/a</strong> para la siguiente actividad ha sido registrada:</p>

      <div class="card">
        <h3 style="margin: 0 0 8px 0; color: #09090b; font-size: 16px;">${activity.title}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">🗓️ <strong>Fecha:</strong> ${formattedDate} hs</p>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;">📍 <strong>Lugar:</strong> ${activity.address ? `${activity.address}, ${activity.city}` : activity.city}</p>
      </div>

      <p>El equipo organizador revisará tu solicitud y se pondrá en contacto con vos antes de la actividad para coordinar los detalles de tu colaboración.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/actividad/${activity.id}-${activity.slug}" class="btn">Ver Detalles de la Actividad</a>
      </div>
    `);
  },

  newVolunteerAlert({ orgName, info }: { orgName: string; info: { volunteerName: string; volunteerEmail: string; activityTitle: string; activityId: string; activitySlug: string } }) {
    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: #09090b;">🌱 Nuevo/a voluntario/a se postuló</h2>
      <p>Hola equipo de <strong>${orgName}</strong>, un/a participante se ha ofrecido como voluntario/a en una de tus actividades:</p>

      <div class="card">
        <h3 style="margin: 0 0 12px 0; color: #09090b; font-size: 15px;">📋 ${info.activityTitle}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;"><strong>Nombre:</strong> ${info.volunteerName}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #52525b;"><strong>Correo:</strong> <a href="mailto:${info.volunteerEmail}" style="color: #10b981;">${info.volunteerEmail}</a></p>
      </div>

      <p>Podés revisar sus respuestas y gestionar la aprobación desde tu panel de organización.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/dashboard/organizador" class="btn">Ir al Panel de Organización</a>
      </div>
    `);
  },

  volunteerStatusChanged({ userName, activityTitle, status }: { userName: string; activityTitle: string; status: 'approved' | 'rejected' }) {
    const isApproved = status === 'approved';
    return baseLayout(`
      <h2 style="font-size: 22px; font-weight: 800; margin-top: 0; color: ${isApproved ? '#064e3b' : '#b91c1c'};">
        ${isApproved ? '¡Solicitud de voluntariado aprobada! 🌱' : 'Actualización de solicitud de voluntariado'}
      </h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>La organización ha ${isApproved ? '<strong>aprobado tu postulación</strong> como voluntario/a' : 'revisado tu postulación como voluntario/a'} para la actividad <strong>${activityTitle}</strong>.</p>
      ${isApproved ? '<p>¡Muchas gracias por tu compromiso! El equipo organizador se comunicará con vos para coordinar los próximos pasos.</p>' : '<p>En esta ocasión la organización no ha podido procesar la postulación, pero te invitamos a seguir sumándote a otras iniciativas comunitarias.</p>'}
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://kindora.com.ar/dashboard/participante" class="btn">Ir a Mi Panel de Participante</a>
      </div>
    `);
  },
};
