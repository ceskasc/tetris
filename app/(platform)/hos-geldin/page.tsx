import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="İlk Kullanım"
        title="Hesabın hazır, şimdi dünyanı kişiselleştir"
        description="İlk adım olarak tema paketini seç, günlük ödülünü al ve sana en yakın ritimle ilk seansını başlat."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="p-6">
          <h2 className="font-display text-3xl">1. Tema seç</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Koyu ana görünüm veya ferah aydınlık yapı ile kişisel atmosferini kur.
          </p>
          <Link href="/tema-secici" className="mt-5 inline-flex">
            <Button variant="ghost">Tema seçiciye git</Button>
          </Link>
        </Panel>
        <Panel className="p-6">
          <h2 className="font-display text-3xl">2. Günlük ödülü al</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Serini başlat ve ilk vitrin parçanı güvenceye al.
          </p>
          <Link href="/gunluk-odul" className="mt-5 inline-flex">
            <Button variant="ghost">Günlük ödüle geç</Button>
          </Link>
        </Panel>
        <Panel className="p-6">
          <h2 className="font-display text-3xl">3. İlk seansı başlat</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Klasik modla temel ritmi kur ya da rahat modla yumuşak başlangıç yap.
          </p>
          <Link href="/modlar" className="mt-5 inline-flex">
            <Button>Mod seçimine geç</Button>
          </Link>
        </Panel>
      </div>
    </div>
  );
}
