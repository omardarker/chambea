"use client";

import { useShallow } from "zustand/shallow";
import { useState } from "react";
import { useAppStore, selectWorkerJobs } from "@/lib/store";
import { getWorker } from "@/lib/data/workers";
import { JobCard } from "@/components/app/Cards";
import { Empty, PageTitle } from "@/components/ui/Misc";
import { Segmented } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { WorkerSwitch } from "@/components/app/WorkerSwitch";

export default function WorkerJobsPage() {
  const jobs = useAppStore(useShallow(selectWorkerJobs));
  const allJobs = useAppStore((s) => s.jobs);
  const worker = useAppStore((s) => getWorker(s.activeWorkerId));
  const [tab, setTab] = useState<"activos" | "ofertas" | "historial">("activos");
  if (!worker) return null;
  const active = jobs.filter((j) => ["asignado", "en_curso", "por_confirmar"].includes(j.status));
  const past = jobs.filter((j) => ["completado", "cancelado"].includes(j.status));
  const offered = allJobs.filter((j) => j.status === "abierto" && j.offers.some((o) => o.workerId === worker.id));
  const list = tab === "activos" ? active : tab === "ofertas" ? offered : past;

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle sub="Trabajos que te asignaron, ofertas que enviaste y tu historial.">Mis trabajos</PageTitle>
      <div className="mb-5"><WorkerSwitch /></div>
      <Segmented value={tab} onChange={setTab} options={[{ value: "activos", label: `Activos (${active.length})` }, { value: "ofertas", label: `Ofertas (${offered.length})` }, { value: "historial", label: `Historial (${past.length})` }]} className="mb-5 max-w-sm" />
      {list.length === 0 ? (
        <Empty title="Nada por aquí" text={tab === "activos" ? "Cuando un cliente te elija, el trabajo aparece aquí." : tab === "ofertas" ? "Oferta en un pedido abierto para verlo aquí." : "Tus trabajos terminados aparecerán aquí."} action={<Button href="/trabajador">Ver pedidos abiertos</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{list.map((j) => <JobCard key={j.id} job={j} perspective="trabajador" />)}</div>
      )}
    </div>
  );
}
