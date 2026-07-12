interface ProgressProps {
  value: number;
}

export function Progress({ value }: ProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-slate-900 transition-all"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
