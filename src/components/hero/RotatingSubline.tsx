"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

const targets = [
  "firm",
  "e-commerce",
  "twórców",
  "restauracji",
  "startupów",
];

export default function RotatingSubline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % targets.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-sans text-[17px] md:text-[20px] font-medium text-[#444444] leading-[1.6] text-center max-w-2xl mx-auto px-2">
      <LayoutGroup>
        <motion.p layout className="inline m-0 p-0">
          Zaufany partner designu i developmentu dla{" "}
          <motion.span 
            layout
            className="relative inline-flex items-center justify-center overflow-hidden bg-white border-[1.5px] border-[#EAEAEA] shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-[34px] md:h-[40px] rounded-full align-middle mx-1 -translate-y-[2px]"
          >
            {/* Invisible span controls the dynamic width of the pill fluidly */}
            <span className="invisible px-3.5 font-bold text-[15px] md:text-[17px] tracking-tight whitespace-nowrap">
              {targets[index]}
            </span>
            
            <AnimatePresence initial={false}>
              <motion.span
                layout
                key={index}
                initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
                transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center px-3.5 font-bold text-[#111111] text-[15px] md:text-[17px] tracking-tight whitespace-nowrap"
              >
                {targets[index]}
              </motion.span>
            </AnimatePresence>
          </motion.span>
          . Przeprowadzamy marki od złożoności do prostoty.
        </motion.p>
      </LayoutGroup>
    </div>
  );
}
