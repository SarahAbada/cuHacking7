"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ActivityCard } from "@/components/ActivityCard";
import { BudgetCard } from "@/components/BudgetCard";
import { DestinationCard } from "@/components/DestinationCard";
import { ReasoningCard } from "@/components/ReasoningCard";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Timeline } from "@/components/Timeline";
import { Card, CardTitle } from "@/components/ui/card";
import type { TravelPlan } from "@/types/travel";

export default function ResultsPage() {
  const [plan, setPlan] = useState<TravelPlan | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("localLensPlan");
    if (!raw) {
      return;
    }

    try {
      setPlan(JSON.parse(raw) as TravelPlan);
    } catch {
      setPlan(null);
    }
  }, []);

  const emptyState = useMemo(
    () => (
      <Card>
        <CardTitle>No trip plan yet</CardTitle>
        <p className="mt-3 text-sm text-slate-600">Go back to the landing page and submit your trip prompt to generate recommendations.</p>
      </Card>
    ),
    [],
  );

  if (!plan) {
    return <section className="mx-auto w-full max-w-4xl">{emptyState}</section>;
  }

  return (
    <motion.section
      className="mx-auto w-full max-w-6xl space-y-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <DestinationCard destination={plan.destination} tripSummary={plan.tripSummary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ReasoningCard reasoning={plan.reasoning} />
        <BudgetCard budget={plan.budget} />
      </div>

      <Timeline days={plan.dailyItinerary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Restaurants</CardTitle>
          <div className="mt-4 space-y-4">
            {plan.restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.name} restaurant={restaurant} />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Activities</CardTitle>
          <div className="mt-4 space-y-4">
            {plan.activities.map((activity) => (
              <ActivityCard key={activity.name} activity={activity} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>Packing suggestions</CardTitle>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {plan.packingSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Warnings</CardTitle>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {plan.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Alternatives</CardTitle>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {plan.alternativeDestinations.map((option) => (
              <div key={option.name}>
                <p className="font-semibold">
                  {option.name}, {option.country}
                </p>
                <p>{option.reason}</p>
                <p className="text-slate-500">Budget: ${option.estimatedBudget}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>Tool insights</CardTitle>
        <div className="mt-4 grid gap-4 text-sm text-slate-700 lg:grid-cols-2">
          <p>{plan.toolInsights.flights}</p>
          <p>{plan.toolInsights.hotels}</p>
          <p>{plan.toolInsights.activities}</p>
          <p>{plan.toolInsights.weather}</p>
        </div>
      </Card>
    </motion.section>
  );
}
