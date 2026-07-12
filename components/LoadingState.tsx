"use client";

import { motion } from "framer-motion";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16">
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <motion.span
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-3 w-3 rounded-full bg-slate-900"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.1, delay: index * 0.2 }}
          />
        ))}
      </div>
      <p className="text-sm text-slate-500">Gemini is reasoning through local options…</p>
    </div>
  );
}
