interface ProgressBarProps {
  label: string;
  value: number;
  target: number;
}

export function ProgressBar({ label, value, target }: ProgressBarProps) {
  const ratio = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <p>{label}</p>
        <p>
          {value.toFixed(0)} / {target}
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-white border border-line">
        <div className="h-full bg-black transition-all" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}
