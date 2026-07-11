"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  loading: boolean;
}

const PLACEHOLDER =
  "I have $1200, love hiking, hate crowds, and want somewhere warm in November.";

export function PromptInput({ onSubmit, loading }: PromptInputProps) {
  const [prompt, setPrompt] = useState(PLACEHOLDER);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }
    await onSubmit(trimmed);
  }

  return (
    <motion.form
      className="space-y-4 rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
    >
      <label htmlFor="trip-prompt" className="block text-sm font-medium text-slate-600">
        Tell LocalLens your constraints
      </label>
      <textarea
        id="trip-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-slate-200 transition focus:ring"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Planning…" : "Plan my trip"}
      </Button>
    </motion.form>
  );
}
