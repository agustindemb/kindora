import { and, eq, isNull, sql, ilike, or, inArray } from "drizzle-orm";
import { db } from "../lib/db/client";
import { activities, locations, categories, tags, activityTags, organizations } from "../lib/db/schema";
import { activityRepository, type ActivityWithDetails } from "../lib/repositories/activityRepository";

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  city?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isFree?: boolean;
  a11yIds?: string[];
  status?: string;
}

export const searchService = {
  async search(filters: SearchFilters = {}): Promise<ActivityWithDetails[]> {
    let queryText = filters.query?.trim().toLowerCase() || "";
    const conditions = [isNull(activities.deletedAt)];

    // Standard filters
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
    let dayOfWeekFilter: number[] | null = null; // 0=Sunday, 6=Saturday etc

    // Intelligent query parser
    if (queryText) {
      // 1. Detect "gratis" or "free"
      if (queryText.includes("gratis") || queryText.includes("free")) {
        searchIsFree = true;
        // remove term to not clutter text search
        queryText = queryText.replace(/\bgratis\b/g, "").replace(/\bfree\b/g, "").trim();
      }

      // 2. Detect days of the week
      if (queryText.includes("sabado") || queryText.includes("sábado")) {
        dayOfWeekFilter = [6];
        queryText = queryText.replace(/\bs[aá]bado\b/g, "").trim();
      } else if (queryText.includes("domingo")) {
        dayOfWeekFilter = [0];
        queryText = queryText.replace(/\bdomingo\b/g, "").trim();
      } else if (queryText.includes("fin de semana") || queryText.includes("finde")) {
        dayOfWeekFilter = [0, 6];
        queryText = queryText.replace(/\bfin de semana\b/g, "").replace(/\bfinde\b/g, "").trim();
      }
    }

    // Apply resolved isFree filter
    if (searchIsFree !== undefined) {
      if (searchIsFree) {
        conditions.push(eq(activities.price, "0.00"));
      } else {
        conditions.push(sql`${activities.price} > 0`);
      }
    }

    // Apply day of week filter
    if (dayOfWeekFilter !== null) {
      // In Postgres, extract(dow from startsAt) returns 0 (Sunday) to 6 (Saturday)
      // Drizzle sql helper
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
      // Get matching activity IDs
      // If we have text query left, search in title, description, city, category, organization name, and tags.
      let baseQuery = db
        .select({ id: activities.id })
        .from(activities)
        .innerJoin(locations, eq(activities.locationId, locations.id))
        .innerJoin(categories, eq(activities.categoryId, categories.id))
        .innerJoin(organizations, eq(activities.organizationId, organizations.id));

      if (queryText) {
        const words = queryText.split(/\s+/).filter(Boolean);
        
        for (const word of words) {
          const likePattern = `%${word}%`;
          
          // Find tags matching the word
          const matchingTags = await db
            .select({ id: tags.id })
            .from(tags)
            .where(ilike(tags.name, likePattern));
            
          const tagIds = matchingTags.map(t => t.id);

          const textConditions = [
            ilike(activities.title, likePattern),
            ilike(activities.description, likePattern),
            ilike(locations.city, likePattern),
            ilike(locations.address, likePattern),
            ilike(categories.name, likePattern),
            ilike(organizations.name, likePattern),
          ];

          // If matching tags were found, allow match on activity tags
          if (tagIds.length > 0) {
            // We can query activity tags
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
      const matchedIds = await baseQuery
        .where(and(...conditions))
        .orderBy(sql`${activities.startsAt} asc`)
        .limit(50);

      if (matchedIds.length === 0) return [];

      // Fetch full details and accessibility
      const enrichedResults = await Promise.all(
        matchedIds.map((m) => activityRepository.findById(m.id))
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
      console.warn("DB Connection failed in searchService, using in-memory mock search fallback.");
      // Fallback search logic in mock repository
      let results = await activityRepository.list({
        categoryId: filters.categoryId,
        city: filters.city,
        status: filters.status,
        isFree: searchIsFree,
        a11yIds: filters.a11yIds,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });

      // Filter queryText in mocks if query is present
      if (queryText) {
        const words = queryText.split(/\s+/).filter(Boolean);
        results = results.filter((act) => {
          return words.every((word) => {
            const pattern = word.toLowerCase();
            return (
              act.title.toLowerCase().includes(pattern) ||
              act.description.toLowerCase().includes(pattern) ||
              act.location.city.toLowerCase().includes(pattern) ||
              act.location.address.toLowerCase().includes(pattern) ||
              act.category.name.toLowerCase().includes(pattern) ||
              act.organization.name.toLowerCase().includes(pattern) ||
              act.tags.some((t) => t.name.toLowerCase().includes(pattern))
            );
          });
        });
      }

      // Filter days of the week in mocks
      if (dayOfWeekFilter !== null) {
        results = results.filter((act) => {
          const day = new Date(act.startsAt).getDay(); // 0=Sunday, 6=Saturday
          return dayOfWeekFilter!.includes(day);
        });
      }

      return results;
    }
  },
};
