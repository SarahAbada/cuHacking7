import {
  ApiError,
  FunctionCallingConfigMode,
  GoogleGenAI,
  Type,
  type FunctionDeclaration,
} from "@google/genai";
import { parseTravelPlanFromText } from "@/lib/planValidation";
import { LOCAL_LENS_SYSTEM_PROMPT } from "@/lib/prompts";
import { buildProvinceContext } from "@/lib/provinceContext";
import type { PlanRequestBody, TravelPlan } from "@/types/travel";
import {
  searchActivities,
  searchFlights,
  searchHotels,
  searchTransportation,
  searchWeather,
} from "@/services/mockTools";

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "searchFlights",
    description: "Find realistic flight options including duration and stops",
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
    description: "Find local activity ideas aligned with preferences and season",
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
    description: "Find destination weather and seasonal conditions",
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
    name: "searchTransportation",
    description: "Find local transport quality and airport transfer details",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
      },
      required: ["query"],
    },
  },
];

type PlannerErrorCode =
  | "MISSING_API_KEY"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "INVALID_JSON"
  | "UPSTREAM_ERROR"
  | "UNKNOWN_ERROR";

export class PlannerError extends Error {
  code: PlannerErrorCode;
  status?: number;

  constructor(code: PlannerErrorCode, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
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
    tripSummary: `A 6-day shoulder-season trip optimized for hiking, warm weather, and local experiences. Request: ${prompt}`,
    reasoning: {
      whyThisDestination: [
        "Warm shoulder-season weather supports outdoor plans",
        "Generally lower crowd pressure than classic city-break destinations",
        "Balanced cost profile between flights, stays, and activities",
      ],
      localPerspective:
        "Stay in Funchal for convenience, but spend most days in smaller towns and levada routes where local weekend life happens.",
      tradeoffs: [
        "Mountain weather can shift quickly, so backup indoor options are needed",
        "Transit is workable but a small rental car gives better schedule control",
      ],
      logistics: `Origin assumed as ${origin}. One-stop routes through Lisbon typically provide the best arrival times.`,
      comparisonSet: ["Valencia: cheaper flights but busier center", "Lisbon: easier transit but denser tourism"],
      clarifyingQuestions: ["Do you prefer renting a car or relying on public transit?"],
    },
    budget: {
      currency: "USD",
      totalEstimate: 1260,
      breakdown: {
        flights: 540,
        accommodation: 360,
        food: 180,
        activities: 90,
        localTransport: 60,
        buffer: 30,
      },
      notes: [
        "Book flights 6-8 weeks ahead for lower shoulder-season fares",
        "Guesthouses outside the old port core often reduce nightly rate by 10-20%",
      ],
    },
    dailyItinerary: [
      {
        day: 1,
        theme: "Arrival and orientation",
        morning: "Arrive and transfer to a guesthouse in Funchal.",
        afternoon: "Walk old town produce streets and waterfront viewpoints.",
        evening: "Early local seafood dinner and rest.",
        estimatedCost: 95,
      },
      {
        day: 2,
        theme: "Coastal hiking day",
        morning: "Sunrise hike at Ponta de São Lourenço.",
        afternoon: "Village lunch in Caniçal and local bakery stop.",
        evening: "Miradouro sunset and relaxed bar.",
        estimatedCost: 70,
      },
      {
        day: 3,
        theme: "Levada and market culture",
        morning: "Levada das 25 Fontes before peak traffic.",
        afternoon: "Mercado tastings and coffee in a neighborhood square.",
        evening: "Small-venue poncha tasting.",
        estimatedCost: 85,
      },
    ],
    restaurants: [
      {
        name: "A Bica",
        neighborhood: "Funchal Old Town",
        cuisine: "Madeiran",
        priceRange: "$$",
        whyLocalPick: "Family-run, no tourist menu gimmicks, and consistently local regulars.",
      },
      {
        name: "Venda da Donna Maria",
        neighborhood: "Santo da Serra",
        cuisine: "Portuguese comfort",
        priceRange: "$",
        whyLocalPick: "Popular with local hikers on weekends.",
      },
    ],
    activities: [
      {
        name: "Ponta de São Lourenço sunrise hike",
        category: "Outdoors",
        estimatedCost: 0,
        crowdLevel: "low",
        whyItFits: "Strong views with lower early-hour foot traffic.",
        availability: "Open daily, best before 9:00.",
      },
      {
        name: "Mercado produce tasting",
        category: "Food & Culture",
        estimatedCost: 22,
        crowdLevel: "medium",
        whyItFits: "High local food density in one compact stop.",
        availability: "Best Tue-Sat mornings.",
      },
    ],
    packingSuggestions: [
      "Light layers for warm afternoons and cooler evenings",
      "Trail shoes with grip for wet stone paths",
      "Packable rain shell for occasional mountain drizzle",
    ],
    warnings: [
      "Steep roads may be uncomfortable for motion-sensitive travelers",
      "Levada trails can become crowded if starting after 10:00",
    ],
    alternativeDestinations: [
      {
        name: "Valencia",
        country: "Spain",
        reason: "Cheaper flights and excellent urban walkability with milder weather.",
        estimatedBudget: 1170,
      },
      {
        name: "Lisbon",
        country: "Portugal",
        reason: "Easier transit network and strong food scene but busier tourist core.",
        estimatedBudget: 1230,
      },
    ],
    weatherSummary: {
      outlook: "Warm with occasional short showers.",
      averageHighC: 24,
      averageLowC: 18,
      precipitationRisk: "Low to medium",
    },
    transportSummary: {
      localTransit: "Regional buses are reliable in daytime with limited late-night frequency.",
      airportTransfer: "Aerobus reaches Funchal in about 45 minutes.",
      walkability: "Central Funchal is walkable but some uphill segments are steep.",
    },
    travelTips: [
      "Start hikes before 8:30 to avoid both heat and tour-bus waves",
      "Carry small cash for village cafés and market stalls",
      "Reserve car rental early if your itinerary includes remote levada access",
    ],
    tripScore: 85,
    toolInsights: {
      flights: "Round-trip fares usually cluster around $440-$560 with faster options costing more.",
      hotels: "Mid-range local stays average around $95-$110 per night.",
      activities: "Most recommended activities stay in low to medium crowd bands before midday.",
      weather: "Average highs near 24°C and limited rain days support outdoor plans.",
      transportation: "Airport buses are predictable; village transit is less frequent at night.",
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
  if (name === "searchTransportation") {
    return searchTransportation({ query });
  }
  return searchWeather({ query, season });
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new PlannerError("TIMEOUT", "Planning timed out. Please try a shorter prompt."));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function safeToolCall(name: string, args: Record<string, unknown>) {
  try {
    return await runTool(name, args);
  } catch {
    return { error: `${name} unavailable` };
  }
}

function summarizeToolOutputs(toolResults: Record<string, unknown>) {
  return JSON.stringify(toolResults, null, 2);
}

function getErrorCodeFromStatus(status: number): PlannerErrorCode {
  if (status === 429) {
    return "RATE_LIMIT";
  }
  if (status === 408 || status === 504) {
    return "TIMEOUT";
  }
  return "UPSTREAM_ERROR";
}

export async function createTravelPlan({ prompt, origin }: PlanRequestBody) {
  const apiKey = process.env.GEMINI_API_KEY;
  const normalizedOrigin = origin?.trim() ? origin.trim() : "Canada";
  const provinceContext = await buildProvinceContext(prompt, normalizedOrigin);

  if (!apiKey) {
    throw new PlannerError("MISSING_API_KEY", "GEMINI_API_KEY is missing. Add it to run live planning.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const toolCallResponse = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `User request: ${prompt}. Origin: ${normalizedOrigin}. Decide which tools are required before planning.`,
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
                "searchTransportation",
              ],
            },
          },
        },
      }),
      12_000,
    );

    const functionCalls = toolCallResponse.functionCalls ?? [];
    const toolResults: Record<string, unknown> = {};

    for (const call of functionCalls) {
      const name = call.name ?? "searchWeather";
      const args = (call.args ?? {}) as Record<string, unknown>;
      toolResults[name] = await safeToolCall(name, args);
    }

    const defaults: Array<[string, Promise<unknown>]> = [
      ["searchFlights", safeToolCall("searchFlights", { query: prompt, origin: normalizedOrigin })],
      ["searchHotels", safeToolCall("searchHotels", { query: prompt })],
      ["searchActivities", safeToolCall("searchActivities", { query: prompt })],
      ["searchWeather", safeToolCall("searchWeather", { query: prompt })],
      ["searchTransportation", safeToolCall("searchTransportation", { query: prompt })],
    ];

    for (const [name, loader] of defaults) {
      if (!toolResults[name]) {
        toolResults[name] = await loader;
      }
    }

    const planResponse = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          `${LOCAL_LENS_SYSTEM_PROMPT}`,
          provinceContext,
          `User prompt: ${prompt}`,
          `Travel origin: ${normalizedOrigin}`,
          `Tool outputs (JSON):\n${summarizeToolOutputs(toolResults)}`,
          "Use tool numbers in reasoning and toolInsights. Return strict JSON only.",
        ].join("\n\n"),
        config: {
          responseMimeType: "application/json",
          temperature: 0.45,
        },
      }),
      15_000,
    );

    const parsed = parseTravelPlanFromText(planResponse.text ?? "");
    if (!parsed) {
      throw new PlannerError("INVALID_JSON", "Model returned malformed planning JSON.");
    }

    return parsed;
  } catch (error) {
    if (error instanceof PlannerError) {
      if (error.code === "INVALID_JSON") {
        return buildFallbackPlan(prompt, normalizedOrigin);
      }
      throw error;
    }

    if (error instanceof ApiError) {
      throw new PlannerError(getErrorCodeFromStatus(error.status), error.message, error.status);
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new PlannerError("UPSTREAM_ERROR", `Planning service failed: ${message}`);
  }
}
