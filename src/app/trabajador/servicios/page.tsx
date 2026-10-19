"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getWorker, servicesOf } from "@/lib/data/workers";
import { getSubcategory } from "@/lib/data/categories";
import { soles, unitLabel } from "@/lib/format";
import { Card, PageTitle } from "@/components/ui/Misc";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Field";
import { WorkerSwitch } from "@/components/app/WorkerSwitch";

export default function WorkerServicesPage() {
  const worker = useAppStore((s) => getWorker(s.activeWorkerId));
  const notify = useAppStore((s) => s.notify);
  const [paused, setPaused] = useState<string[]>([]);
  if (!worker) return null;
  const services = servicesOf(worker.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <PageTitle sub="Lo que los clientes ven en el catálogo con precio fijo. Puedes pausar un servicio sin borrarlo.">Mis servicios</PageTitle>
        <Button className="shrink-0" onClick={() => notify("En la demo los servicios son de ejemplo", "info")}><Plus className="size-4" /> Nuevo</Button>
      </div>
      <div className="mb-5"><WorkerSwitch /></div>
      <div className="space-y-3">
        {services.map((s) => {
          const off = paused.includes(s.id);
          return (
            <Card key={s.id} className={off ? "p-4 opacity-60" : "p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium leading-snug">{s.title}</div>
                  <div className="mt-1 text-sm text-ink-3">{s.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Chip tone="outline">{getSubcategory(s.subcategoryId).name}</Chip>
                    <Chip tone={s.includesMaterials ? "brand" : "neutral"}>{s.includesMaterials ? "Materiales incluidos" : "Solo mano de obra"}</Chip>
                    <Chip tone="neutral">{s.durationLabel}</Chip>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xl font-semibold tabular-nums tracking-tight">{soles(s.price)}</div>
                  <div className="text-xs text-ink-3">{unitLabel[s.unit]}</div>
                </div>
              </div>
              <div className="mt-2 border-t border-line">
                <Toggle checked={!off} onChange={(v) => setPaused((p) => (v ? p.filter((x) => x !== s.id) : [...p, s.id]))} label={off ? "Pausado" : "Visible en el catálogo"} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
