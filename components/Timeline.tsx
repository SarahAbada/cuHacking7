import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { ItineraryDay } from "@/types/travel";

interface TimelineProps {
  days: ItineraryDay[];
}

export function Timeline({ days }: TimelineProps) {
  return (
    <Card>
      <CardTitle>Daily itinerary</CardTitle>
      <CardDescription className="mt-1">A practical, low-friction local plan</CardDescription>
      <ol className="mt-4 space-y-6">
        {days.map((day) => (
          <li key={day.day} className="relative border-l border-slate-200 pl-5">
            <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full bg-slate-900" />
            <p className="text-sm font-semibold text-slate-900">
              Day {day.day}: {day.theme}
            </p>
            <p className="mt-2 text-sm text-slate-700">Morning: {day.morning}</p>
            <p className="text-sm text-slate-700">Afternoon: {day.afternoon}</p>
            <p className="text-sm text-slate-700">Evening: {day.evening}</p>
            <p className="mt-1 text-xs text-slate-500">Estimated daily spend: ${day.estimatedCost}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
