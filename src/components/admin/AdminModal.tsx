"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export default function AdminModal({ open, title, onClose, children, footer, width = "max-w-[500px]" }: AdminModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${width} mx-6 rounded-xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
              <h2 className="font-sans text-[15px] font-semibold text-[#111111]">{title}</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-[#F5F5F5] flex items-center justify-center text-[#AAAAAA] hover:text-[#111111] transition-all duration-150"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="px-6 pb-5">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
