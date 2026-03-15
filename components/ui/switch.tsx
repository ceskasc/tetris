import { cn } from "@/utils/cn";

export function Switch({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
        checked
          ? "border-transparent bg-[linear-gradient(135deg,var(--primary),var(--secondary))]"
          : "border-white/10 bg-white/8",
      )}
    >
      <span
        className={cn(
          "ml-1 inline-block h-5 w-5 rounded-full bg-white transition",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
