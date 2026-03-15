import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "shadow-glow bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-slate-950 hover:scale-[1.01]",
        ghost:
          "glass-pill text-[var(--text)] hover:bg-white/10",
        subtle:
          "rounded-2xl border border-white/10 bg-white/5 text-[var(--text)] hover:bg-white/10",
        danger:
          "rounded-2xl bg-[rgba(255,146,180,0.18)] text-[var(--text)] hover:bg-[rgba(255,146,180,0.28)]",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "px-5 py-3 text-sm",
        lg: "px-6 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, ...props }: Props) {
  return (
    <button className={cn(buttonStyles({ variant, size }), className)} {...props} />
  );
}
