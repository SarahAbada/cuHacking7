interface SearchArgs {
  query: string;
  budget?: number;
  season?: string;
  origin?: string;
}

export async function searchFlights(args: SearchArgs) {
  return {
    provider: "MockSky",
    origin: args.origin ?? "Canada",
    query: args.query,
    season: args.season ?? "any",
    options: [
      { airline: "Pacific North", price: 420, duration: "5h 40m", stops: 1 },
      { airline: "Aurora Air", price: 515, duration: "4h 55m", stops: 0 },
      { airline: "Maple Budget", price: 370, duration: "7h 10m", stops: 1 },
    ],
  };
}

export async function searchHotels(args: SearchArgs) {
  return {
    provider: "MockStay",
    query: args.query,
    budget: args.budget ?? 1200,
    options: [
      { name: "Casa Mercado", nightlyRate: 88, area: "Old Town", rating: 4.6 },
      { name: "Harbor Nook", nightlyRate: 102, area: "Waterfront", rating: 4.7 },
      { name: "Local Quarter Inn", nightlyRate: 75, area: "Arts District", rating: 4.5 },
    ],
  };
}

export async function searchActivities(args: SearchArgs) {
  return {
    provider: "MockWander",
    query: args.query,
    ideas: [
      { name: "Sunrise ridge hike", cost: 0, crowdLevel: "low" },
      { name: "Neighborhood food walk", cost: 35, crowdLevel: "medium" },
      { name: "Local craft market", cost: 15, crowdLevel: "low" },
    ],
  };
}

export async function searchWeather(args: SearchArgs) {
  return {
    provider: "MockMeteo",
    query: args.query,
    season: args.season ?? "current",
    forecast: {
      avgHighC: 26,
      avgLowC: 18,
      rainDays: 5,
      humidity: "moderate",
      notes: "Warm days with cooler evenings and occasional coastal wind.",
    },
  };
}
