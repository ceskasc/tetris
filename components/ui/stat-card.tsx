import { Panel } from "@/components/ui/panel";
import { formatNumber } from "@/utils/format";

export function StatCard({
  etiket,
  deger,
  aciklama,
}: {
  etiket: string;
  deger: number | string;
  aciklama: string;
}) {
  return (
    <Panel compactAmbient className="p-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.26em] text-soft">{etiket}</p>
        <p className="font-display text-3xl text-[var(--text)]">
          {typeof deger === "number" ? formatNumber(deger) : deger}
        </p>
        <p className="text-sm text-muted">{aciklama}</p>
      </div>
    </Panel>
  );
}
