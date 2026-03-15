import Link from "next/link";

import { modeDefinitions } from "@/data/modes";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SectionTitle } from "@/components/ui/section-title";

export default function ModesPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Mod Seçimi"
        title="İstediğin tempoyu seç"
        description="Her mod kendi ödül eğrisi, ritmi ve his hedefiyle tasarlandı. Kısa seans, uzun seans, zen akışı ya da rekabet; hepsi aynı premium yüzeyde hazır."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {modeDefinitions.map((mode) => (
          <Panel key={mode.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-soft">
                  {mode.tempoEtiketi}
                </p>
                <h2 className="mt-3 font-display text-4xl">{mode.ad}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{mode.aciklama}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted">
                x{mode.odulCarpani}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-soft">Vurgu</p>
                <p className="mt-3 text-sm leading-7 text-muted">{mode.vurgu}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-soft">Öne çıkanlar</p>
                <div className="mt-3 space-y-2 text-sm text-muted">
                  {mode.ozellikler.map((feature) => (
                    <p key={feature}>{feature}</p>
                  ))}
                </div>
              </div>
            </div>
            <Link href={`/oyun/${mode.id}`} className="mt-5 inline-flex">
              <Button>Bu modda başla</Button>
            </Link>
          </Panel>
        ))}
      </div>
    </div>
  );
}
