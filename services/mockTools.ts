interface SearchArgs {
  query: string;
  budget?: number;
  season?: string;
  origin?: string;
}

function pickDestination(query: string) {
  const normalized = query.toLowerCase();
  if (normalized.includes("japan") || normalized.includes("tokyo")) {
    return "Tokyo";
  }
  if (normalized.includes("beach") || normalized.includes("warm") || normalized.includes("island")) {
    return "Madeira";
  }
  if (normalized.includes("city") || normalized.includes("museum")) {
    return "Lisbon";
  }
  return "Valencia";
}

const HOTEL_DATA: Record<string, Array<{ name: string; nightlyRate: number; area: string; rating: number }>> = {
  Madeira: [
    { name: "Casa Mercado", nightlyRate: 92, area: "Old Town", rating: 4.7 },
    { name: "Harbor Nook", nightlyRate: 109, area: "Waterfront", rating: 4.6 },
    { name: "Levada House", nightlyRate: 84, area: "Santa Luzia", rating: 4.5 },
  ],
  Valencia: [
    { name: "Ruzafa Atelier", nightlyRate: 111, area: "Ruzafa", rating: 4.6 },
    { name: "Turia Loft Hotel", nightlyRate: 97, area: "El Carmen", rating: 4.5 },
    { name: "Cabanyal Guesthouse", nightlyRate: 88, area: "Cabanyal", rating: 4.4 },
  ],
  Lisbon: [
    { name: "Alfama Courtyard", nightlyRate: 121, area: "Alfama", rating: 4.6 },
    { name: "Bica Social Hotel", nightlyRate: 113, area: "Bica", rating: 4.5 },
    { name: "Graça View Stay", nightlyRate: 96, area: "Graça", rating: 4.4 },
  ],
  Tokyo: [
    { name: "Asakusa Local Inn", nightlyRate: 132, area: "Asakusa", rating: 4.5 },
    { name: "Kanda Metro Stay", nightlyRate: 125, area: "Kanda", rating: 4.4 },
    { name: "Shimokitazawa House", nightlyRate: 119, area: "Shimokitazawa", rating: 4.6 },
  ],
};

const WEATHER_DATA: Record<string, { avgHighC: number; avgLowC: number; rainDays: number; humidity: string; notes: string }> = {
  Madeira: {
    avgHighC: 24,
    avgLowC: 18,
    rainDays: 5,
    humidity: "moderate",
    notes: "Warm with ocean breeze and occasional short showers.",
  },
  Valencia: {
    avgHighC: 23,
    avgLowC: 15,
    rainDays: 4,
    humidity: "low",
    notes: "Sunny shoulder-season days with cool evenings.",
  },
  Lisbon: {
    avgHighC: 21,
    avgLowC: 14,
    rainDays: 7,
    humidity: "moderate",
    notes: "Mild conditions, some windy evenings by the river.",
  },
  Tokyo: {
    avgHighC: 19,
    avgLowC: 11,
    rainDays: 8,
    humidity: "moderate",
    notes: "Comfortable temperatures with periodic rainfall.",
  },
};

const ACTIVITY_DATA: Record<string, Array<{ name: string; cost: number; crowdLevel: "low" | "medium" | "high"; availability: string }>> = {
  Madeira: [
    { name: "Ponta de São Lourenço sunrise hike", cost: 0, crowdLevel: "low", availability: "Open daily, best before 9:00." },
    { name: "Lavradores Market tasting", cost: 22, crowdLevel: "medium", availability: "Best Tue-Sat mornings." },
    { name: "Levada village trail", cost: 15, crowdLevel: "medium", availability: "Guided tours run every morning." },
  ],
  Valencia: [
    { name: "Turia Gardens bike loop", cost: 18, crowdLevel: "low", availability: "Bike rentals open 9:00-20:00." },
    { name: "Central Market tapas crawl", cost: 35, crowdLevel: "high", availability: "Food stalls peak 12:00-14:00." },
    { name: "Cabanyal ceramics workshop", cost: 28, crowdLevel: "medium", availability: "Limited spots Fri-Sun." },
  ],
  Lisbon: [
    { name: "Graça miradouro walk", cost: 0, crowdLevel: "medium", availability: "Best before sunset crowds." },
    { name: "LX Factory design market", cost: 20, crowdLevel: "high", availability: "Open daily, busiest weekends." },
    { name: "Alfama fado dinner", cost: 42, crowdLevel: "medium", availability: "Reservations needed after 18:00." },
  ],
  Tokyo: [
    { name: "Yanaka heritage walk", cost: 0, crowdLevel: "low", availability: "Any daylight hour." },
    { name: "Tsukiji food alleys", cost: 40, crowdLevel: "high", availability: "Peak from 8:00-11:00." },
    { name: "Shibuya local jazz night", cost: 35, crowdLevel: "medium", availability: "Most venues open after 19:00." },
  ],
};

export async function searchFlights(args: SearchArgs) {
  const destination = pickDestination(args.query);
  const origin = args.origin ?? "Toronto";
  const seasonalMultiplier = args.season?.toLowerCase().includes("dec") ? 1.15 : 1;
  const base = destination === "Tokyo" ? 980 : destination === "Madeira" ? 540 : 460;

  return {
    provider: "MockSky",
    origin,
    destination,
    season: args.season ?? "any",
    options: [
      {
        airline: "Aurora Air",
        price: Math.round(base * seasonalMultiplier),
        duration: destination === "Tokyo" ? "13h 45m" : "8h 35m",
        stops: destination === "Tokyo" ? 1 : 0,
      },
      {
        airline: "Pacific North",
        price: Math.round(base * 0.9 * seasonalMultiplier),
        duration: destination === "Tokyo" ? "15h 10m" : "10h 05m",
        stops: 1,
      },
      {
        airline: "Maple Budget",
        price: Math.round(base * 0.82 * seasonalMultiplier),
        duration: destination === "Tokyo" ? "18h 20m" : "11h 15m",
        stops: 2,
      },
    ],
  };
}

export async function searchHotels(args: SearchArgs) {
  const destination = pickDestination(args.query);
  const options = HOTEL_DATA[destination] ?? HOTEL_DATA.Valencia;
  const targetBudget = args.budget ?? 1400;

  return {
    provider: "MockStay",
    destination,
    query: args.query,
    budget: targetBudget,
    options,
    averageNightlyRate: Math.round(options.reduce((sum, hotel) => sum + hotel.nightlyRate, 0) / options.length),
  };
}

export async function searchActivities(args: SearchArgs) {
  const destination = pickDestination(args.query);
  const ideas = ACTIVITY_DATA[destination] ?? ACTIVITY_DATA.Valencia;

  return {
    provider: "MockWander",
    destination,
    query: args.query,
    ideas,
  };
}

export async function searchWeather(args: SearchArgs) {
  const destination = pickDestination(args.query);
  return {
    provider: "MockMeteo",
    destination,
    season: args.season ?? "current",
    forecast: WEATHER_DATA[destination] ?? WEATHER_DATA.Valencia,
  };
}

export async function searchTransportation(args: SearchArgs) {
  const destination = pickDestination(args.query);

  const transportMap: Record<string, { airportTransfer: string; localTransit: string; dayPassCost: number; walkability: string }> = {
    Madeira: {
      airportTransfer: "Airport Aerobus to Funchal every 30 minutes (45 min)",
      localTransit: "Regional buses connect villages but evening frequency is limited",
      dayPassCost: 7,
      walkability: "Central Funchal is walkable, hills can be steep",
    },
    Valencia: {
      airportTransfer: "Metro Lines 3/5 reach city center in 25 minutes",
      localTransit: "Integrated metro + bus network with reliable 10-15 minute headways",
      dayPassCost: 5,
      walkability: "Very walkable historic core and bike-friendly boulevards",
    },
    Lisbon: {
      airportTransfer: "Metro red line reaches downtown with one transfer",
      localTransit: "Metro, trams, ferries and buses cover core neighborhoods",
      dayPassCost: 7,
      walkability: "Walkable but hilly; trams help on steep routes",
    },
    Tokyo: {
      airportTransfer: "Narita Express or Keisei Skyliner in 40-60 minutes",
      localTransit: "Dense rail network; IC cards simplify transfers",
      dayPassCost: 9,
      walkability: "High walkability around stations with occasional long transfer corridors",
    },
  };

  return {
    provider: "MockTransit",
    destination,
    ...(transportMap[destination] ?? transportMap.Valencia),
  };
}
