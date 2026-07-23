# Kindora 🧩

Kindora es una plataforma web moderna que conecta personas, organizaciones, fundaciones y municipios a través de actividades con impacto positivo. 

## 🚀 Tecnologías

- **Frontend**: Astro 5 (Vite) + TypeScript
- **Estilos**: TailwindCSS v4 (con la nueva integración de Vite `@tailwindcss/vite`)
- **Base de Datos**: PostgreSQL (Supabase) + Drizzle ORM
- **Autenticación**: Better Auth
- **Mapas**: Leaflet + OpenStreetMap (100% gratuito, sin necesidad de API Keys)
- **Validaciones**: Zod
- **Animaciones**: Transiciones de CSS nativas de alto rendimiento
- **Iconos**: Lucide Astro

---

## 💻 Desarrollo Local

### 1. Clonar e Instalar dependencias
Asegurate de estar en el directorio raíz del proyecto y ejecutá:
```bash
npm install
```

### 2. Configurar variables de entorno (`.env`)
El proyecto incluye un archivo `.env` configurado por defecto.
Si tenés un servidor PostgreSQL o un proyecto en Supabase, podés agregar tu string de conexión en `DATABASE_URL`:
```env
DATABASE_URL=postgresql://usuario:contraseña@servidor:5432/kindora
```

### 3. Migraciones y Seed (Opcional, si tenés base de datos)
Si configuraste tu base de datos PostgreSQL, podés generar las tablas y llenarla de datos argentinos de prueba ejecutando:
```bash
# Sincronizar esquema
npm run db:push

# Semillar datos de prueba
npm run db:seed
```

> **⚡ Modo Preview Zero-Config:** Si no tenés una base de datos PostgreSQL activa localmente o en Supabase, **Kindora se ejecutará en modo lectura/escritura en memoria simulada (Mock Mode) de forma automática**. Podrás navegar, buscar actividades con el buscador inteligente (Airbnb style), seguir organizaciones, ver el mapa interactivo y loguearte con un solo click para testear todas las pantallas. ¡Ideal para pruebas rápidas!

### 4. Iniciar servidor de desarrollo
Iniciá el servidor en segundo plano siguiendo la regla de desarrollo de Kindora:
```bash
astro dev --background
```
*Podés consultar el estado del servidor con `astro dev status` y los registros con `astro dev logs`.*

---

## 👥 Cuentas de Prueba (Mocks de Acceso Rápido)
Cuando navegues a `/login`, encontrarás botones para iniciar sesión al instante con un solo click con los siguientes perfiles prediseñados:

1. **Participante**: Juan Pérez (`participante@kindora.com`) - Permite buscar, guardar en favoritos y registrarse a actividades.
2. **Organizador**: María Gómez (`organizador@kindora.com`) - Permite ver el panel de la organización, registrar asistencia de participantes, editar datos de la organización y crear actividades mediante el creador paso a paso.
3. **Administrador**: Admin Kindora (`admin@kindora.com`) - Permite ingresar al Panel de Administración y aprobar/rechazar solicitudes de verificación de organizaciones con insignias visibles.

---

## 📂 Estructura del Ecosistema

- `src/lib/db/schema.ts` - Definición del esquema PostgreSQL.
- `src/lib/db/mocks.ts` - Modelos de datos simulados y cargadores para el modo preview.
- `src/lib/repositories/` - Capa de datos desacoplada (Repositories Pattern).
- `src/services/` - Servicios independientes para búsquedas inteligentes (`searchService`) y envío de notificaciones unificadas (`notificationService`).
- `src/components/` - Tarjetas de actividades, mapas Leaflet y barras de navegación premium.
- `src/pages/` - Enrutador de páginas públicas y dashboards adaptados para participantes, organizaciones y administradores.
