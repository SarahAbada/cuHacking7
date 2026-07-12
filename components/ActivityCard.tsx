import { Card } from "@/components/ui/card";
import type { ActivityRecommendation } from "@/types/travel";

interface ActivityCardProps {
  activity: ActivityRecommendation;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="space-y-2">
      <h4 className="text-base font-semibold text-slate-900">{activity.name}</h4>
      <p className="text-sm text-slate-600">
        {activity.category} • ${activity.estimatedCost} • Crowd: {activity.crowdLevel}
      </p>
      <p className="text-sm text-slate-700">{activity.whyItFits}</p>
    </Card>
  );
}
