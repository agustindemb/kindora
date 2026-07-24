export const AVATAR_PRESETS = [
  { id: 'adventurer-1', name: 'Aventurero 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { id: 'adventurer-2', name: 'Aventurero 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka' },
  { id: 'adventurer-3', name: 'Aventurero 3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zack' },
  { id: 'adventurer-4', name: 'Aventurero 4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia' },
  { id: 'avataaars-1', name: 'Sonriente 1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'avataaars-2', name: 'Sonriente 2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo' },
  { id: 'avataaars-3', name: 'Sonriente 3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna' },
  { id: 'lorelei-1', name: 'Lorelei 1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Leo' },
  { id: 'lorelei-2', name: 'Lorelei 2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia' },
  { id: 'bottts-1', name: 'Robot 1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kindora' },
  { id: 'bottts-2', name: 'Robot 2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Impacto' },
  { id: 'micah-1', name: 'Moderno 1', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Lucas' },
];

export function getUserAvatar(user?: { image?: string | null; name?: string | null; email?: string | null; id?: string | null } | null): string {
  if (user?.image && typeof user.image === "string" && user.image.trim().length > 0) {
    return user.image;
  }
  // Deterministic seed based on email or id or name so header and dashboard match 100%
  const seed = encodeURIComponent(user?.email || user?.id || user?.name || "KindoraUser");
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}
