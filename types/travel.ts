export interface PlanRequestBody {
  prompt: string;
  origin?: string;
}

export interface Destination {
  name: string;
  country: string;
  summary: string;
  heroImagePlaceholder: string;
  bestTimeToVisit: string;
}

export interface Reasoning {
  whyThisDestination: string[];
  localPerspective: string;
  tradeoffs: string[];
  logistics: string;
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  localTransport: number;
  buffer: number;
}

export interface Budget {
  currency: string;
  totalEstimate: number;
  breakdown: BudgetBreakdown;
  notes: string[];
}

export interface ItineraryDay {
  day: number;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  estimatedCost: number;
}

export interface RestaurantRecommendation {
  name: string;
  neighborhood: string;
  cuisine: string;
  priceRange: string;
  whyLocalPick: string;
}

export interface ActivityRecommendation {
  name: string;
  category: string;
  estimatedCost: number;
  crowdLevel: "low" | "medium" | "high";
  whyItFits: string;
}

export interface AlternativeDestination {
  name: string;
  country: string;
  reason: string;
  estimatedBudget: number;
}

export interface ToolInsights {
  flights: string;
  hotels: string;
  activities: string;
  weather: string;
}

export interface TravelPlan {
  destination: Destination;
  tripSummary: string;
  reasoning: Reasoning;
  budget: Budget;
  dailyItinerary: ItineraryDay[];
  restaurants: RestaurantRecommendation[];
  activities: ActivityRecommendation[];
  packingSuggestions: string[];
  warnings: string[];
  alternativeDestinations: AlternativeDestination[];
  toolInsights: ToolInsights;
}

export interface PlanApiResponse {
  plan: TravelPlan;
}
