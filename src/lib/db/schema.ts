import { pgTable, text, timestamp, boolean, uuid, integer, numeric, doublePrecision, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. Better Auth Tables (camelCase columns)
// ==========================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  phone: text("phone"),
  role: text("role").default("participant").notNull(), // visitor, participant, organizer, admin
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  expiresAt: timestamp("expiresAt"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// ==========================================
// 2. Organizations
// ==========================================

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  mission: text("mission"),
  type: text("type").notNull(), // NGO, Municipality, Foundation, School, University, Community Group, Company, Government
  logo: text("logo"),
  banner: text("banner"),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  contactPerson: text("contactPerson"),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  foundedAt: timestamp("foundedAt"),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: text("verifiedBy").references(() => user.id),
  verificationLevel: text("verificationLevel").default("none").notNull(), // none, verified, official, municipality, government, school, foundation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const organizationImages = pgTable("organization_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  order: integer("order").default(0).notNull(),
  isCover: boolean("isCover").default(false).notNull(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // owner, admin, editor
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const organizationStats = pgTable("organization_stats", {
  organizationId: uuid("organizationId").primaryKey().references(() => organizations.id, { onDelete: "cascade" }),
  followers: integer("followers").default(0).notNull(),
  activitiesCount: integer("activitiesCount").default(0).notNull(),
  participantsCount: integer("participantsCount").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  reviewsCount: integer("reviewsCount").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0.00").notNull(),
});

// ==========================================
// 3. Locations
// ==========================================

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  country: text("country").default("Argentina").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  googlePlaceId: text("googlePlaceId"),
});

// ==========================================
// 4. Categories, Tags, Accessibility
// ==========================================

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(), // Lucide icon name
  color: text("color").notNull(), // Tailwind CSS color class
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const accessibilityFeatures = pgTable("accessibility_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
});

// ==========================================
// 5. Activities (Experiences)
// ==========================================

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  categoryId: uuid("categoryId").notNull().references(() => categories.id),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  locationId: uuid("locationId").notNull().references(() => locations.id),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  timezone: text("timezone").default("America/Argentina/Buenos_Aires").notNull(),
  capacity: integer("capacity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).default("0.00").notNull(), // 0.00 = free
  registrationType: text("registrationType").default("open").notNull(), // open, approval_required, external
  externalUrl: text("externalUrl"),
  visibility: text("visibility").default("public").notNull(), // public, unlisted, private
  contactName: text("contactName"),
  contactEmail: text("contactEmail"),
  contactPhone: text("contactPhone"),
  status: text("status").default("draft").notNull(), // draft, pending_review, published, completed, cancelled, archived
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const activityImages = pgTable("activity_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  order: integer("order").default(0).notNull(),
  isCover: boolean("isCover").default(false).notNull(),
});

export const activitySlugHistory = pgTable("activity_slug_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const activityTags = pgTable("activity_tags", {
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  tagId: uuid("tagId").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.activityId, t.tagId] }),
}));

export const activityAccessibility = pgTable("activity_accessibility", {
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  featureId: uuid("featureId").notNull().references(() => accessibilityFeatures.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.activityId, t.featureId] }),
}));

// ==========================================
// 6. User Interactions
// ==========================================

export const inscriptions = pgTable("inscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  status: text("status").default("registered").notNull(), // registered, cancelled, attended
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  images: text("images"), // JSON array of URLs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const bookmarks = pgTable("bookmarks", {
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.activityId] }),
}));

export const follows = pgTable("follows", {
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  organizationId: uuid("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.organizationId] }),
}));

// ==========================================
// 7. System, Logging, Reports
// ==========================================

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterUserId: text("reporterUserId").notNull().references(() => user.id, { onDelete: "cascade" }),
  targetType: text("targetType").notNull(), // activity, organization, review
  targetId: uuid("targetId").notNull(),
  reason: text("reason").notNull(), // spam, fake_org, incorrect_info, unsafe_activity
  comment: text("comment"),
  status: text("status").default("pending").notNull(), // pending, resolved, ignored
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // activity_created, reminder, cancellation, verification
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const activityViews = pgTable("activity_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => user.id, { onDelete: "set null" }),
  date: timestamp("date").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activityId").notNull().references(() => activities.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // created, updated, published, cancelled, status_changed
  details: text("details"), // JSON string details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const organizationLogs = pgTable("organization_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // member_added, verified, role_changed
  details: text("details"), // JSON string details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ==========================================
// Relations
// ==========================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  memberships: many(organizationMembers),
  inscriptions: many(inscriptions),
  reviews: many(reviews),
  bookmarks: many(bookmarks),
  follows: many(follows),
  notifications: many(notifications),
}));

export const organizationRelations = relations(organizations, ({ many, one }) => ({
  members: many(organizationMembers),
  images: many(organizationImages),
  activities: many(activities),
  follows: many(follows),
  stats: one(organizationStats, {
    fields: [organizations.id],
    references: [organizationStats.organizationId],
  }),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(user, {
    fields: [organizationMembers.userId],
    references: [user.id],
  }),
}));

export const activityRelations = relations(activities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activities.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [activities.categoryId],
    references: [categories.id],
  }),
  location: one(locations, {
    fields: [activities.locationId],
    references: [locations.id],
  }),
  images: many(activityImages),
  tags: many(activityTags),
  accessibility: many(activityAccessibility),
  inscriptions: many(inscriptions),
  reviews: many(reviews),
  bookmarks: many(bookmarks),
  views: many(activityViews),
  slugHistory: many(activitySlugHistory),
}));

export const activityTagsRelations = relations(activityTags, ({ one }) => ({
  activity: one(activities, {
    fields: [activityTags.activityId],
    references: [activities.id],
  }),
  tag: one(tags, {
    fields: [activityTags.tagId],
    references: [tags.id],
  }),
}));

export const activityAccessibilityRelations = relations(activityAccessibility, ({ one }) => ({
  activity: one(activities, {
    fields: [activityAccessibility.activityId],
    references: [activities.id],
  }),
  feature: one(accessibilityFeatures, {
    fields: [activityAccessibility.featureId],
    references: [accessibilityFeatures.id],
  }),
}));

export const inscriptionRelations = relations(inscriptions, ({ one }) => ({
  activity: one(activities, {
    fields: [inscriptions.activityId],
    references: [activities.id],
  }),
  user: one(user, {
    fields: [inscriptions.userId],
    references: [user.id],
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  activity: one(activities, {
    fields: [reviews.activityId],
    references: [activities.id],
  }),
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
}));
