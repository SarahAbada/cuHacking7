import type {
  ActivityRecommendation,
  AlternativeDestination,
  Budget,
  BudgetBreakdown,
  Destination,
  ItineraryDay,
  Reasoning,
  RestaurantRecommendation,
  ToolInsights,
  TransportSummary,
  TravelPlan,
  WeatherSummary,
} from "@/types/travel";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function parseDestination(value: unknown): Destination {
  const input = asRecord(value);
  return {
    name: asString(input?.name, "Madeira"),
    country: asString(input?.country, "Portugal"),
    summary: asString(input?.summary, "A balanced local-first destination."),
    heroImagePlaceholder: asString(input?.heroImagePlaceholder, "Coastal city skyline at sunset"),
    bestTimeToVisit: asString(input?.bestTimeToVisit, "Shoulder season"),
  };
}

function parseReasoning(value: unknown): Reasoning {
  const input = asRecord(value);
  return {
    whyThisDestination: asStringArray(input?.whyThisDestination).slice(0, 6),
    localPerspective: asString(input?.localPerspective, "Choose neighborhood routines over tourist clusters."),
    tradeoffs: asStringArray(input?.tradeoffs).slice(0, 5),
    logistics: asString(input?.logistics, "Build flexibility for weather and transport variability."),
    comparisonSet: asStringArray(input?.comparisonSet).slice(0, 3),
    clarifyingQuestions: asStringArray(input?.clarifyingQuestions).slice(0, 3),
  };
}

function parseBudgetBreakdown(value: unknown): BudgetBreakdown {
  const input = asRecord(value);
  return {
    flights: asNumber(input?.flights, 0),
    accommodation: asNumber(input?.accommodation, 0),
    food: asNumber(input?.food, 0),
    activities: asNumber(input?.activities, 0),
    localTransport: asNumber(input?.localTransport, 0),
    buffer: asNumber(input?.buffer, 0),
  };
}

function parseBudget(value: unknown): Budget {
  const input = asRecord(value);
  const breakdown = parseBudgetBreakdown(input?.breakdown);
  const calculatedTotal = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);
  const totalEstimate = asNumber(input?.totalEstimate, calculatedTotal);
  return {
    currency: asString(input?.currency, "USD"),
    totalEstimate: totalEstimate > 0 ? totalEstimate : calculatedTotal,
    breakdown,
    notes: asStringArray(input?.notes).slice(0, 6),
  };
}

function parseItineraryDay(value: unknown, fallbackDay: number): ItineraryDay {
  const input = asRecord(value);
  return {
    day: Math.max(1, asNumber(input?.day, fallbackDay)),
    theme: asString(input?.theme, "Explore local neighborhoods"),
    morning: asString(input?.morning, "Coffee and a short local walk."),
    afternoon: asString(input?.afternoon, "Visit a neighborhood market and museum."),
    evening: asString(input?.evening, "Casual dinner in a residential district."),
    estimatedCost: Math.max(0, asNumber(input?.estimatedCost, 80)),
  };
}

function parseRestaurants(value: unknown): RestaurantRecommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      const input = asRecord(item);
      return {
        name: asString(input?.name),
        neighborhood: asString(input?.neighborhood),
        cuisine: asString(input?.cuisine),
        priceRange: asString(input?.priceRange, "$$"),
        whyLocalPick: asString(input?.whyLocalPick),
      };
    })
    .filter((restaurant) => restaurant.name && restaurant.whyLocalPick);
}

function parseActivities(value: unknown): ActivityRecommendation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const input = asRecord(item);
      const crowdLevel = asString(input?.crowdLevel, "low").toLowerCase();
      return {
        name: asString(input?.name),
        category: asString(input?.category, "General"),
        estimatedCost: Math.max(0, asNumber(input?.estimatedCost, 0)),
        crowdLevel: crowdLevel === "high" || crowdLevel === "medium" ? crowdLevel : "low",
        whyItFits: asString(input?.whyItFits),
        availability: asString(input?.availability, "Check day-of for schedule changes."),
      };
    })
    .filter((activity) => activity.name && activity.whyItFits);
}

function parseAlternatives(value: unknown): AlternativeDestination[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      const input = asRecord(item);
      return {
        name: asString(input?.name),
        country: asString(input?.country),
        reason: asString(input?.reason),
        estimatedBudget: Math.max(0, asNumber(input?.estimatedBudget, 0)),
      };
    })
    .filter((destination) => destination.name && destination.reason);
}

function parseWeatherSummary(value: unknown): WeatherSummary {
  const input = asRecord(value);
  return {
    outlook: asString(input?.outlook, "Mild temperatures with occasional rain."),
    averageHighC: asNumber(input?.averageHighC, 24),
    averageLowC: asNumber(input?.averageLowC, 16),
    precipitationRisk: asString(input?.precipitationRisk, "Medium"),
  };
}

function parseTransportSummary(value: unknown): TransportSummary {
  const input = asRecord(value);
  return {
    localTransit: asString(input?.localTransit, "Urban buses and metro are reliable outside rush hour."),
    airportTransfer: asString(input?.airportTransfer, "Use airport express bus or fixed-fare taxi."),
    walkability: asString(input?.walkability, "Central neighborhoods are walkable with some inclines."),
  };
}

function parseToolInsights(value: unknown): ToolInsights {
  const input = asRecord(value);
  return {
    flights: asString(input?.flights, "Flight data unavailable."),
    hotels: asString(input?.hotels, "Hotel data unavailable."),
    activities: asString(input?.activities, "Activity data unavailable."),
    weather: asString(input?.weather, "Weather data unavailable."),
    transportation: asString(input?.transportation, "Transportation data unavailable."),
  };
}

function parseJsonObjectFromText(text: string): Record<string, unknown> | null {
  const normalized = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");

  const candidate =
    firstBrace >= 0 && lastBrace > firstBrace
      ? normalized.slice(firstBrace, lastBrace + 1)
      : normalized;

  try {
    const parsed = JSON.parse(candidate);
    return asRecord(parsed);
  } catch {
    return null;
  }
}

export function parseTravelPlanFromText(text: string): TravelPlan | null {
  const parsed = parseJsonObjectFromText(text);
  if (!parsed) {
    return null;
  }

  const budget = parseBudget(parsed.budget);
  const dailyItinerary = Array.isArray(parsed.dailyItinerary)
    ? parsed.dailyItinerary.map((item, index) => parseItineraryDay(item, index + 1)).slice(0, 10)
    : [];

  return {
    destination: parseDestination(parsed.destination),
    tripSummary: asString(parsed.tripSummary, "A local-first itinerary designed for your constraints."),
    reasoning: parseReasoning(parsed.reasoning),
    budget,
    dailyItinerary,
    restaurants: parseRestaurants(parsed.restaurants),
    activities: parseActivities(parsed.activities),
    packingSuggestions: asStringArray(parsed.packingSuggestions).slice(0, 8),
    warnings: asStringArray(parsed.warnings).slice(0, 6),
    alternativeDestinations: parseAlternatives(parsed.alternativeDestinations).slice(0, 3),
    weatherSummary: parseWeatherSummary(parsed.weatherSummary),
    transportSummary: parseTransportSummary(parsed.transportSummary),
    travelTips: asStringArray(parsed.travelTips).slice(0, 6),
    tripScore: Math.max(0, Math.min(100, asNumber(parsed.tripScore, 78))),
    toolInsights: parseToolInsights(parsed.toolInsights),
  };
}
