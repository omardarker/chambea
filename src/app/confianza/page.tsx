"use client";

import { useAppStore } from "@/lib/store";
import { getWorker } from "@/lib/data/workers";
import { WorkerRow } from "@/components/app/Cards";
import { Card, Empty, PageTitle } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";

export default function TrustedPage() {
  const trusted = useAppStore((s) => s.trusted);
  const toggle = useAppStore((s) => s.toggleTrusted);
  const list = trusted.map(getWorker).filter(Boolean);
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle sub="Los que ya te hicieron un buen trabajo. Recontratar es un toque, sin volver a buscar.">Trabajadores de confianza</PageTitle>
      {list.length === 0 ? (
        <Empty title="Todavía no guardas a nadie" text="Desde el perfil de un trabajador o al terminar un trabajo puedes guardarlo aquí." action={<Button href="/buscar">Explorar catálogo</Button>} />
      ) : (
        <Card className="divide-y divide-line">
          {list.map((w) => (
            <div key={w!.id} className="p-4">
              <WorkerRow
                worker={w!}
                href={`/trabajadores/${w!.id}`}
                right={
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toggle(w!.id)}>Quitar</Button>
                    <Button size="sm" variant="secondary" href={`/trabajadores/${w!.id}`}>Recontratar</Button>
                  </div>
                }
              />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
