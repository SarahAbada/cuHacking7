"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { PlanApiResponse } from "@/types/travel";

const REQUEST_TIMEOUT_MS = 20_000;

function mapApiError(code?: PlanApiResponse["code"], fallback = "Unable to build a plan right now.") {
  if (code === "RATE_LIMIT") {
    return "We hit a temporary rate limit. Please try again in a moment.";
  }
  if (code === "TIMEOUT") {
    return "Planning took too long. Try a shorter prompt with core constraints.";
  }
  if (code === "MISSING_API_KEY") {
    return "This deployment is missing a Gemini API key. Please configure GEMINI_API_KEY.";
  }
  if (code === "BAD_REQUEST") {
    return "Please enter your budget, preferences, and season to continue.";
  }
  return fallback;
}

export function useTripPlanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const planTrip = useCallback(
    async (prompt: string) => {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        const data = (await response.json()) as PlanApiResponse;

        if (!response.ok || !data.plan) {
          throw new Error(mapApiError(data.code, data.error ?? "Unable to build a plan right now."));
        }

        sessionStorage.setItem("localLensPlan", JSON.stringify(data.plan));
        router.push("/results");
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          setError("Request timed out. Please try again with a shorter prompt.");
        } else {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Something went wrong while planning the trip.";
          setError(message);
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    },
    [router],
  );

  return { loading, error, planTrip };
}
