import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--soft)] focus:border-[var(--secondary)] focus:bg-white/8",
        className,
      )}
      {...props}
    />
  );
}
