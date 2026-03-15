import { cn } from "@/utils/cn";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-3 overflow-hidden rounded-full border border-white/8 bg-white/6",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary),var(--tertiary))] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
