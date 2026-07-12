import { Card } from "@/components/ui/card";
import type { RestaurantRecommendation } from "@/types/travel";

interface RestaurantCardProps {
  restaurant: RestaurantRecommendation;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card className="space-y-2">
      <h4 className="text-base font-semibold text-slate-900">{restaurant.name}</h4>
      <p className="text-sm text-slate-600">
        {restaurant.cuisine} • {restaurant.neighborhood} • {restaurant.priceRange}
      </p>
      <p className="text-sm text-slate-700">{restaurant.whyLocalPick}</p>
    </Card>
  );
}
