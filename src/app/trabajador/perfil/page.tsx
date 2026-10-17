"use client";

import { useAppStore } from "@/lib/store";
import { getWorker } from "@/lib/data/workers";
import { WorkerProfile } from "@/components/app/WorkerProfile";
import { WorkerSwitch } from "@/components/app/WorkerSwitch";
import { PageTitle } from "@/components/ui/Misc";

export default function WorkerProfilePage() {
  const worker = useAppStore((s) => getWorker(s.activeWorkerId));
  if (!worker) return null;
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle sub="Así te ven los clientes cuando comparan ofertas. Lo verificado por Chambea se distingue de lo que declaras tú.">Mi perfil</PageTitle>
      <div className="mb-8"><WorkerSwitch /></div>
      <WorkerProfile worker={worker} viewer="self" />
    </div>
  );
}
