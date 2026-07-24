import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autenticado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No se recibió ninguna imagen.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Formato no válido. Usá JPG, PNG o WEBP.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'La imagen no puede superar los 5MB.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ensure uploads dir exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create a unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const filePath = join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[upload-image] Error:', err);
    return new Response(JSON.stringify({ error: 'Error al subir la imagen.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
