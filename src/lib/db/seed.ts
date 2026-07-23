import dotenv from "dotenv";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { eq, and, isNull, sql } from "drizzle-orm";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres_password@localhost:5432/kindora";

async function main() {
  console.log("🌱 Iniciando el semillado de la base de datos de Kindora...");

  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log("⚡ Conexión a PostgreSQL establecida.");
  } catch (err: any) {
    console.error("❌ No se pudo conectar a la base de datos. Verificá tu DATABASE_URL en el archivo .env.");
    console.error(`Detalle del error: ${err.message}`);
    process.exit(1);
  }

  const db = drizzle(client, { schema });

  try {
    // 1. Limpiar base de datos
    console.log("🧹 Limpiando tablas existentes...");
    await client.query("TRUNCATE TABLE activity_views, activity_logs, organization_logs, reports, notifications, reviews, inscriptions, bookmarks, follows, activity_tags, activity_accessibility, activity_images, activities, tags, accessibility_features, categories, organization_members, organization_stats, organization_images, organizations, session, account, \"user\", locations CASCADE;");

    // 2. Insertar Categorías
    console.log("🧩 Insertando categorías...");
    const cats = await db.insert(schema.categories).values([
      { name: "Autismo", slug: "autismo", icon: "Puzzle", color: "sky-500" },
      { name: "Discapacidad", slug: "discapacidad", icon: "Accessibility", color: "indigo-500" },
      { name: "Infancias", slug: "infancias", icon: "Baby", color: "pink-500" },
      { name: "Adultos mayores", slug: "adultos-mayores", icon: "HeartHandshake", color: "amber-500" },
      { name: "Voluntariado", slug: "voluntariado", icon: "HandsHelping", color: "emerald-500" },
      { name: "Medio ambiente", slug: "medio-ambiente", icon: "Leaf", color: "green-500" },
      { name: "Salud mental", slug: "salud-mental", icon: "Brain", color: "violet-500" },
      { name: "Educación", slug: "educacion", icon: "BookOpen", color: "blue-500" },
      { name: "Arte y cultura", slug: "arte-y-cultura", icon: "Palette", color: "purple-500" },
      { name: "Deportes", slug: "deportes", icon: "Activity", color: "teal-500" },
      { name: "Rescate animal", slug: "rescate-animal", icon: "PawPrint", color: "rose-500" },
      { name: "Comunidad", slug: "comunidad", icon: "Home", color: "zinc-500" }
    ]).returning();

    // 3. Insertar Características de Accesibilidad
    console.log("♿ Insertando características de accesibilidad...");
    const a11y = await db.insert(schema.accessibilityFeatures).values([
      { name: "Apto para personas con TEA", icon: "Smile" },
      { name: "Acceso para silla de ruedas", icon: "Wheelchair" },
      { name: "Baño accesible", icon: "Toilet" },
      { name: "Intérprete de lengua de señas", icon: "Hand" },
      { name: "Espacio tranquilo", icon: "VolumeX" },
      { name: "Apto para familias", icon: "Users" }
    ]).returning();

    // 4. Insertar Tags
    console.log("🏷️ Insertando etiquetas (tags)...");
    const tagList = await db.insert(schema.tags).values([
      { name: "Gratuito", slug: "gratuito" },
      { name: "Taller", slug: "taller" },
      { name: "Charla", slug: "charla" },
      { name: "Aire libre", slug: "aire-libre" },
      { name: "Niños", slug: "ninos" },
      { name: "Música", slug: "musica" },
      { name: "Caminata", slug: "caminata" },
      { name: "Sensorial", slug: "sensorial" },
      { name: "Deporte", slug: "deporte" }
    ]).returning();

    // 5. Insertar Usuarios de Prueba
    console.log("👤 Insertando usuarios de prueba...");
    const now = new Date();
    const testUsers = await db.insert(schema.user).values([
      {
        id: "usr_admin",
        name: "Admin Kindora",
        email: "admin@kindora.com",
        emailVerified: true,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "usr_org",
        name: "María Gómez",
        email: "organizador@kindora.com",
        emailVerified: true,
        role: "organizer",
        phone: "+5491155555555",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "usr_part",
        name: "Juan Pérez",
        email: "participante@kindora.com",
        emailVerified: true,
        role: "participant",
        phone: "+5491144444444",
        createdAt: now,
        updatedAt: now,
      }
    ]).returning();

    // 6. Insertar Ubicaciones
    console.log("📍 Insertando ubicaciones...");
    const locs = await db.insert(schema.locations).values([
      {
        address: "Av. Del Libertador 1200",
        city: "Tigre",
        province: "Buenos Aires",
        country: "Argentina",
        latitude: -34.425084,
        longitude: -58.579612
      },
      {
        address: "Costa Rica 4800",
        city: "Palermo",
        province: "CABA",
        country: "Argentina",
        latitude: -34.588523,
        longitude: -58.430623
      },
      {
        address: "Bv. Chacabuco 600",
        city: "Córdoba Capital",
        province: "Córdoba",
        country: "Argentina",
        latitude: -31.424345,
        longitude: -64.183424
      },
      {
        address: "Av. Pellegrini 1500",
        city: "Rosario",
        province: "Santa Fe",
        country: "Argentina",
        latitude: -32.959243,
        longitude: -60.658234
      }
    ]).returning();

    // 7. Insertar Organizaciones
    console.log("🏢 Insertando organizaciones...");
    const orgs = await db.insert(schema.organizations).values([
      {
        name: "Asociación TEA Córdoba",
        slug: "tea-cordoba",
        description: "Trabajamos por la inclusión y calidad de vida de personas con autismo y sus familias en la provincia de Córdoba.",
        mission: "Brindar contención, talleres y capacitaciones para visibilizar el autismo.",
        type: "Foundation",
        email: "contacto@teacordoba.org",
        phone: "+543515551234",
        whatsapp: "+5493515551234",
        contactPerson: "Lorena Barrera",
        website: "https://teacordoba.org",
        instagram: "https://instagram.com/teacordoba",
        verifiedAt: now,
        verifiedBy: "usr_admin",
        verificationLevel: "foundation"
      },
      {
        name: "Huerta Comunitaria Delta",
        slug: "huerta-delta",
        description: "Espacio comunitario agroecológico en las islas del delta para aprender a cultivar alimentos de forma sostenible.",
        mission: "Reconectar a la comunidad con el cuidado del medio ambiente a través de la tierra.",
        type: "Community Group",
        email: "hola@huertadelta.org",
        phone: "+541166667777",
        whatsapp: "+5491166667777",
        contactPerson: "Esteban Russo",
        website: "https://huertadelta.org",
        instagram: "https://instagram.com/huertadelta",
        verifiedAt: now,
        verifiedBy: "usr_admin",
        verificationLevel: "verified"
      },
      {
        name: "Club Social e Inclusivo Rosario",
        slug: "club-inclusivo-rosario",
        description: "Club deportivo y social adaptado para personas con discapacidad motriz e intelectual.",
        mission: "Democratizar el acceso al deporte y al juego inclusivo.",
        type: "NGO",
        email: "deportes@inclusivorosario.org",
        phone: "+543414445555",
        whatsapp: "+5493414445555",
        contactPerson: "Damián Rossi",
        website: "https://inclusivorosario.org",
        instagram: "https://instagram.com/clubinclusivorosario",
        verifiedAt: now,
        verifiedBy: "usr_admin",
        verificationLevel: "official"
      },
      {
        name: "Patitas de Palermo",
        slug: "patitas-palermo",
        description: "Red de rescatistas independientes dedicados al rescate, tránsito y adopción responsable de perros y gatos en CABA.",
        mission: "Dar una segunda oportunidad a animales en situación de calle.",
        type: "Community Group",
        email: "adopciones@patitaspalermo.org",
        phone: "+541133334444",
        whatsapp: "+5491133334444",
        contactPerson: "Paula Fernández",
        instagram: "https://instagram.com/patitaspalermo",
        verifiedAt: now,
        verifiedBy: "usr_admin",
        verificationLevel: "verified"
      }
    ]).returning();

    // Insertar miembros de organizaciones
    console.log("👥 Vinculando miembros a organizaciones...");
    await db.insert(schema.organizationMembers).values([
      { organizationId: orgs[0].id, userId: "usr_org", role: "owner" },
      { organizationId: orgs[1].id, userId: "usr_org", role: "owner" },
      { organizationId: orgs[2].id, userId: "usr_org", role: "admin" },
      { organizationId: orgs[3].id, userId: "usr_org", role: "editor" }
    ]);

    // Inicializar estadísticas de organizaciones
    console.log("📊 Inicializando estadísticas de organizaciones...");
    await db.insert(schema.organizationStats).values(
      orgs.map((org) => ({
        organizationId: org.id,
        followers: 12,
        activitiesCount: 2,
        participantsCount: 45,
        views: 120,
        reviewsCount: 0,
        rating: "0.00"
      }))
    );

    // 8. Insertar Actividades
    console.log("📅 Creando actividades...");
    
    // Actividad 1: Taller Sensorial (TEA) - Córdoba
    const starts1 = new Date();
    starts1.setDate(starts1.getDate() + 2); // 2 days in the future
    starts1.setHours(10, 0, 0, 0);
    const ends1 = new Date(starts1);
    ends1.setHours(12, 0, 0, 0);

    const act1 = await db.insert(schema.activities).values({
      organizationId: orgs[0].id,
      categoryId: cats[0].id, // Autismo
      title: "Taller de Juego Sensorial y Social",
      slug: "taller-juego-sensorial-social",
      description: "Un espacio de juego adaptado para niños y niñas con autismo, facilitado por terapeutas especializados en integración sensorial. Realizaremos actividades táctiles, musicales y corporales enfocadas en la interacción social en un ambiente cuidado con estímulos controlados.",
      locationId: locs[2].id, // Cordoba
      startsAt: starts1,
      endsAt: ends1,
      capacity: 15,
      price: "0.00",
      registrationType: "approval_required",
      visibility: "public",
      contactName: "Lorena Barrera",
      contactEmail: "lorena@teacordoba.org",
      contactPhone: "+543515551234",
      status: "published"
    }).returning();

    // Actividad 2: Jornada Ambiental - Tigre
    const starts2 = new Date();
    starts2.setDate(starts2.getDate() + 5); // 5 days in the future
    starts2.setHours(9, 30, 0, 0);
    const ends2 = new Date(starts2);
    ends2.setHours(13, 0, 0, 0);

    const act2 = await db.insert(schema.activities).values({
      organizationId: orgs[1].id,
      categoryId: cats[5].id, // Medio ambiente
      title: "Jornada de Plantación de Árboles Nativos",
      slug: "plantacion-nativos-delta",
      description: "Sumate como voluntario a nuestra jornada de reforestación del bosque nativo del delta. Plantaremos más de 50 ejemplares de especies locales para recuperar la biodiversidad de la isla. Incluye charla sobre biodiversidad local y refrigerio vegetariano.",
      locationId: locs[0].id, // Tigre
      startsAt: starts2,
      endsAt: ends2,
      capacity: 30,
      price: "0.00",
      registrationType: "open",
      visibility: "public",
      contactName: "Esteban Russo",
      contactEmail: "esteban@huertadelta.org",
      contactPhone: "+541166667777",
      status: "published"
    }).returning();

    // Actividad 3: Básquet Inclusivo - Rosario
    const starts3 = new Date();
    starts3.setDate(starts3.getDate() + 6); // 6 days in the future (Saturday)
    starts3.setHours(15, 0, 0, 0);
    const ends3 = new Date(starts3);
    ends3.setHours(17, 0, 0, 0);

    const act3 = await db.insert(schema.activities).values({
      organizationId: orgs[2].id,
      categoryId: cats[1].id, // Discapacidad
      title: "Clase Abierta de Básquet Adaptado en Silla de Ruedas",
      slug: "basquet-adaptado-silla-ruedas",
      description: "Vení a compartir una tarde de deporte inclusivo. Prestamos sillas de ruedas adaptadas para juego deportivo a todos los asistentes. No es necesario tener experiencia previa, solo ganas de divertirte y entrenar con el equipo oficial del club.",
      locationId: locs[3].id, // Rosario
      startsAt: starts3,
      endsAt: ends3,
      capacity: 20,
      price: "0.00",
      registrationType: "open",
      visibility: "public",
      contactName: "Damián Rossi",
      contactEmail: "deportes@inclusivorosario.org",
      status: "published"
    }).returning();

    // Actividad 4: Colecta y Tránsito Animal - Palermo (CABA)
    const starts4 = new Date();
    starts4.setDate(starts4.getDate() + 3); // 3 days in the future
    starts4.setHours(11, 0, 0, 0);
    const ends4 = new Date(starts4);
    ends4.setHours(16, 0, 0, 0);

    const act4 = await db.insert(schema.activities).values({
      organizationId: orgs[3].id,
      categoryId: cats[10].id, // Rescate animal
      title: "Feria de Adopción Responsable y Colecta",
      slug: "feria-adopcion-colecta-palermo",
      description: "Acercate a conocer a nuestros perros y gatos rescatados que buscan un hogar definitivo o tránsito. Estaremos recibiendo donaciones de alimento balanceado, correas, mantas y piedritas sanitarias. Habrá actividades infantiles y buffet solidario.",
      locationId: locs[1].id, // Palermo
      startsAt: starts4,
      endsAt: ends4,
      capacity: 100,
      price: "0.00",
      registrationType: "open",
      visibility: "public",
      contactName: "Paula Fernández",
      status: "published"
    }).returning();

    // Actividad 5: Actividad pasada para recibir reseñas (TEA Córdoba)
    const starts5 = new Date();
    starts5.setDate(starts5.getDate() - 5); // 5 days in the past
    starts5.setHours(16, 0, 0, 0);
    const ends5 = new Date(starts5);
    ends5.setHours(18, 0, 0, 0);

    const act5 = await db.insert(schema.activities).values({
      organizationId: orgs[0].id,
      categoryId: cats[0].id,
      title: "Charla de Crianza Respetuosa y Neurodiversidad",
      slug: "charla-crianza-respetuosa-neurodiversidad",
      description: "Charla abierta de orientación para familias de niños recientemente diagnosticados con condiciones del espectro autista. Espacio de intercambio de experiencias liderado por la Lic. Laura Altieri.",
      locationId: locs[2].id,
      startsAt: starts5,
      endsAt: ends5,
      capacity: 25,
      price: "0.00",
      registrationType: "open",
      visibility: "public",
      status: "completed"
    }).returning();

    // 9. Vincular Imágenes de Actividades (mock paths)
    console.log("📸 Vinculando imágenes a actividades...");
    await db.insert(schema.activityImages).values([
      { activityId: act1[0].id, url: "/images/act_sensorial.jpg", order: 1, isCover: true },
      { activityId: act2[0].id, url: "/images/act_plantacion.jpg", order: 1, isCover: true },
      { activityId: act3[0].id, url: "/images/act_basquet.jpg", order: 1, isCover: true },
      { activityId: act4[0].id, url: "/images/act_adopcion.jpg", order: 1, isCover: true },
      { activityId: act5[0].id, url: "/images/act_charla.jpg", order: 1, isCover: true }
    ]);

    // 10. Vincular Tags y Accesibilidad
    console.log("🏷️ Vinculando tags y accesibilidad a actividades...");
    // Act 1 (TEA): Sensorial, Taller, Niños / Apto TEA, Espacio tranquilo, Apto familias
    await db.insert(schema.activityTags).values([
      { activityId: act1[0].id, tagId: tagList[7].id }, // Sensorial
      { activityId: act1[0].id, tagId: tagList[1].id }, // Taller
      { activityId: act1[0].id, tagId: tagList[4].id }  // Niños
    ]);
    await db.insert(schema.activityAccessibility).values([
      { activityId: act1[0].id, featureId: a11y[0].id }, // Apto TEA
      { activityId: act1[0].id, featureId: a11y[4].id }, // Espacio tranquilo
      { activityId: act1[0].id, featureId: a11y[5].id }  // Apto familias
    ]);

    // Act 2 (Plantacion): Aire libre, Gratuito / Acceso silla de ruedas, Apto familias
    await db.insert(schema.activityTags).values([
      { activityId: act2[0].id, tagId: tagList[3].id }, // Aire libre
      { activityId: act2[0].id, tagId: tagList[0].id }  // Gratuito
    ]);
    await db.insert(schema.activityAccessibility).values([
      { activityId: act2[0].id, featureId: a11y[1].id }, // Acceso silla
      { activityId: act2[0].id, featureId: a11y[5].id }  // Apto familias
    ]);

    // Act 3 (Basquet): Deporte, Gratuito / Acceso silla, Baño accesible, Apto familias
    await db.insert(schema.activityTags).values([
      { activityId: act3[0].id, tagId: tagList[8].id }, // Deporte
      { activityId: act3[0].id, tagId: tagList[0].id }  // Gratuito
    ]);
    await db.insert(schema.activityAccessibility).values([
      { activityId: act3[0].id, featureId: a11y[1].id }, // Acceso silla
      { activityId: act3[0].id, featureId: a11y[2].id }, // Baño accesible
      { activityId: act3[0].id, featureId: a11y[5].id }  // Apto familias
    ]);

    // Act 4 (Perros): Aire libre, Gratuito / Apto familias
    await db.insert(schema.activityTags).values([
      { activityId: act4[0].id, tagId: tagList[3].id }, // Aire libre
      { activityId: act4[0].id, tagId: tagList[0].id }  // Gratuito
    ]);
    await db.insert(schema.activityAccessibility).values([
      { activityId: act4[0].id, featureId: a11y[5].id }  // Apto familias
    ]);

    // 11. Crear Inscripciones y Reseñas
    console.log("📝 Registrando inscripciones y reseñas...");
    // Registrar usuario en actividad 1 (TEA) y 3 (Basquet)
    await db.insert(schema.inscriptions).values([
      { activityId: act1[0].id, userId: "usr_part", status: "registered" },
      { activityId: act3[0].id, userId: "usr_part", status: "registered" },
      { activityId: act5[0].id, userId: "usr_part", status: "attended" } // Asistió para poder opinar
    ]);

    // Crear reseña para la actividad pasada (Act 5)
    const review = await db.insert(schema.reviews).values({
      activityId: act5[0].id,
      userId: "usr_part",
      rating: 5,
      comment: "Excelente la charla de Laura. Brindó herramientas sumamente útiles para el día a día y nos hizo sentir comprendidos y acompañados en todo momento. ¡Muchas gracias!",
      createdAt: now
    }).returning();

    // Recalcular stats de la organización del TEA Córdoba por la reseña creada
    const statsResult = await db
      .select({
        count: sql<number>`count(${schema.reviews.id})::int`,
        avgRating: sql<string>`coalesce(avg(${schema.reviews.rating})::numeric(3,2), '0.00')`,
      })
      .from(schema.reviews)
      .innerJoin(schema.activities, eq(schema.reviews.activityId, schema.activities.id))
      .where(
        and(
          eq(schema.activities.organizationId, orgs[0].id),
          isNull(schema.reviews.deletedAt),
          isNull(schema.activities.deletedAt)
        )
      );

    await db
      .update(schema.organizationStats)
      .set({
        reviewsCount: statsResult[0]?.count || 0,
        rating: statsResult[0]?.avgRating || "0.00",
      })
      .where(eq(schema.organizationStats.organizationId, orgs[0].id));

    // Seguir a la organización
    await db.insert(schema.follows).values({
      userId: "usr_part",
      organizationId: orgs[0].id
    });

    // Guardar en favoritos (Bookmark)
    await db.insert(schema.bookmarks).values({
      userId: "usr_part",
      activityId: act1[0].id
    });

    // Crear una vista
    await db.insert(schema.activityViews).values({
      activityId: act1[0].id,
      userId: "usr_part",
      date: now
    });

    console.log("✅ ¡Semillado de base de datos finalizado con éxito!");
  } catch (err: any) {
    console.error("❌ Ocurrió un error durante el semillado de datos:");
    console.error(err.stack || err.message);
  } finally {
    await client.end();
  }
}

main();
