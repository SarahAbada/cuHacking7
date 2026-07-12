import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Reasoning } from "@/types/travel";

interface ReasoningCardProps {
  reasoning: Reasoning;
}

export function ReasoningCard({ reasoning }: ReasoningCardProps) {
  return (
    <Card>
      <CardTitle>Reasoning</CardTitle>
      <CardDescription className="mt-1">Why this destination was selected</CardDescription>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
        {reasoning.whyThisDestination.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-slate-700">{reasoning.localPerspective}</p>
      <div className="mt-4 space-y-1 text-sm text-slate-600">
        {reasoning.tradeoffs.map((tradeoff) => (
          <p key={tradeoff}>• {tradeoff}</p>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{reasoning.logistics}</p>
    </Card>
  );
}
