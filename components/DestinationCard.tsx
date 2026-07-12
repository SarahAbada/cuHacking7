import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Destination } from "@/types/travel";

interface DestinationCardProps {
  destination: Destination;
  tripSummary: string;
}

export function DestinationCard({ destination, tripSummary }: DestinationCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="h-56 w-full bg-gradient-to-br from-amber-200 via-orange-200 to-sky-200" />
      <div className="space-y-3 p-6">
        <CardTitle>
          {destination.name}, {destination.country}
        </CardTitle>
        <CardDescription>{destination.summary}</CardDescription>
        <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{tripSummary}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Best time: {destination.bestTimeToVisit}
        </p>
      </div>
    </Card>
  );
}
