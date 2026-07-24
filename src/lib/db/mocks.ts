export interface MockLocation {
  id: string;
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface MockTag {
  id: string;
  name: string;
  slug: string;
}

export interface MockAccessibilityFeature {
  id: string;
  name: string;
  icon: string;
}

export interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  description: string;
  mission: string;
  type: string;
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  contactPerson?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  foundedAt?: Date;
  verifiedAt?: Date;
  verificationLevel: string;
}

export interface MockActivity {
  id: string;
  organizationId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  locationId: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  capacity: number;
  price: string;
  registrationType: string;
  externalUrl?: string;
  visibility: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  createdAt: Date;
}

// 1. Categories
export const mockCategories: MockCategory[] = [
  { id: "cat-1", name: "Autismo", slug: "autismo", icon: "Puzzle", color: "sky-500" },
  { id: "cat-2", name: "Discapacidad", slug: "discapacidad", icon: "Accessibility", color: "indigo-500" },
  { id: "cat-3", name: "Infancias", slug: "infancias", icon: "Baby", color: "pink-500" },
  { id: "cat-4", name: "Adultos mayores", slug: "adultos-mayores", icon: "HeartHandshake", color: "amber-500" },
  { id: "cat-5", name: "Voluntariado", slug: "voluntariado", icon: "HandsHelping", color: "emerald-500" },
  { id: "cat-6", name: "Medio ambiente", slug: "medio-ambiente", icon: "Leaf", color: "green-500" },
  { id: "cat-7", name: "Salud mental", slug: "salud-mental", icon: "Brain", color: "violet-500" },
  { id: "cat-8", name: "Educación", slug: "educacion", icon: "BookOpen", color: "blue-500" },
  { id: "cat-9", name: "Arte y cultura", slug: "arte-y-cultura", icon: "Palette", color: "purple-500" },
  { id: "cat-10", name: "Deportes", slug: "deportes", icon: "Activity", color: "teal-500" },
  { id: "cat-11", name: "Rescate animal", slug: "rescate-animal", icon: "PawPrint", color: "rose-500" },
  { id: "cat-12", name: "Comunidad", slug: "comunidad", icon: "Home", color: "zinc-500" }
];

// 2. Accessibility
export const mockAccessibility: MockAccessibilityFeature[] = [
  { id: "a11y-1", name: "Apto para personas con TEA", icon: "Smile" },
  { id: "a11y-2", name: "Acceso para silla de ruedas", icon: "Wheelchair" },
  { id: "a11y-3", name: "Baño accesible", icon: "Toilet" },
  { id: "a11y-4", name: "Intérprete de lengua de señas", icon: "Hand" },
  { id: "a11y-5", name: "Espacio tranquilo", icon: "VolumeX" },
  { id: "a11y-6", name: "Apto para familias", icon: "Users" }
];

// 3. Tags
export const mockTags: MockTag[] = [
  { id: "tag-1", name: "Gratuito", slug: "gratuito" },
  { id: "tag-2", name: "Taller", slug: "taller" },
  { id: "tag-3", name: "Charla", slug: "charla" },
  { id: "tag-4", name: "Aire libre", slug: "aire-libre" },
  { id: "tag-5", name: "Niños", slug: "ninos" },
  { id: "tag-6", name: "Música", slug: "musica" },
  { id: "tag-7", name: "Caminata", slug: "caminata" },
  { id: "tag-8", name: "Sensorial", slug: "sensorial" },
  { id: "tag-9", name: "Deporte", slug: "deporte" }
];

// 4. Locations
export const mockLocations: MockLocation[] = [
  { id: "loc-1", address: "Av. Del Libertador 1200", city: "Tigre", province: "Buenos Aires", country: "Argentina", latitude: -34.425084, longitude: -58.579612 },
  { id: "loc-2", address: "Costa Rica 4800", city: "Palermo", province: "CABA", country: "Argentina", latitude: -34.588523, longitude: -58.430623 },
  { id: "loc-3", address: "Bv. Chacabuco 600", city: "Córdoba Capital", province: "Córdoba", country: "Argentina", latitude: -31.424345, longitude: -64.183424 },
  { id: "loc-4", address: "Av. Pellegrini 1500", city: "Rosario", province: "Santa Fe", country: "Argentina", latitude: -32.959243, longitude: -60.658234 }
];

// 5. Organizations
export const mockOrganizations: MockOrganization[] = [
  {
    id: "org-1",
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
    foundedAt: new Date(2015, 4, 10),
    verifiedAt: new Date(),
    verificationLevel: "foundation"
  },
  {
    id: "org-2",
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
    foundedAt: new Date(2019, 8, 20),
    verifiedAt: new Date(),
    verificationLevel: "verified"
  },
  {
    id: "org-3",
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
    foundedAt: new Date(2012, 1, 15),
    verifiedAt: new Date(),
    verificationLevel: "official"
  },
  {
    id: "org-4",
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
    foundedAt: new Date(2021, 10, 1),
    verifiedAt: new Date(),
    verificationLevel: "verified"
  }
];

// 6. Activities
export const mockActivities: MockActivity[] = [
  {
    id: "act-1",
    organizationId: "org-1",
    categoryId: "cat-1",
    title: "Taller de Juego Sensorial y Social",
    slug: "taller-juego-sensorial-social",
    description: "Un espacio de juego adaptado para niños y niñas con autismo, facilitado por terapeutas especializados en integración sensorial. Realizaremos actividades táctiles, musicales y corporales enfocadas en la interacción social en un ambiente cuidado con estímulos controlados.",
    locationId: "loc-3",
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    timezone: "America/Argentina/Buenos_Aires",
    capacity: 15,
    price: "0.00",
    registrationType: "approval_required",
    visibility: "public",
    contactName: "Lorena Barrera",
    contactEmail: "lorena@teacordoba.org",
    contactPhone: "+543515551234",
    status: "published",
    createdAt: new Date()
  },
  {
    id: "act-2",
    organizationId: "org-2",
    categoryId: "cat-6",
    title: "Jornada de Plantación de Árboles Nativos",
    slug: "plantacion-nativos-delta",
    description: "Sumate como voluntario a nuestra jornada de reforestación del bosque nativo del delta. Plantaremos más de 50 ejemplares de especies locales para recuperar la biodiversidad de la isla. Incluye charla sobre biodiversidad local y refrigerio vegetariano.",
    locationId: "loc-1",
    startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    timezone: "America/Argentina/Buenos_Aires",
    capacity: 30,
    price: "0.00",
    registrationType: "open",
    visibility: "public",
    contactName: "Esteban Russo",
    contactEmail: "esteban@huertadelta.org",
    contactPhone: "+541166667777",
    status: "published",
    createdAt: new Date()
  },
  {
    id: "act-3",
    organizationId: "org-3",
    categoryId: "cat-2",
    title: "Clase Abierta de Básquet Adaptado en Silla de Ruedas",
    slug: "basquet-adaptado-silla-ruedas",
    description: "Vení a compartir una tarde de deporte inclusivo. Prestamos sillas de ruedas adaptadas para juego deportivo a todos los asistentes. No es necesario tener experiencia previa, solo ganas de divertirte y entrenar con el equipo oficial del club.",
    locationId: "loc-4",
    startsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days in future (Saturday)
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    timezone: "America/Argentina/Buenos_Aires",
    capacity: 20,
    price: "0.00",
    registrationType: "open",
    visibility: "public",
    contactName: "Damián Rossi",
    contactEmail: "deportes@inclusivorosario.org",
    status: "published",
    createdAt: new Date()
  },
  {
    id: "act-4",
    organizationId: "org-4",
    categoryId: "cat-11",
    title: "Feria de Adopción Responsable y Colecta",
    slug: "feria-adopcion-colecta-palermo",
    description: "Acercate a conocer a nuestros perros y gatos rescatados que buscan un hogar definitivo o tránsito. Estaremos recibiendo donaciones de alimento balanceado, correas, mantas y piedritas sanitarias. Habrá actividades infantiles y buffet solidario.",
    locationId: "loc-2",
    startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    timezone: "America/Argentina/Buenos_Aires",
    capacity: 100,
    price: "0.00",
    registrationType: "open",
    visibility: "public",
    contactName: "Paula Fernández",
    status: "published",
    createdAt: new Date()
  },
  {
    id: "act-5",
    organizationId: "org-1",
    categoryId: "cat-1",
    title: "Charla de Crianza Respetuosa y Neurodiversidad",
    slug: "charla-crianza-respetuosa-neurodiversidad",
    description: "Charla abierta de orientación para familias de niños recientemente diagnosticados con condiciones del espectro autista. Espacio de intercambio de experiencias liderado por la Lic. Laura Altieri.",
    locationId: "loc-3",
    startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days in past
    endsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    timezone: "America/Argentina/Buenos_Aires",
    capacity: 25,
    price: "0.00",
    registrationType: "open",
    visibility: "public",
    status: "completed",
    createdAt: new Date()
  }
];

// Activity images mock
export const mockActivityImages = [
  { id: "img-1", activityId: "act-1", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800", order: 1, isCover: true },
  { id: "img-2", activityId: "act-2", url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800", order: 1, isCover: true },
  { id: "img-3", activityId: "act-3", url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800", order: 1, isCover: true },
  { id: "img-4", activityId: "act-4", url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800", order: 1, isCover: true },
  { id: "img-5", activityId: "act-5", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800", order: 1, isCover: true }
];

// Reviews mock
export const mockReviews = [
  {
    id: "rev-1",
    activityId: "act-5",
    userId: "usr-3",
    rating: 5,
    comment: "Excelente la charla de Laura. Brindó herramientas sumamente útiles para el día a día y nos hizo sentir comprendidos y acompañados en todo momento. ¡Muchas gracias!",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    user: { id: "usr-3", name: "Juan Pérez", email: "participante@kindora.com", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" }
  }
];

// Organization Stats mock
export const mockOrganizationStats = [
  { organizationId: "org-1", followers: 12, activitiesCount: 2, participantsCount: 45, views: 120, reviewsCount: 1, rating: "5.00" },
  { organizationId: "org-2", followers: 8, activitiesCount: 1, participantsCount: 15, views: 64, reviewsCount: 0, rating: "0.00" },
  { organizationId: "org-3", followers: 23, activitiesCount: 1, participantsCount: 20, views: 98, reviewsCount: 0, rating: "0.00" },
  { organizationId: "org-4", followers: 34, activitiesCount: 1, participantsCount: 65, views: 245, reviewsCount: 0, rating: "0.00" }
];
