/**
 * Time formatting utility for Apex Office Suite.
 * Formats timestamps (epoch ms) or date strings into human-readable relative time expressions in Spanish.
 */
export function formatRelativeTime(timestamp: number | string | undefined | null): string {
  if (!timestamp) return 'Reciente';

  const timeMs = typeof timestamp === 'number' ? timestamp : Date.parse(timestamp);
  if (isNaN(timeMs)) {
    // If it's already a formatted string, return it as fallback
    return String(timestamp);
  }

  const now = Date.now();
  const diffMs = now - timeMs;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 45) {
    return 'Hace un momento';
  }
  if (diffMin < 60) {
    return `Hace ${diffMin} ${diffMin === 1 ? 'min' : 'mins'}`;
  }

  const targetDate = new Date(timeMs);
  const nowDate = new Date(now);

  const isToday =
    targetDate.getDate() === nowDate.getDate() &&
    targetDate.getMonth() === nowDate.getMonth() &&
    targetDate.getFullYear() === nowDate.getFullYear();

  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return `Hoy, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(nowDate.getDate() - 1);
  const isYesterday =
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Ayer, ${timeStr}`;
  }

  // Older dates: format as DD/MM/YYYY
  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = targetDate.getFullYear();
  return `${day}/${month}/${year}`;
}
