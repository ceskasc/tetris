import Link from "next/link";

import { mainNavigation } from "@/constants/navigation";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/utils/cn";

export function SideNav({ currentPath }: { currentPath: string }) {
  return (
    <Panel className="sticky top-6 hidden h-fit w-[280px] shrink-0 p-4 xl:block">
      <div className="mb-8 px-3 pt-2">
        <p className="font-display text-3xl">Lunara</p>
        <p className="mt-2 text-sm text-muted">
          Zarif ritim, berrak kontrol ve uzun ömürlü rekabet için tasarlanmış oyun merkezi.
        </p>
      </div>

      <nav className="space-y-2">
        {mainNavigation.map((item) => {
          const active = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-3xl border px-4 py-4 transition duration-300",
                active
                  ? "border-white/16 bg-white/10"
                  : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/6",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-soft">{item.kisaltma}</span>
                <span className="text-sm font-semibold">{item.etiket}</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted">{item.aciklama}</p>
            </Link>
          );
        })}
      </nav>
    </Panel>
  );
}
