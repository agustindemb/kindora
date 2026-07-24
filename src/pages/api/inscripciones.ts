import type { APIRoute } from 'astro';
import { activityRepository } from '../../lib/repositories/activityRepository';
import { emailService } from '../../services/emailService';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Debes iniciar sesión para inscribirte en actividades.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { activityId, action } = body;

    if (!activityId) {
      return new Response(
        JSON.stringify({ error: 'ID de actividad requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const activity = await activityRepository.findById(activityId);

    if (!activity) {
      return new Response(
        JSON.stringify({ error: 'La actividad no existe o fue eliminada.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'cancel') {
      await activityRepository.unregisterParticipant(activityId, user.id);

      // Trigger cancel email asynchronously
      if (user.email) {
        emailService.sendActivityCancelled(user.email, user.name || 'Participante', activity.title);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isRegistered: false, 
          message: 'Tu inscripción ha sido cancelada exitosamente.' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else if (action === 'volunteer') {
      // Register as volunteer (uses a different status)
      await activityRepository.registerParticipant(activityId, user.id, 'volunteer');

      // Send volunteer confirmation email to the participant
      if (user.email) {
        emailService.sendVolunteerRegistration(user.email, user.name || 'Participante', {
          title: activity.title,
          startsAt: activity.startsAt,
          city: activity.location?.city || 'Buenos Aires',
          address: activity.location?.address,
          id: activity.id,
          slug: activity.slug,
        });
      }

      // Notify the organizer by email
      const orgEmail = activity.contactEmail || activity.organization?.email;
      if (orgEmail) {
        emailService.sendNewVolunteerAlert(orgEmail, activity.organization?.name || 'Organización', {
          volunteerName: user.name || 'Un usuario',
          volunteerEmail: user.email || '',
          activityTitle: activity.title,
          activityId: activity.id,
          activitySlug: activity.slug,
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isVolunteering: true, 
          message: '¡Gracias por ofrecerte como voluntario/a! El equipo organizador te contactará pronto.' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Check capacity
      const capacityNum = Number(activity.capacity) || 0;
      const confirmedNum = Number(activity.confirmedRegistrations) || 0;

      if (capacityNum > 0 && confirmedNum >= capacityNum) {
        return new Response(
          JSON.stringify({ error: 'Lo sentimos, esta actividad ya no tiene cupos disponibles.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      await activityRepository.registerParticipant(activityId, user.id, 'registered');

      // Trigger registration confirmation email asynchronously
      if (user.email) {
        emailService.sendActivityRegistration(user.email, user.name || 'Participante', {
          title: activity.title,
          startsAt: activity.startsAt,
          city: activity.location?.city || 'Buenos Aires',
          address: activity.location?.address,
          id: activity.id,
          slug: activity.slug,
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          isRegistered: true, 
          message: '¡Inscripción exitosa! Te enviamos la confirmación a tu correo.' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('[API Inscripciones Error]:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la inscripción.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
