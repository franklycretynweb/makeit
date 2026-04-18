"use client";

import { Download, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// Single neutral config — no color per type, the label is enough
const typeLabel: Record<string, string> = {
  svg: "SVG",
  pdf: "PDF",
  webp: "WEBP",
  png: "PNG",
  jpg: "JPG",
  zip: "ZIP",
  figma: "FIG",
};

interface FileCardProps {
  name: string;
  type: string;
  size: string;
  date: string;
  isNew?: boolean;
  preview?: string;
  downloadUrl?: string;
}

export default function FileCard({ name, type, size, date, isNew, preview, downloadUrl }: FileCardProps) {
  const label = typeLabel[type] ?? type.toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-xl border border-[#EBEBEB] bg-white overflow-hidden cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#CCCCCC] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200"
    >
      {/* New indicator — minimal, no color */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111] block" />
        </div>
      )}

      {/* Preview area — clean light bg */}
      <div className="relative aspect-[4/3] bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
        {preview ? (
          <Image
            src={preview}
            alt={name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <span className="font-sans text-[13px] font-semibold text-[#AAAAAA]">
              {label}
            </span>
          </div>
        )}

        {/* Hover action bar — white, slides up from bottom */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out bg-white/95 border-t border-[#EBEBEB] flex items-center justify-center gap-2 py-2.5 px-4">
          <button className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-[#555555] hover:text-[#111111] transition-colors duration-150">
            <Eye size={13} strokeWidth={1.75} />
            Podgląd
          </button>
          <span className="w-px h-3.5 bg-[#E5E5E5]" />
          <a
            href={downloadUrl ?? "#"}
            download={name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-[#555555] hover:text-[#111111] transition-colors duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={13} strokeWidth={1.75} />
            Pobierz
          </a>
        </div>
      </div>

      {/* Info row */}
      <div className="px-4 py-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-medium text-[#111111] truncate leading-snug">
            {name}
          </p>
          <p className="font-sans text-[11px] text-[#AAAAAA] mt-0.5">
            {size} · {date}
          </p>
        </div>
        <span className="shrink-0 font-sans text-[10px] font-semibold text-[#AAAAAA] bg-[#F5F5F5] border border-[#EBEBEB] rounded-md px-2 py-0.5">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
