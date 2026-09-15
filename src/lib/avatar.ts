export const TOTAL_AVATARS = 12;

/**
 * Returns a 1-based index (1..12) deterministically hashed from a string identifier (player name or ID).
 */
export function getAvatarIndex(identifier: string): number {
  if (!identifier) return 1;
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % TOTAL_AVATARS) + 1;
}

/**
 * Returns the local static path to the player's 3D Memoji avatar.
 */
export function getAvatarUrl(identifier?: string): string {
  if (!identifier) return '/avatars/avatar-1.png';
  const idx = getAvatarIndex(identifier);
  return `/avatars/avatar-${idx}.png`;
}

/**
 * Extracts 1-2 letter uppercase initials from a player's full name.
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Palette of vibrant pastel gradients for fallback initials avatars.
 */
const INITIALS_GRADIENTS = [
  'from-emerald-500 to-teal-700',
  'from-sky-500 to-blue-700',
  'from-indigo-500 to-purple-700',
  'from-purple-500 to-pink-700',
  'from-rose-500 to-red-700',
  'from-amber-500 to-orange-700',
  'from-teal-500 to-emerald-700',
  'from-cyan-500 to-sky-700',
];

export function getInitialsGradient(identifier?: string): string {
  if (!identifier) return INITIALS_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % INITIALS_GRADIENTS.length;
  return INITIALS_GRADIENTS[idx];
}
