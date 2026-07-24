import type { APIRoute } from 'astro';
import { activityRepository } from '../../lib/repositories/activityRepository';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Debes iniciar sesión para guardar actividades.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { activityId } = body;

    if (!activityId) {
      return new Response(
        JSON.stringify({ error: 'ID de actividad no especificado.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isAlreadyBookmarked = await activityRepository.isBookmarked(user.id, activityId);

    if (isAlreadyBookmarked) {
      await activityRepository.unbookmark(user.id, activityId);
      return new Response(
        JSON.stringify({ isBookmarked: false, message: 'Eliminado de tus favoritos.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      await activityRepository.bookmark(user.id, activityId);
      return new Response(
        JSON.stringify({ isBookmarked: true, message: '¡Guardado en tus favoritos!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('[API Favoritos Error]:', error);
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud de favoritos.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
