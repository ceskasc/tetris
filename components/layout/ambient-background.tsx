import { cn } from "@/utils/cn";

export function AmbientBackground({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -left-24 top-[-120px] rounded-full blur-3xl",
          compact ? "h-44 w-44" : "h-72 w-72",
        )}
        style={{ background: "rgba(141,123,255,0.22)" }}
      />
      <div
        className={cn(
          "absolute right-[-40px] top-10 rounded-full blur-3xl",
          compact ? "h-36 w-36" : "h-64 w-64",
        )}
        style={{ background: "rgba(255,179,226,0.18)" }}
      />
      <div className="ambient-grid absolute inset-0 opacity-20" />
    </div>
  );
}
