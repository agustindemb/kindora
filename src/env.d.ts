/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image?: string | null;
      phone?: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    session: {
      id: string;
      userId: string;
      token: string;
      expiresAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }
}
