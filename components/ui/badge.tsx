import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}) {
  const palette = {
    default: "bg-white/6 text-[var(--muted)] border-white/10",
    success: "bg-[rgba(134,240,192,0.12)] text-[var(--success)] border-[rgba(134,240,192,0.18)]",
    warning: "bg-[rgba(255,201,150,0.12)] text-[var(--warning)] border-[rgba(255,201,150,0.18)]",
    danger: "bg-[rgba(255,146,180,0.12)] text-[var(--danger)] border-[rgba(255,146,180,0.18)]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        palette[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
