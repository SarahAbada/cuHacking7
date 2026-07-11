"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlanApiResponse } from "@/types/travel";

export function useTripPlanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function planTrip(prompt: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Unable to build a plan right now.");
      }

      const data = (await response.json()) as PlanApiResponse;
      sessionStorage.setItem("localLensPlan", JSON.stringify(data.plan));
      router.push("/results");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while planning the trip.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, planTrip };
}
