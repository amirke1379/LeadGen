export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDistance(distanceM: number | null | undefined): string {
  if (distanceM == null) return '—';
  if (distanceM < 1000) return `${Math.round(distanceM)} m`;
  return `${(distanceM / 1000).toFixed(1)} km`;
}

export function formatRating(rating: number | null | undefined, reviewCount: number | null | undefined): string {
  if (rating == null) return '—';
  const stars = rating.toFixed(1);
  if (reviewCount != null) return `${stars} (${reviewCount})`;
  return stars;
}
