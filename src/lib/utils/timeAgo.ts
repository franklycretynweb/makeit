export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "przed chwilą";
  if (h < 24) return `${h} godz. temu`;
  return `${d} dni temu`;
}
