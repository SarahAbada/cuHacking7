import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  Type,
  type FunctionDeclaration,
} from "@google/genai";
import { LOCAL_LENS_SYSTEM_PROMPT } from "@/lib/prompts";
import type { PlanRequestBody, TravelPlan } from "@/types/travel";
import {
  searchActivities,
  searchFlights,
  searchHotels,
  searchWeather,
} from "@/services/mockTools";

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "searchFlights",
    description: "Find flight options for a destination and season",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        season: { type: Type.STRING },
        origin: { type: Type.STRING },
      },
      required: ["query"],
    },
  },
  {
    name: "searchHotels",
    description: "Find hotel options by destination and budget",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        budget: { type: Type.NUMBER },
      },
      required: ["query"],
    },
  },
  {
    name: "searchActivities",
    description: "Find local activity ideas aligned with preferences",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        season: { type: Type.STRING },
      },
      required: ["query"],
    },
  },
  {
    name: "searchWeather",
    description: "Find seasonal weather for a destination",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        season: { type: Type.STRING },
      },
      required: ["query"],
    },
  },
];

function normalizePlan(plan: TravelPlan): TravelPlan {
  return {
    ...plan,
    activities: plan.activities.map((activity) => ({
      ...activity,
      crowdLevel:
        activity.crowdLevel === "high" || activity.crowdLevel === "medium"
          ? activity.crowdLevel
          : "low",
    })),
  };
}

function buildFallbackPlan(prompt: string, origin: string): TravelPlan {
  return {
    destination: {
      name: "Madeira",
      country: "Portugal",
      summary:
        "A warm Atlantic island with dramatic hikes, village cafés, and fewer crowds than mainland hotspots.",
      heroImagePlaceholder: "Golden cliffs over the Atlantic at sunrise",
      bestTimeToVisit: "November to early December",
    },
    tripSummary: `A 6-day shoulder-season trip optimized for hiking, warm weather, and low-crowd local experiences. Request: ${prompt}`,
    reasoning: {
      whyThisDestination: [
        "Warm November climate with reliable hiking conditions",
        "Lower crowd density than nearby Mediterranean city breaks",
        "Good value on flights and family-run stays for mid-range budgets",
      ],
      localPerspective:
        "Base in Funchal but spend most days in villages and levada trails where residents actually spend weekends.",
      tradeoffs: [
        "Mountain weather can shift quickly; build in backup plans",
        "Public transport works but renting a small car improves flexibility",
      ],
      logistics:
        `Origin assumed as ${origin}. Best access is a one-stop route via Lisbon with morning arrivals to maximize day one.`,
    },
    budget: {
      currency: "USD",
      totalEstimate: 1180,
      breakdown: {
        flights: 480,
        accommodation: 320,
        food: 180,
        activities: 90,
        localTransport: 70,
        buffer: 40,
      },
      notes: [
        "Book flights 6-8 weeks ahead for lowest fares",
        "Choose guesthouses outside the old port core for better value",
      ],
    },
    dailyItinerary: [
      {
        day: 1,
        theme: "Settle into local rhythm",
        morning: "Arrive and check into a guesthouse in Santa Maria district",
        afternoon: "Walk Mercado dos Lavradores and local produce lanes",
        evening: "Casual espada dinner at a neighborhood tasca",
        estimatedCost: 95,
      },
      {
        day: 2,
        theme: "Clifftop hiking",
        morning: "Early PR8 Vereda da Ponta de São Lourenço hike",
        afternoon: "Picnic with bakery items from Caniçal",
        evening: "Sunset miradouro and low-key wine bar",
        estimatedCost: 70,
      },
      {
        day: 3,
        theme: "Levada day",
        morning: "Levada das 25 Fontes trail before tour buses",
        afternoon: "Village lunch in Calheta",
        evening: "Rest and local poncha tasting",
        estimatedCost: 85,
      },
    ],
    restaurants: [
      {
        name: "A Bica",
        neighborhood: "Funchal Old Town",
        cuisine: "Madeiran",
        priceRange: "$$",
        whyLocalPick: "Family-run, no tourist menu gimmicks, excellent espada and milho frito",
      },
      {
        name: "Venda da Donna Maria",
        neighborhood: "Santo da Serra",
        cuisine: "Portuguese comfort",
        priceRange: "$",
        whyLocalPick: "Popular with local hikers on weekends",
      },
    ],
    activities: [
      {
        name: "Ponta de São Lourenço sunrise hike",
        category: "Outdoors",
        estimatedCost: 0,
        crowdLevel: "low",
        whyItFits: "Open views, warm weather, and fewer midday crowds",
      },
      {
        name: "Mercado produce tasting",
        category: "Food & Culture",
        estimatedCost: 20,
        crowdLevel: "medium",
        whyItFits: "Local produce and snacks in one compact stop",
      },
    ],
    packingSuggestions: [
      "Light layers for warm afternoons and cooler evenings",
      "Trail shoes with grip for wet stone paths",
      "Packable rain shell for sudden mountain drizzle",
    ],
    warnings: [
      "Steep roads and curves may be uncomfortable for motion-sensitive travelers",
      "Some popular levada trails require early starts to avoid congestion",
    ],
    alternativeDestinations: [
      {
        name: "Gran Canaria",
        country: "Spain",
        reason: "Warm in November with excellent mountain and coastal trails",
        estimatedBudget: 1240,
      },
      {
        name: "Oman (Muscat + Jebel Akhdar)",
        country: "Oman",
        reason: "Warm shoulder season, dramatic hikes, and lower crowd levels",
        estimatedBudget: 1390,
      },
    ],
    toolInsights: {
      flights: "MockSky found fares from Canada between $370-$515 round-trip.",
      hotels: "MockStay returned 3 guesthouses averaging $88/night.",
      activities: "MockWander indicates trail-heavy days with low to medium crowds.",
      weather: "MockMeteo indicates average highs near 26°C with limited rain days.",
    },
  };
}

function parseNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function runTool(name: string, args: Record<string, unknown>) {
  const query = parseString(args.query) ?? "warm low-crowd destination";
  const season = parseString(args.season);
  const origin = parseString(args.origin);
  const budget = parseNumber(args.budget);

  if (name === "searchFlights") {
    return searchFlights({ query, season, origin });
  }
  if (name === "searchHotels") {
    return searchHotels({ query, budget });
  }
  if (name === "searchActivities") {
    return searchActivities({ query, season });
  }
  return searchWeather({ query, season });
}

function safeParsePlan(text: string): TravelPlan | null {
  try {
    return normalizePlan(JSON.parse(text) as TravelPlan);
  } catch {
    return null;
  }
}

export async function createTravelPlan({ prompt, origin }: PlanRequestBody) {
  const apiKey = process.env.GEMINI_API_KEY;
  const normalizedOrigin = origin?.trim() ? origin.trim() : "Canada";

  if (!apiKey) {
    return buildFallbackPlan(prompt, normalizedOrigin);
  }

  const ai = new GoogleGenAI({ apiKey });

  const toolCallResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `User request: ${prompt}. Origin: ${normalizedOrigin}. Decide what tools to call before planning.`,
    config: {
      tools: [{ functionDeclarations: [...TOOL_DECLARATIONS] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [
            "searchFlights",
            "searchHotels",
            "searchActivities",
            "searchWeather",
          ],
        },
      },
    },
  });

  const functionCalls = toolCallResponse.functionCalls ?? [];
  const toolResults: Record<string, unknown> = {};

  for (const call of functionCalls) {
    const name = call.name ?? "searchWeather";
    const args = (call.args ?? {}) as Record<string, unknown>;
    toolResults[name] = await runTool(name, args);
  }

  if (!toolResults.searchFlights) {
    toolResults.searchFlights = await searchFlights({
      query: prompt,
      origin: normalizedOrigin,
    });
  }
  if (!toolResults.searchHotels) {
    toolResults.searchHotels = await searchHotels({ query: prompt });
  }
  if (!toolResults.searchActivities) {
    toolResults.searchActivities = await searchActivities({ query: prompt });
  }
  if (!toolResults.searchWeather) {
    toolResults.searchWeather = await searchWeather({ query: prompt });
  }

  const planResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      `${LOCAL_LENS_SYSTEM_PROMPT}`,
      `User prompt: ${prompt}`,
      `Travel origin: ${normalizedOrigin}`,
      `Tool outputs (JSON): ${JSON.stringify(toolResults)}`,
      "Generate the final strict JSON response now.",
    ].join("\n\n"),
    config: {
      responseMimeType: "application/json",
      temperature: 0.5,
    },
  });

  const parsed = safeParsePlan(planResponse.text ?? "");
  return parsed ?? buildFallbackPlan(prompt, normalizedOrigin);
}
