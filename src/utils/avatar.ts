export function getUserAvatar(user?: { image?: string | null; name?: string | null; email?: string | null } | null): string {
  if (user?.image && typeof user.image === "string" && user.image.trim().length > 0) {
    return user.image;
  }
  const name = user?.name || user?.email || "Usuario";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=ffffff&bold=true&size=128`;
}
