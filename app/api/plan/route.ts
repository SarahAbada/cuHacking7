import { NextResponse } from "next/server";
import { createTravelPlan, PlannerError } from "@/services/geminiPlanner";
import type { PlanApiResponse, PlanRequestBody } from "@/types/travel";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
};

function errorResponse(
  error: string,
  code: PlanApiResponse["code"],
  status: number,
) {
  return NextResponse.json(
    { error, code } satisfies PlanApiResponse,
    { status, headers: JSON_HEADERS },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlanRequestBody;

    if (!body.prompt || !body.prompt.trim()) {
      return errorResponse("Please share your trip constraints to get started.", "BAD_REQUEST", 400);
    }

    const plan = await createTravelPlan({
      prompt: body.prompt.trim(),
      origin: body.origin,
    });

    return NextResponse.json({ plan } satisfies PlanApiResponse, { headers: JSON_HEADERS });
  } catch (error) {
    if (error instanceof PlannerError) {
      if (error.code === "TIMEOUT") {
        return errorResponse("The planner timed out. Please simplify the request and try again.", "TIMEOUT", 504);
      }
      if (error.code === "RATE_LIMIT") {
        return errorResponse("The AI planner is rate limited right now. Please retry shortly.", "RATE_LIMIT", 429);
      }
      if (error.code === "MISSING_API_KEY") {
        return errorResponse("Gemini API key is not configured on this deployment.", "MISSING_API_KEY", 503);
      }
      if (error.code === "INVALID_JSON") {
        return errorResponse("The model response was invalid and could not be parsed.", "INVALID_JSON", 502);
      }
      return errorResponse("The AI planner encountered an upstream issue.", error.code, 502);
    }

    return errorResponse("Unexpected planner failure. Please try again.", "UNKNOWN_ERROR", 500);
  }
}
