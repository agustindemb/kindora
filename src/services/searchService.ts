import { and, eq, isNull, sql, ilike, or, inArray } from "drizzle-orm";
import { db } from "../lib/db/client";
import { activities, locations, categories, tags, activityTags, organizations } from "../lib/db/schema";
import { activityRepository, type ActivityWithDetails } from "../lib/repositories/activityRepository";

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  city?: string;
  when?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isFree?: boolean;
  a11yIds?: string[];
  status?: string;
}

const normalizeText = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const searchService = {
  async search(filters: SearchFilters = {}): Promise<ActivityWithDetails[]> {
    let rawQuery = [filters.query || "", filters.when || ""].join(" ").trim();
    let queryText = normalizeText(rawQuery);
    
    const conditions = [isNull(activities.deletedAt)];

    // Standard status filter
    if (filters.status) {
      conditions.push(eq(activities.status, filters.status));
    } else {
      conditions.push(eq(activities.status, "published"));
    }

    // Default to public visibility
    conditions.push(eq(activities.visibility, "public"));

    if (filters.categoryId) {
      conditions.push(eq(activities.categoryId, filters.categoryId));
    }

    if (filters.city) {
      conditions.push(eq(locations.city, filters.city));
    }

    let searchIsFree = filters.isFree;
    let dayOfWeekFilter: number[] | null = null; // 0=Sunday, 6=Saturday

    // Intelligent query parser
    if (queryText) {
      // 1. Detect "gratis" or "free"
      if (queryText.includes("gratis") || queryText.includes("free")) {
        searchIsFree = true;
        queryText = queryText.replace(/\bgratis\b/g, "").replace(/\bfree\b/g, "").trim();
      }

      // 2. Detect days of the week
      if (queryText.includes("sabado") || queryText.includes("sabados")) {
        dayOfWeekFilter = [6];
        queryText = queryText.replace(/\bsabados?\b/g, "").trim();
      } else if (queryText.includes("domingo") || queryText.includes("domingos")) {
        dayOfWeekFilter = [0];
        queryText = queryText.replace(/\bdomingos?\b/g, "").trim();
      } else if (queryText.includes("fin de semana") || queryText.includes("finde")) {
        dayOfWeekFilter = [0, 6];
        queryText = queryText.replace(/\bfin de semana\b/g, "").replace(/\bfinde\b/g, "").trim();
      }
    }

    // Apply resolved isFree filter
    if (searchIsFree !== undefined) {
      if (searchIsFree) {
        conditions.push(sql`${activities.price}::numeric = 0`);
      } else {
        conditions.push(sql`${activities.price}::numeric > 0`);
      }
    }

    // Apply day of week filter (Postgres DOW: 0=Sunday, 6=Saturday)
    if (dayOfWeekFilter !== null) {
      const dowCondition = or(
        ...dayOfWeekFilter.map(
          (dow) => sql`extract(dow from ${activities.startsAt}) = ${dow}`
        )
      );
      if (dowCondition) {
        conditions.push(dowCondition);
      }
    }

    // Apply explicit dates if provided
    if (filters.dateFrom) {
      conditions.push(sql`${activities.startsAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${activities.endsAt} <= ${filters.dateTo}`);
    }

    try {
      let baseQuery = db
        .select({ id: activities.id })
        .from(activities)
        .innerJoin(locations, eq(activities.locationId, locations.id))
        .innerJoin(categories, eq(activities.categoryId, categories.id))
        .innerJoin(organizations, eq(activities.organizationId, organizations.id));

      if (queryText) {
        const words = queryText.split(/\s+/).filter(Boolean);
        
        for (const word of words) {
          const normWord = normalizeText(word);
          const pattern = `%${normWord}%`;
          
          // Accent-insensitive SQL translation
          const textConditions = [
            sql`translate(lower(${activities.title}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`,
            sql`translate(lower(${activities.description}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`,
            sql`translate(lower(${locations.city}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`,
            sql`translate(lower(${locations.address}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`,
            sql`translate(lower(${categories.name}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`,
            sql`translate(lower(${organizations.name}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`,
          ];

          // Check tags
          const matchingTags = await db
            .select({ id: tags.id })
            .from(tags)
            .where(sql`translate(lower(${tags.name}), 'áéíóúüñ', 'aeiouun') LIKE ${pattern}`);
            
          const tagIds = matchingTags.map(t => t.id);
          if (tagIds.length > 0) {
            const actWithTags = await db
              .select({ activityId: activityTags.activityId })
              .from(activityTags)
              .where(inArray(activityTags.tagId, tagIds));
              
            const matchedActIds = actWithTags.map(at => at.activityId);
            if (matchedActIds.length > 0) {
              textConditions.push(inArray(activities.id, matchedActIds));
            }
          }

          conditions.push(or(...textConditions)!);
        }
      }

      // Run query to get matching IDs
      const rawMatchedIds = await baseQuery
        .where(and(...conditions))
        .orderBy(sql`${activities.startsAt} asc`)
        .limit(50);

      const uniqueIds = Array.from(new Set(rawMatchedIds.map((m) => m.id)));

      if (uniqueIds.length === 0) return [];

      // Fetch full details
      const enrichedResults = await Promise.all(
        uniqueIds.map((id) => activityRepository.findById(id))
      );

      let results = enrichedResults.filter(Boolean) as ActivityWithDetails[];

      // Apply accessibility filters
      if (filters.a11yIds && filters.a11yIds.length > 0) {
        results = results.filter((act) =>
          filters.a11yIds!.every((id) => act.accessibility.some((a) => a.id === id))
        );
      }

      return results;
    } catch (error) {
      console.warn("DB Connection failed in searchService, using in-memory mock search fallback:", error);
      let results = await activityRepository.list({
        categoryId: filters.categoryId,
        city: filters.city,
        status: filters.status,
        isFree: searchIsFree,
        a11yIds: filters.a11yIds,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      if (queryText) {
        const words = queryText.split(/\s+/).filter(Boolean);
        results = results.filter((act) => {
          return words.every((word) => {
            const normWord = normalizeText(word);
            return (
              normalizeText(act.title).includes(normWord) ||
              normalizeText(act.description).includes(normWord) ||
              normalizeText(act.location.city).includes(normWord) ||
              normalizeText(act.location.address).includes(normWord) ||
              normalizeText(act.category.name).includes(normWord) ||
              normalizeText(act.organization.name).includes(normWord) ||
              act.tags.some((t) => normalizeText(t.name).includes(normWord))
            );
          });
        });
      }

      if (dayOfWeekFilter !== null) {
        results = results.filter((act) => {
          const day = new Date(act.startsAt).getDay();
          return dayOfWeekFilter!.includes(day);
        });
      }

      return results;
    }
  },
};
