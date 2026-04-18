"use client";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  discovery:   { label: "Discovery",   bg: "#F5F5F5", text: "#555555" },
  design:      { label: "Design",      bg: "#EEF2FF", text: "#4B5BE0" },
  development: { label: "Development", bg: "#F0FDF4", text: "#16A34A" },
  review:      { label: "Review",      bg: "#FFF7ED", text: "#C2410C" },
  launch:      { label: "Launch",      bg: "#FDF4FF", text: "#9333EA" },
  live:        { label: "Live",        bg: "#F0FDF4", text: "#15803D" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, bg: "#F5F5F5", text: "#555555" };
  return (
    <span
      className="inline-flex items-center font-sans text-[11px] font-semibold px-2.5 py-1 rounded-md"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
