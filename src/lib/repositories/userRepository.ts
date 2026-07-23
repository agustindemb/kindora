import { eq, and, isNull } from "drizzle-orm";
import { db } from "../db/client";
import { user } from "../db/schema";

export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

const mockUsers: UserSelect[] = [
  {
    id: "usr_admin",
    name: "Admin Kindora",
    email: "admin@kindora.com",
    emailVerified: true,
    role: "admin",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100",
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: "usr_org",
    name: "María Gómez",
    email: "organizador@kindora.com",
    emailVerified: true,
    role: "organizer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100",
    phone: "+5491155555555",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: "usr_part",
    name: "Juan Pérez",
    email: "participante@kindora.com",
    emailVerified: true,
    role: "participant",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100",
    phone: "+5491144444444",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }
];

export const userRepository = {
  async findById(id: string): Promise<UserSelect | null> {
    try {
      const results = await db
        .select()
        .from(user)
        .where(and(eq(user.id, id), isNull(user.deletedAt)))
        .limit(1);
      return results[0] || null;
    } catch (error) {
      console.warn("DB Connection failed, using mock users fallback.");
      return mockUsers.find(u => u.id === id) || null;
    }
  },

  async findByEmail(email: string): Promise<UserSelect | null> {
    try {
      const results = await db
        .select()
        .from(user)
        .where(and(eq(user.email, email.toLowerCase()), isNull(user.deletedAt)))
        .limit(1);
      return results[0] || null;
    } catch (error) {
      console.warn("DB Connection failed, using mock users fallback.");
      return mockUsers.find(u => u.email === email.toLowerCase()) || null;
    }
  },

  async create(data: UserInsert): Promise<UserSelect> {
    try {
      const results = await db.insert(user).values({
        ...data,
        email: data.email.toLowerCase(),
      }).returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulated user creation.");
      const newUser: UserSelect = {
        id: data.id || `usr_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        email: data.email.toLowerCase(),
        emailVerified: data.emailVerified,
        image: data.image || null,
        phone: data.phone || null,
        role: data.role || "participant",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockUsers.push(newUser);
      return newUser;
    }
  },

  async update(id: string, data: Partial<UserInsert>): Promise<UserSelect> {
    try {
      const results = await db
        .update(user)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulated user update.");
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...data, updatedAt: new Date() } as UserSelect;
        return mockUsers[index];
      }
      throw error;
    }
  },

  async softDelete(id: string): Promise<UserSelect> {
    try {
      const results = await db
        .update(user)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.warn("DB Connection failed, simulated user soft delete.");
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers[index].deletedAt = new Date();
        return mockUsers[index];
      }
      throw error;
    }
  },
};
export { mockUsers };
