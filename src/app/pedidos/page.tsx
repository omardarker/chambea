"use client";

import { useShallow } from "zustand/shallow";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAppStore, selectClientJobs } from "@/lib/store";
import { JobCard } from "@/components/app/Cards";
import { Empty, PageTitle } from "@/components/ui/Misc";
import { Segmented } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function JobsPage() {
  const jobs = useAppStore(useShallow(selectClientJobs));
  const [tab, setTab] = useState<"activos" | "historial">("activos");
  const active = jobs.filter((j) => ["abierto", "asignado", "en_curso", "por_confirmar"].includes(j.status));
  const past = jobs.filter((j) => !active.includes(j));
  const list = tab === "activos" ? active : past;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <PageTitle sub="Pedidos con contraoferta y servicios contratados del catálogo.">Mis pedidos</PageTitle>
        <Button href="/pedidos/nuevo" className="shrink-0"><Plus className="size-4" /> Nuevo</Button>
      </div>
      <Segmented value={tab} onChange={setTab} options={[{ value: "activos", label: `Activos (${active.length})` }, { value: "historial", label: `Historial (${past.length})` }]} className="mb-5 max-w-xs" />
      {list.length === 0 ? (
        <Empty title={tab === "activos" ? "No tienes pedidos activos" : "Sin historial todavía"} text="Publica un pedido con tu precio o contrata un servicio del catálogo." action={<Button href="/pedidos/nuevo">Publicar pedido</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((j) => <JobCard key={j.id} job={j} perspective="cliente" />)}
        </div>
      )}
    </div>
  );
}
