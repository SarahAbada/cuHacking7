import { NextResponse } from "next/server";
import { createTravelPlan, PlannerError } from "@/services/geminiPlanner";
import type { PlanApiResponse, PlanRequestBody } from "@/types/travel";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
};

function getStatusForCode(code: PlanApiResponse["code"]) {
  if (code === "BAD_REQUEST") {
    return 400;
  }
  if (code === "INVALID_JSON") {
    return 502;
  }
  if (code === "MISSING_API_KEY") {
    return 503;
  }
  if (code === "TIMEOUT") {
    return 504;
  }
  if (code === "RATE_LIMIT") {
    return 429;
  }
  if (code === "UPSTREAM_ERROR") {
    return 502;
  }
  return 500;
}

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

function logPlannerError(error: unknown) {
  if (error instanceof PlannerError) {
    console.error("Travel planner failed", {
      code: error.code,
      status: error.status,
      message: error.message,
      stack: error.stack,
    });
    return;
  }

  if (error instanceof Error) {
    console.error("Travel planner failed", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return;
  }

  console.error("Travel planner failed", error);
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
    logPlannerError(error);

    if (error instanceof PlannerError) {
      return errorResponse(error.message, error.code, error.status ?? getStatusForCode(error.code));
    }

    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message || "Unexpected planner failure.", "UNKNOWN_ERROR", 500);
  }
}
