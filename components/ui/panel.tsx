import type { HTMLAttributes } from "react";

import { AmbientBackground } from "@/components/layout/ambient-background";
import { cn } from "@/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  compactAmbient?: boolean;
};

export function Panel({
  className,
  strong = false,
  compactAmbient = false,
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "premium-outline relative overflow-hidden rounded-[var(--radius-xl)]",
        strong ? "panel-surface-strong" : "panel-surface",
        className,
      )}
      {...props}
    >
      <AmbientBackground compact={compactAmbient} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
