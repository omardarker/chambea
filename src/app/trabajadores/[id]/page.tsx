"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getWorker } from "@/lib/data/workers";
import { WorkerProfile } from "@/components/app/WorkerProfile";

function Inner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const from = params.get("from");
  const worker = getWorker(id);
  if (!worker) return <p className="text-ink-3">Trabajador no encontrado.</p>;
  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => (from ? router.push(`/pedidos/${from}`) : router.back())} className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink">
        <ChevronLeft className="size-4" /> {from ? "Volver a las ofertas" : "Volver"}
      </button>
      <WorkerProfile worker={worker} viewer="cliente" />
    </div>
  );
}

export default function WorkerPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
