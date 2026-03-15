import type { InputHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--soft)] focus:border-[var(--secondary)] focus:bg-white/8",
        className,
      )}
      {...props}
    />
  );
}
