export function formatDuration(seconds: number): string {
  if (seconds < 0) throw new Error('Seconds cannot be negative');

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (h > 0) parts.push(`${h} h`);
  if (m > 0) parts.push(`${m} m`);
  if (s > 0 || parts.length === 0) parts.push(`${s} s`);

  return parts.join(' ');
}