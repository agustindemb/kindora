import type { APIRoute } from 'astro';
import { reviewRepository } from '../../lib/repositories/reviewRepository';
import { activityRepository } from '../../lib/repositories/activityRepository';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Debes iniciar sesión para dejar una reseña.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { activityId, rating, comment } = body;

    if (!activityId) {
      return new Response(
        JSON.stringify({ error: 'ID de actividad requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return new Response(
        JSON.stringify({ error: 'La calificación debe ser entre 1 y 5 estrellas.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Por favor escribí un comentario para tu reseña.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify activity exists
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      return new Response(
        JSON.stringify({ error: 'La actividad no existe.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save review and trigger organization rating recalculation
    await reviewRepository.create({
      activityId,
      userId: user.id,
      rating: ratingNum,
      comment: comment.trim(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: '¡Gracias por dejar tu reseña! Ayuda a mantener transparente nuestra comunidad.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[API Reseñas Error]:', error);
    return new Response(
      JSON.stringify({ error: 'Error al publicar la reseña.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
