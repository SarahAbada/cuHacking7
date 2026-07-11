import { NextResponse } from "next/server";
import { createTravelPlan } from "@/services/geminiPlanner";
import type { PlanRequestBody } from "@/types/travel";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlanRequestBody;

    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const plan = await createTravelPlan({
      prompt: body.prompt.trim(),
      origin: body.origin,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
