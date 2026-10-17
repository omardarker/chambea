"use client";

import { useShallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useAppStore, selectClientJobs } from "@/lib/store";
import { getClient } from "@/lib/data/clients";
import { getWorker } from "@/lib/data/workers";
import { getSubcategory } from "@/lib/data/categories";
import { reviewsForClient } from "@/lib/data/reviews";
import { formatMonthYear, formatShort, plural } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Stars";
import { Card, SectionTitle, Stat } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";

export default function ClientProfilePage() {
  const router = useRouter();
  const client = useAppStore((s) => getClient(s.clientId));
  const jobs = useAppStore(useShallow(selectClientJobs));
  const reviews = useAppStore(useShallow((s) => (client ? reviewsForClient(client.id, s.reviews) : [])));
  const resetDemo = useAppStore((s) => s.resetDemo);
  if (!client) return null;
  const done = jobs.filter((j) => j.status === "completado").length;
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : client.rating;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="flex items-center gap-4">
        <Avatar name={client.name} hue={client.hue} size="xl" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-3">
            <Rating value={avg} count={reviews.length} size="md" />
            <span>· {client.district}</span>
          </div>
          <div className="text-sm text-ink-3">Cliente desde {formatMonthYear(client.memberSince).toLowerCase()}</div>
        </div>
      </section>

      <Card className="grid grid-cols-3 divide-x divide-line p-4 text-center">
        <Stat value={client.jobsHired + done} label="trabajos contratados" />
        <Stat value={avg.toFixed(1)} label="calificación de trabajadores" />
        <Stat value={reviews.length} label="reseñas recibidas" />
      </Card>

      <section>
        <p className="text-sm text-ink-2">Tu perfil como cliente es simple: nombre y foto. Pero los trabajadores también te califican, y esa calificación la ven otros trabajadores cuando ofertan en tus pedidos. Así saben con quién tratan.</p>
      </section>

      <section>
        <SectionTitle>Lo que dicen los trabajadores de ti</SectionTitle>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-3">Aún no tienes reseñas.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const w = getWorker(r.fromId);
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {w && <Avatar name={w.name} hue={w.hue} size="sm" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{w?.name ?? "Trabajador"}</div>
                      <div className="text-xs text-ink-3">{getSubcategory(r.subcategoryId).name} · {formatShort(r.date)}</div>
                    </div>
                    <Rating value={r.rating} />
                  </div>
                  <p className="mt-2.5 text-[15px] leading-relaxed">{r.text}</p>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-line-2 p-5">
        <div className="font-medium">Demo</div>
        <p className="mt-1 text-sm text-ink-3">Todo lo que haces se guarda en este navegador. {plural(jobs.length, "pedido", "pedidos")} en tu cuenta ahora. Puedes volver al estado inicial cuando quieras.</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => { if (confirm("¿Reiniciar la demo?")) { resetDemo(); router.push("/"); } }}><RotateCcw className="size-3.5" /> Reiniciar demo</Button>
      </section>
    </div>
  );
}
