export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    month: "short",
    year: "numeric",
  });
}
