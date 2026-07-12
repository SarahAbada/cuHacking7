import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Budget } from "@/types/travel";

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const parts = Object.entries(budget.breakdown);
  return (
    <Card>
      <CardTitle>Budget estimate</CardTitle>
      <CardDescription className="mt-1">
        {budget.currency} {budget.totalEstimate.toLocaleString()}
      </CardDescription>
      <div className="mt-4 space-y-4">
        {parts.map(([label, amount]) => {
          const percentage = budget.totalEstimate ? (amount / budget.totalEstimate) * 100 : 0;
          return (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm text-slate-700">
                <span className="capitalize">{label}</span>
                <span>
                  {budget.currency} {amount.toLocaleString()}
                </span>
              </div>
              <Progress value={percentage} />
            </div>
          );
        })}
      </div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
        {budget.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Card>
  );
}
