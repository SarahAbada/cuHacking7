"use client";

import { motion } from "framer-motion";
import { LoadingState } from "@/components/LoadingState";
import { PromptInput } from "@/components/PromptInput";
import { useTripPlanner } from "@/hooks/useTripPlanner";

export default function HomePage() {
  const { loading, error, planTrip } = useTripPlanner();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 py-6">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">LocalLens</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
          Travel like a local.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          Share your budget, interests, dislikes, and season. Gemini reasons through tradeoffs and builds a realistic itinerary.
        </p>
      </motion.div>

      <PromptInput onSubmit={planTrip} loading={loading} />

      {loading && <LoadingState />}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
