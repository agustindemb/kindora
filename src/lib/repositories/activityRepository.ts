import { eq, and, isNull, sql, inArray, or, desc, asc, lte, gte } from "drizzle-orm";
import { db } from "../db/client";
import {
  activities,
  locations,
  categories,
  tags,
  activityTags,
  accessibilityFeatures,
  activityAccessibility,
  activityImages,
  activitySlugHistory,
  inscriptions,
  bookmarks,
  activityViews,
  user,
  organizations,
} from "../db/schema";
import {
  mockActivities,
  mockLocations,
  mockCategories,
  mockOrganizations,
  mockActivityImages,
  mockTags,
  mockAccessibility,
} from "../db/mocks";

export type ActivitySelect = typeof activities.$inferSelect;
export type ActivityInsert = typeof activities.$inferInsert;
export type LocationSelect = typeof locations.$inferSelect;
export type LocationInsert = typeof locations.$inferInsert;

export interface ActivityWithDetails extends ActivitySelect {
  location: LocationSelect;
  category: typeof categories.$inferSelect;
  organization: typeof organizations.$inferSelect;
  images: (typeof activityImages.$inferSelect)[];
  tags: (typeof tags.$inferSelect)[];
  accessibility: (typeof accessibilityFeatures.$inferSelect)[];
  confirmedRegistrations: number;
}

// In-memory data stores for mocks
const activeActivities = [...mockActivities];
const activeLocations = [...mockLocations];
const activeCategories = [...mockCategories];
const activeOrganizations = [...mockOrganizations];
const activeActivityImages = [...mockActivityImages];
const activeTags = [...mockTags];
const activeAccessibility = [...mockAccessibility];

const activeActivityTags: { activityId: string; tagId: string }[] = [
  { activityId: "act-1", tagId: "tag-8" }, // Sensorial
  { activityId: "act-1", tagId: "tag-2" }, // Taller
  { activityId: "act-1", tagId: "tag-5" }, // Niños
  { activityId: "act-2", tagId: "tag-4" }, // Aire libre
  { activityId: "act-2", tagId: "tag-1" }, // Gratuito
  { activityId: "act-3", tagId: "tag-9" }, // Deporte
  { activityId: "act-3", tagId: "tag-1" }, // Gratuito
  { activityId: "act-4", tagId: "tag-4" }, // Aire libre
  { activityId: "act-4", tagId: "tag-1" }  // Gratuito
];

const activeActivityAccessibility: { activityId: string; featureId: string }[] = [
  { activityId: "act-1", featureId: "a11y-1" }, // TEA
  { activityId: "act-1", featureId: "a11y-5" }, // Tranquilo
  { activityId: "act-1", featureId: "a11y-6" }, // Familias
  { activityId: "act-2", featureId: "a11y-2" }, // Silla
  { activityId: "act-2", featureId: "a11y-6" }, // Familias
  { activityId: "act-3", featureId: "a11y-2" }, // Silla
  { activityId: "act-3", featureId: "a11y-3" }, // Baño
  { activityId: "act-3", featureId: "a11y-6" }, // Familias
  { activityId: "act-4", featureId: "a11y-6" }  // Familias
];

const activeInscriptions: { id: string; activityId: string; userId: string; status: string; createdAt: Date }[] = [
  { id: "ins-1", activityId: "act-1", userId: "usr_part", status: "registered", createdAt: new Date() },
  { id: "ins-2", activityId: "act-3", userId: "usr_part", status: "registered", createdAt: new Date() },
  { id: "ins-3", activityId: "act-5", userId: "usr_part", status: "attended", createdAt: new Date() }
];

const activeBookmarks: { userId: string; activityId: string; createdAt: Date }[] = [
  { userId: "usr_part", activityId: "act-1", createdAt: new Date() }
];

const activeSlugHistory: { id: string; activityId: string; slug: string; createdAt: Date }[] = [
  { id: "sh-1", activityId: "act-1", slug: "taller-juego-sensorial-social", createdAt: new Date() },
  { id: "sh-2", activityId: "act-2", slug: "plantacion-nativos-delta", createdAt: new Date() },
  { id: "sh-3", activityId: "act-3", slug: "basquet-adaptado-silla-ruedas", createdAt: new Date() },
  { id: "sh-4", activityId: "act-4", slug: "feria-adopcion-colecta-palermo", createdAt: new Date() },
  { id: "sh-5", activityId: "act-5", slug: "charla-crianza-respetuosa-neurodiversidad", createdAt: new Date() }
];

export const activityRepository = {
  async findById(id: string): Promise<ActivityWithDetails | null> {
    try {
      const actResult = await db
        .select({
          activity: activities,
          location: locations,
          category: categories,
          org: organizations,
        })
        .from(activities)
        .leftJoin(locations, eq(activities.locationId, locations.id))
        .leftJoin(categories, eq(activities.categoryId, categories.id))
        .leftJoin(organizations, eq(activities.organizationId, organizations.id))
        .where(and(eq(activities.id, id), isNull(activities.deletedAt)))
        .limit(1);

      if (actResult.length === 0) {
        // Fallback to active mock store
        const act = activeActivities.find((a) => a.id === id && !a.deletedAt);
        if (!act) return null;

        const location = activeLocations.find((l) => l.id === act.locationId) || activeLocations[0];
        const category = activeCategories.find((c) => c.id === act.categoryId) || activeCategories[0];
        const org = activeOrganizations.find((o) => o.id === act.organizationId) || activeOrganizations[0];

        return {
          ...act,
          location,
          category,
          organization: org,
          images: activeActivityImages.filter((img) => img.activityId === id) as any[],
          tags: activeActivityTags.filter((t) => t.activityId === id).map((t) => activeTags.find((tag) => tag.id === t.tagId)).filter(Boolean) as any[],
          accessibility: activeActivityAccessibility.filter((a) => a.activityId === id).map((a) => activeAccessibility.find((f) => f.id === a.featureId)).filter(Boolean) as any[],
          confirmedRegistrations: activeInscriptions.filter((ins) => ins.activityId === id && ins.status === "registered").length,
        };
      }

      const { activity, location, category, org } = actResult[0];

      let imagesList: any[] = [];
      try {
        imagesList = await db
          .select()
          .from(activityImages)
          .where(eq(activityImages.activityId, id))
          .orderBy(asc(activityImages.order));
      } catch (e) {}

      let tagsList: any[] = [];
      try {
        const rawTags = await db
          .select({ tag: tags })
          .from(activityTags)
          .innerJoin(tags, eq(activityTags.tagId, tags.id))
          .where(eq(activityTags.activityId, id));
        tagsList = rawTags.map((t) => t.tag);
      } catch (e) {}

      let a11yList: any[] = [];
      try {
        const rawA11y = await db
          .select({ feat: accessibilityFeatures })
          .from(activityAccessibility)
          .innerJoin(accessibilityFeatures, eq(activityAccessibility.featureId, accessibilityFeatures.id))
          .where(eq(activityAccessibility.activityId, id));
        a11yList = rawA11y.map((a) => a.feat);
      } catch (e) {}

      let confirmedCount = 0;
      try {
        const insResults = await db
          .select({ count: sql<number>`count(${inscriptions.id})::int` })
          .from(inscriptions)
          .where(
            and(
              eq(inscriptions.activityId, id),
              eq(inscriptions.status, "registered")
            )
          );
        confirmedCount = insResults[0]?.count || 0;
      } catch (e) {}

      return {
        ...activity,
        location: location || { id: "loc-default", address: "A confirmar", city: "Ciudad", province: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816 },
        category: category || { id: "cat-default", name: "General", slug: "general", description: "", icon: "Heart" },
        organization: org || { id: "org-default", name: "Organización", slug: "organizacion", description: "", email: "contacto@kindora.com.ar", phone: "", logo: "", isVerified: false, verificationLevel: "none" },
        images: imagesList,
        tags: tagsList,
        accessibility: a11yList,
        confirmedRegistrations: confirmedCount,
      };
    } catch (error) {
      console.warn("DB Error in findById, attempting mock fallback:", error);
      const act = activeActivities.find((a) => a.id === id && !a.deletedAt);
      if (!act) return null;
      const location = activeLocations.find((l) => l.id === act.locationId) || activeLocations[0];
      const category = activeCategories.find((c) => c.id === act.categoryId) || activeCategories[0];

      return {
        ...act,
        location,
        category,
        organization,
        images,
        tags: linkedTags,
        accessibility: linkedA11y,
        confirmedRegistrations: confirmed,
      } as any;
    }
  },

  async findBySlug(slug: string): Promise<ActivityWithDetails | null> {
    try {
      const actResult = await db
        .select({ id: activities.id })
        .from(activities)
        .where(and(eq(activities.slug, slug), isNull(activities.deletedAt)))
        .limit(1);

      if (actResult.length === 0) return null;
      return this.findById(actResult[0].id);
    } catch (error) {
      console.warn("DB Connection failed, searching slug in mocks.");
      const act = activeActivities.find((a) => a.slug === slug && !a.deletedAt);
      if (!act) return null;
      return this.findById(act.id);
    }
  },

  async create(
    activityData: Omit<ActivityInsert, "id" | "locationId" | "createdAt">,
    locationData: Omit<LocationInsert, "id">,
    tagsArray: string[],
    accessibilityArray: string[],
    imagesArray: { url: string; order: number; isCover: boolean }[]
  ): Promise<ActivitySelect> {
    try {
      return await db.transaction(async (tx) => {
        const locResults = await tx.insert(locations).values(locationData).returning();
        const locationId = locResults[0].id;

        const actResults = await tx
          .insert(activities)
          .values({
            ...activityData,
            locationId,
          })
          .returning();
        const activity = actResults[0];

        if (tagsArray.length > 0) {
          await tx.insert(activityTags).values(
            tagsArray.map((tagId) => ({
              activityId: activity.id,
              tagId,
            }))
          );
        }

        if (accessibilityArray.length > 0) {
          await tx.insert(activityAccessibility).values(
            accessibilityArray.map((featureId) => ({
              activityId: activity.id,
              featureId,
            }))
          );
        }

        if (imagesArray.length > 0) {
          await tx.insert(activityImages).values(
            imagesArray.map((img) => ({
              activityId: activity.id,
              url: img.url,
              order: img.order,
              isCover: img.isCover,
            }))
          );
        }

        await tx.insert(activitySlugHistory).values({
          activityId: activity.id,
          slug: activity.slug,
        });

        return activity;
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating activity creation.");
      const actId = `act-${Math.random().toString(36).substr(2, 9)}`;
      const locId = `loc-${Math.random().toString(36).substr(2, 9)}`;

      const newLoc: LocationSelect = {
        id: locId,
        address: locationData.address,
        city: locationData.city,
        province: locationData.province,
        country: locationData.country || "Argentina",
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        googlePlaceId: locationData.googlePlaceId || null,
      };

      const newAct: ActivitySelect = {
        id: actId,
        organizationId: activityData.organizationId,
        categoryId: activityData.categoryId,
        title: activityData.title,
        slug: activityData.slug,
        description: activityData.description,
        locationId: locId,
        startsAt: new Date(activityData.startsAt),
        endsAt: new Date(activityData.endsAt),
        timezone: activityData.timezone || "America/Argentina/Buenos_Aires",
        capacity: activityData.capacity,
        price: activityData.price || "0.00",
        registrationType: activityData.registrationType || "open",
        externalUrl: activityData.externalUrl || null,
        visibility: activityData.visibility || "public",
        contactName: activityData.contactName || null,
        contactEmail: activityData.contactEmail || null,
        contactPhone: activityData.contactPhone || null,
        status: activityData.status || "draft",
        createdAt: new Date(),
        deletedAt: null,
      };

      activeLocations.push(newLoc);
      activeActivities.push(newAct as any);

      tagsArray.forEach((tId) => activeActivityTags.push({ activityId: actId, tagId: tId }));
      accessibilityArray.forEach((aId) => activeActivityAccessibility.push({ activityId: actId, featureId: aId }));
      
      if (imagesArray.length > 0) {
        imagesArray.forEach((img, i) =>
          activeActivityImages.push({
            id: `img-new-${i}-${Math.random().toString(36).substr(2, 5)}`,
            activityId: actId,
            url: img.url,
            order: img.order,
            isCover: img.isCover,
          })
        );
      } else {
        // Fallback default cover
        activeActivityImages.push({
          id: `img-def-${Math.random().toString(36).substr(2, 5)}`,
          activityId: actId,
          url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800",
          order: 1,
          isCover: true,
        });
      }

      activeSlugHistory.push({
        id: `sh-${Math.random().toString(36).substr(2, 5)}`,
        activityId: actId,
        slug: newAct.slug,
        createdAt: new Date(),
      });

      return newAct;
    }
  },

  async update(
    id: string,
    activityData: Partial<ActivityInsert>,
    locationData?: Partial<LocationInsert>,
    tagsArray?: string[],
    accessibilityArray?: string[],
    imagesArray?: { url: string; order: number; isCover: boolean }[]
  ): Promise<ActivitySelect> {
    try {
      return await db.transaction(async (tx) => {
        const current = await tx
          .select()
          .from(activities)
          .where(eq(activities.id, id))
          .limit(1);
        if (current.length === 0) throw new Error("Activity not found");
        const currentAct = current[0];

        if (locationData && currentAct.locationId) {
          await tx
            .update(locations)
            .set(locationData)
            .where(eq(locations.id, currentAct.locationId));
        }

        const actResults = await tx
          .update(activities)
          .set(activityData)
          .where(eq(activities.id, id))
          .returning();
        const activity = actResults[0];

        if (tagsArray !== undefined) {
          await tx.delete(activityTags).where(eq(activityTags.activityId, id));
          if (tagsArray.length > 0) {
            await tx.insert(activityTags).values(
              tagsArray.map((tagId) => ({
                activityId: id,
                tagId,
              }))
            );
          }
        }

        if (accessibilityArray !== undefined) {
          await tx.delete(activityAccessibility).where(eq(activityAccessibility.activityId, id));
          if (accessibilityArray.length > 0) {
            await tx.insert(activityAccessibility).values(
              accessibilityArray.map((featureId) => ({
                activityId: id,
                featureId,
              }))
            );
          }
        }

        if (imagesArray !== undefined) {
          await tx.delete(activityImages).where(eq(activityImages.activityId, id));
          if (imagesArray.length > 0) {
            await tx.insert(activityImages).values(
              imagesArray.map((img) => ({
                activityId: id,
                url: img.url,
                order: img.order,
                isCover: img.isCover,
              }))
            );
          }
        }

        if (activityData.slug && activityData.slug !== currentAct.slug) {
          const alreadyExists = await tx
            .select()
            .from(activitySlugHistory)
            .where(and(eq(activitySlugHistory.activityId, id), eq(activitySlugHistory.slug, activityData.slug)))
            .limit(1);

          if (alreadyExists.length === 0) {
            await tx.insert(activitySlugHistory).values({
              activityId: id,
              slug: activityData.slug,
            });
          }
        }

        return activity;
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating activity update.");
      const actIdx = activeActivities.findIndex((a) => a.id === id);
      if (actIdx === -1) throw new Error("Activity not found in mock store");
      const currentAct = activeActivities[actIdx];

      if (locationData && currentAct.locationId) {
        const locIdx = activeLocations.findIndex((l) => l.id === currentAct.locationId);
        if (locIdx !== -1) {
          activeLocations[locIdx] = { ...activeLocations[locIdx], ...locationData } as LocationSelect;
        }
      }

      activeActivities[actIdx] = {
        ...currentAct,
        ...activityData,
        startsAt: activityData.startsAt ? new Date(activityData.startsAt) : currentAct.startsAt,
        endsAt: activityData.endsAt ? new Date(activityData.endsAt) : currentAct.endsAt,
      } as any;

      if (tagsArray !== undefined) {
        const filterTags = activeActivityTags.filter((t) => t.activityId !== id);
        tagsArray.forEach((tId) => filterTags.push({ activityId: id, tagId: tId }));
        // Replace
        activeActivityTags.length = 0;
        activeActivityTags.push(...filterTags);
      }

      if (accessibilityArray !== undefined) {
        const filterA11y = activeActivityAccessibility.filter((a) => a.activityId !== id);
        accessibilityArray.forEach((aId) => filterA11y.push({ activityId: id, featureId: aId }));
        // Replace
        activeActivityAccessibility.length = 0;
        activeActivityAccessibility.push(...filterA11y);
      }

      if (imagesArray !== undefined) {
        const filterImages = activeActivityImages.filter((img) => img.activityId !== id);
        imagesArray.forEach((img, i) =>
          filterImages.push({
            id: `img-upd-${i}-${Math.random().toString(36).substr(2, 5)}`,
            activityId: id,
            url: img.url,
            order: img.order,
            isCover: img.isCover,
          })
        );
        activeActivityImages.length = 0;
        activeActivityImages.push(...filterImages);
      }

      return activeActivities[actIdx] as any;
    }
  },

  async softDelete(id: string): Promise<ActivitySelect> {
    try {
      const results = await db
        .update(activities)
        .set({ deletedAt: new Date() })
        .where(eq(activities.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulating activity soft delete.");
      const act = activeActivities.find((a) => a.id === id);
      if (act) {
        act.deletedAt = new Date();
        return act as any;
      }
      throw error;
    }
  },

  async list(filters: {
    categoryId?: string;
    city?: string;
    status?: string;
    visibility?: string;
    isFree?: boolean;
    tagSlug?: string;
    a11yIds?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    organizationId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ActivityWithDetails[]> {
    try {
      const conditions = [isNull(activities.deletedAt), isNull(organizations.deletedAt)];
      if (filters.status) conditions.push(eq(activities.status, filters.status));
      else conditions.push(eq(activities.status, "published"));
      if (filters.visibility) conditions.push(eq(activities.visibility, filters.visibility));
      else conditions.push(eq(activities.visibility, "public"));
      if (filters.categoryId) conditions.push(eq(activities.categoryId, filters.categoryId));
      if (filters.organizationId) conditions.push(eq(activities.organizationId, filters.organizationId));
      if (filters.isFree !== undefined) {
        if (filters.isFree) conditions.push(eq(activities.price, "0.00"));
        else conditions.push(sql`${activities.price} > 0`);
      }
      if (filters.dateFrom) conditions.push(gte(activities.startsAt, filters.dateFrom));
      if (filters.dateTo) conditions.push(lte(activities.endsAt, filters.dateTo));

      let baseQuery = db
        .select({ id: activities.id })
        .from(activities)
        .innerJoin(locations, eq(activities.locationId, locations.id))
        .innerJoin(categories, eq(activities.categoryId, categories.id))
        .innerJoin(organizations, eq(activities.organizationId, organizations.id));

      if (filters.city) conditions.push(eq(locations.city, filters.city));
      if (filters.tagSlug) {
        baseQuery = baseQuery
          .innerJoin(activityTags, eq(activities.id, activityTags.activityId))
          .innerJoin(tags, eq(activityTags.tagId, tags.id)) as any;
        conditions.push(eq(tags.slug, filters.tagSlug));
      }

      const matchIds = await baseQuery
        .where(and(...conditions))
        .orderBy(desc(activities.startsAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      if (matchIds.length === 0) return [];
      const listDetails = await Promise.all(matchIds.map((m) => this.findById(m.id)));
      let results = listDetails.filter((r) => r !== null) as ActivityWithDetails[];

      if (filters.a11yIds && filters.a11yIds.length > 0) {
        results = results.filter((act) =>
          filters.a11yIds!.every((id) => act.accessibility.some((a) => a.id === id))
        );
      }
      return results;
    } catch (error) {
      console.warn("DB Connection failed, filtering in mocks.");
      let acts = activeActivities.filter((a) => !a.deletedAt);
      
      const filterStatus = filters.status || "published";
      acts = acts.filter((a) => a.status === filterStatus);

      const filterVis = filters.visibility || "public";
      acts = acts.filter((a) => a.visibility === filterVis);

      if (filters.categoryId) {
        acts = acts.filter((a) => a.categoryId === filters.categoryId);
      }
      if (filters.organizationId) {
        acts = acts.filter((a) => a.organizationId === filters.organizationId);
      }
      if (filters.isFree !== undefined) {
        acts = acts.filter((a) => (filters.isFree ? a.price === "0.00" : parseFloat(a.price) > 0));
      }
      if (filters.dateFrom) {
        acts = acts.filter((a) => a.startsAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        acts = acts.filter((a) => a.endsAt <= filters.dateTo!);
      }
      if (filters.city) {
        acts = acts.filter((a) => {
          const loc = activeLocations.find((l) => l.id === a.locationId);
          return loc ? loc.city.toLowerCase() === filters.city!.toLowerCase() : false;
        });
      }
      if (filters.tagSlug) {
        const tag = activeTags.find((t) => t.slug === filters.tagSlug);
        if (tag) {
          acts = acts.filter((a) => activeActivityTags.some((at) => at.activityId === a.id && at.tagId === tag.id));
        } else {
          return [];
        }
      }

      // Enriched
      let enriched = await Promise.all(acts.map((a) => this.findById(a.id)));
      let results = enriched.filter(Boolean) as ActivityWithDetails[];

      if (filters.a11yIds && filters.a11yIds.length > 0) {
        results = results.filter((act) =>
          filters.a11yIds!.every((id) => act.accessibility.some((a) => a.id === id))
        );
      }

      // Sort
      results.sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

      // Limit/Offset
      const startIdx = filters.offset || 0;
      const endIdx = startIdx + (filters.limit || 50);
      return results.slice(startIdx, endIdx);
    }
  },

  async bookmark(userId: string, activityId: string): Promise<void> {
    try {
      await db.insert(bookmarks).values({ userId, activityId }).onConflictDoNothing();
    } catch (error) {
      console.warn("DB Connection failed, simulating bookmark add.");
      const exists = activeBookmarks.some((b) => b.userId === userId && b.activityId === activityId);
      if (!exists) {
        activeBookmarks.push({ userId, activityId, createdAt: new Date() });
      }
    }
  },

  async unbookmark(userId: string, activityId: string): Promise<void> {
    try {
      await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.activityId, activityId)));
    } catch (error) {
      console.warn("DB Connection failed, simulating bookmark removal.");
      const idx = activeBookmarks.findIndex((b) => b.userId === userId && b.activityId === activityId);
      if (idx !== -1) activeBookmarks.splice(idx, 1);
    }
  },

  async isBookmarked(userId: string, activityId: string): Promise<boolean> {
    try {
      const results = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.activityId, activityId)))
        .limit(1);
      return results.length > 0;
    } catch (error) {
      console.warn("DB Connection failed, using simulated bookmarks.");
      return activeBookmarks.some((b) => b.userId === userId && b.activityId === activityId);
    }
  },

  async getBookmarkedActivities(userId: string): Promise<ActivityWithDetails[]> {
    try {
      const marks = await db
        .select({ activityId: bookmarks.activityId })
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId));

      if (marks.length === 0) return [];
      const acts = await Promise.all(marks.map((m) => this.findById(m.activityId)));
      return acts.filter((a) => a !== null) as ActivityWithDetails[];
    } catch (error) {
      console.warn("DB Connection failed, using mock bookmarked activities.");
      const list = activeBookmarks.filter((b) => b.userId === userId);
      const acts = await Promise.all(list.map((m) => this.findById(m.activityId)));
      return acts.filter(Boolean) as ActivityWithDetails[];
    }
  },

  async registerParticipant(activityId: string, userId: string, status = "registered", volunteerAnswers?: string): Promise<any> {
    try {
      const results = await db
        .insert(inscriptions)
        .values({ activityId, userId, status, volunteerAnswers: volunteerAnswers || null })
        .returning();

      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulating participant registration.");
      const newIns = {
        id: `ins-${Math.random().toString(36).substr(2, 9)}`,
        activityId,
        userId,
        status,
        volunteerAnswers: volunteerAnswers || null,
        createdAt: new Date(),
      };
      activeInscriptions.push(newIns);
      return newIns;
    }
  },

  async unregisterParticipant(activityId: string, userId: string): Promise<void> {
    try {
      await db.delete(inscriptions).where(and(eq(inscriptions.activityId, activityId), eq(inscriptions.userId, userId)));
    } catch (error) {
      console.warn("DB Connection failed, simulating participant unregistration.");
      const idx = activeInscriptions.findIndex((ins) => ins.activityId === activityId && ins.userId === userId);
      if (idx !== -1) activeInscriptions.splice(idx, 1);
    }
  },

  async getInscriptions(activityId: string): Promise<(any & { user: any })[]> {
    try {
      const results = await db
        .select({
          ins: inscriptions,
          u: user,
        })
        .from(inscriptions)
        .innerJoin(user, eq(inscriptions.userId, user.id))
        .where(eq(inscriptions.activityId, activityId));

      return results.map((r) => ({
        ...r.ins,
        user: r.u,
      }));
    } catch (error) {
      console.warn("DB Connection failed, simulating inscriptions fetch.");
      const { mockUsers } = await import("./userRepository");
      return activeInscriptions
        .filter((ins) => ins.activityId === activityId)
        .map((ins) => ({
          ...ins,
          user: mockUsers.find((u) => u.id === ins.userId) || { id: ins.userId, name: "Participante Mock", email: "part@mock.com", role: "participant" },
        }));
    }
  },

  async getUserInscriptions(userId: string): Promise<(any & { activity: ActivityWithDetails })[]> {
    try {
      const results = await db
        .select({
          ins: inscriptions,
        })
        .from(inscriptions)
        .where(eq(inscriptions.userId, userId));

      const enriched = await Promise.all(
        results.map(async (r) => {
          const act = await this.findById(r.ins.activityId);
          return act ? { ...r.ins, activity: act } : null;
        })
      );

      return enriched.filter((e) => e !== null) as any[];
    } catch (error) {
      console.warn("DB Connection failed, using mock inscriptions.");
      const list = activeInscriptions.filter((ins) => ins.userId === userId);
      const enriched = await Promise.all(
        list.map(async (ins) => {
          const act = await this.findById(ins.activityId);
          return act ? { ...ins, activity: act } : null;
        })
      );
      return enriched.filter(Boolean) as any[];
    }
  },

  async incrementViews(activityId: string, userId?: string): Promise<void> {
    try {
      await db.insert(activityViews).values({
        activityId,
        userId: userId || null,
      });
    } catch (error) {
      console.warn("DB Connection failed, simulating views increment.");
    }
  },

  async resolveSlugRedirect(slug: string): Promise<string | null> {
    try {
      const current = await db
        .select({ slug: activities.slug })
        .from(activities)
        .where(and(eq(activities.slug, slug), isNull(activities.deletedAt)))
        .limit(1);

      if (current.length > 0) return current[0].slug;

      const history = await db
        .select({ activityId: activitySlugHistory.activityId })
        .from(activitySlugHistory)
        .where(eq(activitySlugHistory.slug, slug))
        .orderBy(desc(activitySlugHistory.createdAt))
        .limit(1);

      if (history.length > 0) {
        const activeAct = await db
          .select({ slug: activities.slug })
          .from(activities)
          .where(eq(activities.id, history[0].activityId))
          .limit(1);

        return activeAct[0]?.slug || null;
      }
      return null;
    } catch (error) {
      console.warn("DB Connection failed, checking slug redirect in mocks.");
      const current = activeActivities.find((a) => a.slug === slug && !a.deletedAt);
      if (current) return current.slug;

      const hist = activeSlugHistory.find((sh) => sh.slug === slug);
      if (hist) {
        const activeAct = activeActivities.find((a) => a.id === hist.activityId);
        return activeAct?.slug || null;
      }
      return null;
    }
  },

  // Helper inside Astro to load all categories
  async getCategories(): Promise<any[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      return activeCategories;
    }
  },

  // Helper inside Astro to load all accessibility features
  async getAccessibilityFeatures(): Promise<any[]> {
    try {
      return await db.select().from(accessibilityFeatures);
    } catch (error) {
      return activeAccessibility;
    }
  },

  // Helper inside Astro to load all tags
  async getTags(): Promise<any[]> {
    try {
      return await db.select().from(tags);
    } catch (error) {
      return activeTags;
    }
  }
};
export { activeActivities };
