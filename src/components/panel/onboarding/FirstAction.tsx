"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface FirstActionProps {
  onAction: () => void;
  onSkip: () => void;
}

export default function FirstAction({ onAction, onSkip }: FirstActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[420px] w-full mx-6"
      >
        <div className="relative rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.12),0_8px_32px_rgba(78,168,255,0.06)] p-8 text-center overflow-hidden">
          {/* Ambient top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-gradient-to-b from-[#4EA8FF]/10 to-transparent rounded-full blur-[40px] pointer-events-none" />

          <div className="relative">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#4EA8FF] to-[#6B4EFF] flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(78,168,255,0.3)]"
            >
              <Sparkles className="w-6 h-6 text-white" strokeWidth={1.75} />
            </motion.div>

            <h2 className="font-display text-[20px] font-bold tracking-[-0.03em] text-[#111111] mb-2">
              Zacznij od pierwszej akcji
            </h2>
            <p className="font-sans text-[14px] text-[#6B7280] leading-relaxed mb-6">
              Czeka na Ciebie design do zatwierdzenia.
              <br />
              Zajmie to dosłownie chwilę.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={onAction}
                className="group w-full inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#000000] text-white font-sans text-[14px] font-medium px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Przejdź do Design Review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2} />
              </button>
              <button
                onClick={onSkip}
                className="font-sans text-[13px] font-medium text-[#9CA3AF] hover:text-[#6B7280] py-2 transition-colors duration-200"
              >
                Może później
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
