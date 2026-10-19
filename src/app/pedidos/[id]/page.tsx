"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, MapPin, Timer, CalendarDays, MessageCircle, ShieldCheck, CircleCheck, Heart, Camera } from "lucide-react";
import { useAppStore, selectJob } from "@/lib/store";
import { scheduleWorkerGreeting } from "@/lib/simulate";
import { getWorker } from "@/lib/data/workers";
import { getSubcategory } from "@/lib/data/categories";
import { soles, countdown, formatSchedule, relativeTime, plural } from "@/lib/format";
import type { Offer, PaymentMethod } from "@/lib/types";
import { Card, SectionTitle, Empty } from "@/components/ui/Misc";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Avatar } from "@/components/ui/Avatar";
import { Photo } from "@/components/ui/Photo";
import { OfferCard, statusLabel } from "@/components/app/Cards";
import { PaymentPicker } from "@/components/app/PaymentSheet";
import { Chat } from "@/components/app/Chat";
import { ReviewForm } from "@/components/app/ReviewForm";
import { cn } from "@/lib/cn";

const steps = ["Publicado", "Trabajador elegido", "En curso", "Terminado", "Confirmado"] as const;
function stepIndex(status: string) {
  return { abierto: 0, asignado: 1, en_curso: 2, por_confirmar: 3, completado: 4 }[status] ?? 0;
}

export default function JobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const job = useAppStore(selectJob(id));
  const chooseOffer = useAppStore((s) => s.chooseOffer);
  const confirmJob = useAppStore((s) => s.confirmJob);
  const cancelJob = useAppStore((s) => s.cancelJob);
  const toggleTrusted = useAppStore((s) => s.toggleTrusted);
  const trusted = useAppStore((s) => s.trusted);
  const notify = useAppStore((s) => s.notify);
  const [choosing, setChoosing] = useState<Offer | null>(null);
  const [reviewing, setReviewing] = useState(false);

  if (!job) return <p className="text-ink-3">Pedido no encontrado.</p>;
  const sub = getSubcategory(job.subcategoryId);
  const worker = job.workerId ? getWorker(job.workerId) : undefined;
  const st = statusLabel[job.status];
  const pending = job.offers.filter((o) => o.status === "pendiente").sort((a, b) => a.price - b.price);
  const chosen = job.offers.find((o) => o.status === "elegida");
  const closed = ["completado", "cancelado", "expirado"].includes(job.status);
  const idx = stepIndex(job.status);

  function confirmChoice(method: PaymentMethod) {
    if (!choosing) return;
    chooseOffer(job!.id, choosing.id, method);
    setChoosing(null);
    notify(`Elegiste a ${getWorker(choosing.workerId)?.name.split(" ")[0]}. Pago retenido.`);
    scheduleWorkerGreeting(job!.id);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => router.push("/pedidos")} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"><ChevronLeft className="size-4" /> Mis pedidos</button>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Chip tone={st.tone}>{st.label}</Chip>
          <Chip tone="outline">{sub.name}</Chip>
          {job.mode === "inmediato" ? <Chip tone="outline"><Timer className="size-3" /> Inmediato</Chip> : <Chip tone="outline"><CalendarDays className="size-3" /> {job.scheduledAt && formatSchedule(job.scheduledAt)}</Chip>}
          {job.source === "catalogo" && <Chip tone="blue">Del catálogo</Chip>}
        </div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{job.title}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {job.district} · {job.address}</span>
          <span>Publicado {relativeTime(job.createdAt)}</span>
        </div>
      </div>

      {!closed && (
        <ol className="mb-8 grid grid-cols-5 gap-1">
          {steps.map((s, i) => (
            <li key={s} className="text-center">
              <div className={cn("h-1.5 rounded-full", i <= idx ? "bg-navy-600" : "bg-mist-2")} />
              <div className={cn("mt-1.5 text-[11px] leading-tight", i <= idx ? "font-medium text-ink" : "text-ink-4")}>{s}</div>
            </li>
          ))}
        </ol>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          {job.status === "abierto" && (
            <section>
              <SectionTitle action={job.expiresAt && <span className="inline-flex items-center gap-1 text-sm text-ink-3"><Clock className="size-3.5" /> expira en {countdown(job.expiresAt)}</span>}>
                {pending.length ? plural(pending.length, "oferta", "ofertas") : "Ofertas"}
              </SectionTitle>
              {pending.length === 0 ? (
                <Card className="p-6 text-center">
                  <span className="relative mx-auto mb-3 block size-2.5 rounded-full bg-navy-600 text-navy-600 pulse-dot" />
                  <div className="font-medium">Tu pedido ya lo ven los trabajadores de {sub.name.toLowerCase()}</div>
                  <div className="mt-1 text-sm text-ink-3">Las ofertas aparecen aquí. Suelen llegar en los primeros minutos.</div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pending.map((o) => <OfferCard key={o.id} offer={o} job={job} onChoose={() => setChoosing(o)} />)}
                </div>
              )}
              <p className="mt-3 text-xs text-ink-3">Compara precio, calificación y perfil. Al elegir, pagas a Chambea y el dinero queda retenido hasta que confirmes el trabajo.</p>
            </section>
          )}

          {worker && job.status !== "abierto" && (
            <section>
              <SectionTitle>Trabajador</SectionTitle>
              <Card className="p-4">
                <Link href={`/trabajadores/${worker.id}`} className="flex items-center gap-3">
                  <Avatar name={worker.name} hue={worker.hue} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-medium">{worker.name}{worker.identityVerified && <ShieldCheck className="size-4 text-navy-600" strokeWidth={2} />}</div>
                    <div className="truncate text-sm text-ink-3">{worker.headline}</div>
                  </div>
                  <span className="text-sm font-medium text-ink-2">Ver perfil</span>
                </Link>
                {chosen && <p className="mt-3 rounded-xl bg-mist px-3.5 py-2.5 text-sm">{chosen.message}</p>}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { toggleTrusted(worker.id); notify(trusted.includes(worker.id) ? "Quitado de confianza" : "Guardado como trabajador de confianza"); }}
                    className={cn("inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-medium", trusted.includes(worker.id) ? "border-red-ink/20 bg-red-soft text-red-ink" : "border-line-2 hover:bg-mist")}
                  >
                    <Heart className={cn("size-4", trusted.includes(worker.id) && "fill-red-ink")} strokeWidth={trusted.includes(worker.id) ? 0 : 2} /> {trusted.includes(worker.id) ? "De confianza" : "Guardar"}
                  </button>
                  <a href="#chat" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-line-2 text-sm font-medium hover:bg-mist"><MessageCircle className="size-4" /> Chat</a>
                </div>
              </Card>
            </section>
          )}

          {job.status === "por_confirmar" && (
            <Card className="border-navy-600 bg-navy-50 p-5">
              <div className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 size-6 shrink-0 text-navy-700" />
                <div className="flex-1">
                  <div className="font-semibold">{worker?.name.split(" ")[0]} marcó el trabajo como terminado</div>
                  <p className="mt-1 text-sm text-ink-2">Revisa que todo esté bien. Al confirmar se libera el pago de {soles(job.agreedPrice ?? job.budget)}. Si algo no está bien, escríbele por el chat o abre una disputa.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => { confirmJob(job.id); notify("Pago liberado. ¡Gracias!"); setReviewing(true); }}>Confirmar y liberar pago</Button>
                    <Button variant="secondary" onClick={() => notify("En la demo las disputas no están implementadas", "info")}>Tengo un problema</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {job.status === "completado" && !job.clientReviewed && worker && (
            <Card className="p-5">
              <div className="font-semibold">¿Cómo te fue con {worker.name.split(" ")[0]}?</div>
              <p className="mt-1 text-sm text-ink-3">Califica para ayudar a otros clientes. {worker.name.split(" ")[0]} también te califica a ti.</p>
              <Button className="mt-3" onClick={() => setReviewing(true)}>Calificar</Button>
            </Card>
          )}

          <section>
            <SectionTitle>Detalle del pedido</SectionTitle>
            <Card className="p-4">
              <p className="text-[15px] leading-relaxed">{job.description}</p>
              {job.photoCount > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Array.from({ length: job.photoCount }).map((_, i) => <Photo key={i} tone={(i * 73 + 40) % 360} subcategoryId={job.subcategoryId} ratio="aspect-square" className="rounded-xl" />)}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Chip tone="neutral">{job.laborOnly ? "Solo mano de obra" : "Incluye materiales"}</Chip>
                {job.wantsVisit && <Chip tone="neutral">Acepta visita de diagnóstico</Chip>}
                {job.photoCount > 0 && <Chip tone="neutral"><Camera className="size-3" /> {plural(job.photoCount, "foto", "fotos")}</Chip>}
              </div>
            </Card>
          </section>

          {worker && job.status !== "abierto" && (
            <section id="chat">
              <SectionTitle>Chat con {worker.name.split(" ")[0]}</SectionTitle>
              <Card className="p-4">
                <Chat job={job} me="cliente" />
              </Card>
            </section>
          )}

          {job.offers.some((o) => o.status === "descartada") && (
            <section>
              <SectionTitle>Otras ofertas que recibiste</SectionTitle>
              <div className="space-y-3">{job.offers.filter((o) => o.status === "descartada").map((o) => <OfferCard key={o.id} offer={o} job={job} />)}</div>
            </section>
          )}

          {(job.status === "expirado" || job.status === "cancelado") && (
            <Empty title={job.status === "expirado" ? "Este pedido expiró sin que eligieras una oferta" : "Cancelaste este pedido"} action={<Button href={`/pedidos/nuevo?sub=${job.subcategoryId}`}>Publicar de nuevo</Button>} />
          )}
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <Card className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-3">{job.agreedPrice ? "Monto acordado" : "Tu precio"}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{soles(job.agreedPrice ?? job.budget)}</div>
            {job.payment && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className={cn("size-2 rounded-full", job.payment.status === "retenido" ? "bg-amber-ink" : "bg-navy-600")} />
                <span>{job.payment.status === "retenido" ? "Retenido por Chambea" : "Liberado al trabajador"} · {job.payment.method === "tarjeta" ? "Tarjeta" : job.payment.method === "yape" ? "Yape" : "Plin"}</span>
              </div>
            )}
            {!job.payment && job.status === "abierto" && <p className="mt-2 text-sm text-ink-3">Nada que pagar todavía. Pagas cuando elijas una oferta.</p>}
          </Card>
          {(job.status === "abierto" || job.status === "asignado") && (
            <Button variant="ghost" full onClick={() => { if (confirm("¿Cancelar este pedido?")) { cancelJob(job.id); notify("Pedido cancelado", "info"); } }}>Cancelar pedido</Button>
          )}
        </aside>
      </div>

      <Sheet open={!!choosing} onClose={() => setChoosing(null)} title="Elegir oferta y retener pago">
        {choosing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl bg-mist p-3.5">
              {(() => { const w = getWorker(choosing.workerId)!; return <><Avatar name={w.name} hue={w.hue} /><div className="flex-1"><div className="font-medium">{w.name}</div><div className="text-xs text-ink-3">{choosing.etaLabel}</div></div><div className="text-lg font-semibold tabular-nums">{soles(choosing.price)}</div></>; })()}
            </div>
            <PaymentPicker amount={choosing.price} onConfirm={confirmChoice} />
          </div>
        )}
      </Sheet>

      <Sheet open={reviewing} onClose={() => setReviewing(false)} title="Califica el trabajo">
        {worker && <ReviewForm job={job} from="cliente" toName={worker.name.split(" ")[0]} onDone={() => setReviewing(false)} />}
      </Sheet>
    </div>
  );
}
