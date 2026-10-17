"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getWorker } from "@/lib/data/workers";
import { getSubcategory } from "@/lib/data/categories";
import { JobCard } from "@/components/app/Cards";
import { WorkerSwitch } from "@/components/app/WorkerSwitch";
import { Empty, Card, Stat } from "@/components/ui/Misc";
import { Toggle } from "@/components/ui/Field";
import { soles } from "@/lib/format";

export default function WorkerHomePage() {
  const worker = useAppStore((s) => getWorker(s.activeWorkerId));
  const jobs = useAppStore((s) => s.jobs);
  const [onlyZone, setOnlyZone] = useState(true);
  if (!worker) return null;

  const open = jobs
    .filter((j) => j.status === "abierto" && worker.subcategoryIds.includes(j.subcategoryId))
    .filter((j) => !onlyZone || worker.districts.includes(j.district))
    .sort((a, b) => (a.mode === b.mode ? b.createdAt.localeCompare(a.createdAt) : a.mode === "inmediato" ? -1 : 1));
  const mine = jobs.filter((j) => j.workerId === worker.id);
  const earned = mine.filter((j) => j.status === "completado" && j.payment?.status === "liberado").reduce((a, j) => a + (j.agreedPrice ?? 0) * 0.9, 0);
  const pendingOffers = open.filter((j) => j.offers.some((o) => o.workerId === worker.id)).length;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-leaf-700">Modo trabajador · demo</p>
        <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight sm:text-3xl">Hola, {worker.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[15px] text-ink-3">Pedidos abiertos en {worker.subcategoryIds.map((s) => getSubcategory(s).name.toLowerCase()).join(" y ")}.</p>
        <div className="mt-4">
          <WorkerSwitch />
        </div>
      </section>

      <Card className="grid grid-cols-3 divide-x divide-line p-4 text-center">
        <Stat value={open.length} label="pedidos para ti" />
        <Stat value={pendingOffers} label="ofertas enviadas" />
        <Stat value={soles(Math.round(earned))} label="ganado en la demo" />
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Pedidos abiertos</h2>
          <div className="w-56">
            <Toggle checked={onlyZone} onChange={setOnlyZone} label="Solo mi zona" />
          </div>
        </div>
        {open.length === 0 ? (
          <Empty title="No hay pedidos abiertos en tu categoría" text="Cambia a modo cliente y publica uno, o desactiva el filtro de zona." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {open.map((j) => <JobCard key={j.id} job={j} perspective="trabajador" />)}
          </div>
        )}
        <p className="mt-3 flex items-center gap-1 text-xs text-ink-3"><MapPin className="size-3" /> Tu zona: {worker.districts.slice(0, 6).join(", ")}{worker.districts.length > 6 ? ` y ${worker.districts.length - 6} más` : ""}.</p>
      </section>
    </div>
  );
}
