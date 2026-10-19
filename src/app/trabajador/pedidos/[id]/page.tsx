"use client";

import { useShallow } from "zustand/shallow";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, MapPin, Timer, CalendarDays, Camera, CircleCheck, AlertCircle, Banknote } from "lucide-react";
import { useAppStore, selectJob } from "@/lib/store";
import { scheduleClientDecision, scheduleClientConfirmation } from "@/lib/simulate";
import { getWorker } from "@/lib/data/workers";
import { getClient } from "@/lib/data/clients";
import { getSubcategory } from "@/lib/data/categories";
import { reviewsForClient } from "@/lib/data/reviews";
import { soles, countdown, formatSchedule, relativeTime, plural, formatMonthYear } from "@/lib/format";
import { Card, SectionTitle } from "@/components/ui/Misc";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Stars";
import { Photo } from "@/components/ui/Photo";
import { MoneyInput, Segmented, Textarea, Label } from "@/components/ui/Field";
import { statusLabel } from "@/components/app/Cards";
import { Chat, AdjustQuote } from "@/components/app/Chat";
import { ReviewForm } from "@/components/app/ReviewForm";
import { cn } from "@/lib/cn";

export default function WorkerJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const job = useAppStore(selectJob(id));
  const worker = useAppStore((s) => getWorker(s.activeWorkerId));
  const clientReviews = useAppStore(useShallow((s) => (job ? reviewsForClient(job.clientId, s.reviews) : [])));
  const addOffer = useAppStore((s) => s.addOffer);
  const startJob = useAppStore((s) => s.startJob);
  const finishJob = useAppStore((s) => s.finishJob);
  const notify = useAppStore((s) => s.notify);

  const [kind, setKind] = useState<"acepta" | "contraoferta">("acepta");
  const [price, setPrice] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [eta, setEta] = useState("30 min");
  const [adjusting, setAdjusting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  if (!job || !worker) return <p className="text-ink-3">Pedido no encontrado.</p>;
  const client = getClient(job.clientId);
  const sub = getSubcategory(job.subcategoryId);
  const st = statusLabel[job.status];
  const myOffer = job.offers.find((o) => o.workerId === worker.id);
  const isMine = job.workerId === worker.id;
  const lostToOther = job.status !== "abierto" && !isMine;
  const offerPrice = kind === "acepta" ? job.budget : price;
  const canOffer = job.status === "abierto" && !myOffer && (kind === "acepta" || (price !== "" && price > job.budget)) && message.trim().length >= 10;
  const clientAvg = clientReviews.length ? clientReviews.reduce((a, r) => a + r.rating, 0) / clientReviews.length : client?.rating ?? 0;

  function sendOffer() {
    if (!canOffer) return;
    const offerId = addOffer(job!.id, { workerId: worker!.id, kind, price: Number(offerPrice), message: message.trim(), etaLabel: job!.mode === "inmediato" ? eta : "en la fecha propuesta" });
    notify(kind === "acepta" ? "Aceptaste el precio. Espera a que el cliente elija." : "Contraoferta enviada.");
    scheduleClientDecision(job!.id, offerId);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"><ChevronLeft className="size-4" /> Volver</button>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Chip tone={st.tone}>{st.label}</Chip>
          <Chip tone="outline">{sub.name}</Chip>
          {job.mode === "inmediato" ? <Chip tone="outline"><Timer className="size-3" /> Inmediato</Chip> : <Chip tone="outline"><CalendarDays className="size-3" /> {job.scheduledAt && formatSchedule(job.scheduledAt)}</Chip>}
        </div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{job.title}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {job.district}{isMine ? ` · ${job.address}` : " · dirección exacta al ser elegido"}</span>
          <span>Publicado {relativeTime(job.createdAt)}</span>
          {job.status === "abierto" && job.expiresAt && <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> expira en {countdown(job.expiresAt)}</span>}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <section>
            <Card className="p-4">
              <p className="text-[15px] leading-relaxed">{job.description}</p>
              {job.photoCount > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Array.from({ length: job.photoCount }).map((_, i) => <Photo key={i} tone={(i * 73 + 40) % 360} subcategoryId={job.subcategoryId} ratio="aspect-square" className="rounded-xl" />)}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Chip tone="neutral">{job.laborOnly ? "Solo mano de obra" : "Pide precio con materiales"}</Chip>
                {job.wantsVisit && <Chip tone="brand">Acepta visita de diagnóstico</Chip>}
                {job.photoCount > 0 && <Chip tone="neutral"><Camera className="size-3" /> {plural(job.photoCount, "foto", "fotos")}</Chip>}
                {job.offers.length > 0 && <Chip tone="amber">{plural(job.offers.length, "oferta ya enviada", "ofertas ya enviadas")}</Chip>}
              </div>
            </Card>
          </section>

          {job.status === "abierto" && !myOffer && (
            <section>
              <SectionTitle>Tu oferta</SectionTitle>
              <Card className="space-y-5 p-5">
                <Segmented value={kind} onChange={setKind} options={[{ value: "acepta", label: `Aceptar ${soles(job.budget)}` }, { value: "contraoferta", label: "Contraofertar" }]} />
                {kind === "contraoferta" && (
                  <div>
                    <Label hint={`el cliente ofrece ${soles(job.budget)}`}>Tu precio</Label>
                    <MoneyInput value={price} onChange={setPrice} placeholder={String(Math.round(job.budget * 1.25))} />
                    {price !== "" && price <= job.budget && <p className="mt-1 text-xs text-red-ink">Una contraoferta tiene que ser mayor al precio del cliente. Si estás de acuerdo con su precio, acéptalo.</p>}
                  </div>
                )}
                {job.mode === "inmediato" && (
                  <div>
                    <Label>¿En cuánto llegas?</Label>
                    <div className="flex flex-wrap gap-2">
                      {["20 min", "30 min", "45 min", "1 hora", "2 horas"].map((e) => (
                        <button key={e} onClick={() => setEta(e)} className={cn("h-9 rounded-full border px-3.5 text-sm font-medium", eta === e ? "border-ink bg-ink text-white" : "border-line-2")}>{e}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label hint="mín. 10 caracteres">Mensaje al cliente</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={kind === "acepta" ? "Ej.: Estoy cerca, llevo repuestos comunes. Si veo algo distinto a las fotos te aviso antes de empezar." : "Ej.: Por las fotos hay que cambiar la trampa completa, por eso el precio incluye el repuesto."} className="min-h-24" />
                </div>
                <Button full size="lg" disabled={!canOffer} onClick={sendOffer}>
                  {kind === "acepta" ? `Aceptar por ${soles(job.budget)}` : price ? `Enviar contraoferta de ${soles(Number(price))}` : "Enviar contraoferta"}
                </Button>
                <p className="text-center text-xs text-ink-3">El cliente ve tu oferta junto a tu perfil, calificación y trabajos anteriores.</p>
              </Card>
            </section>
          )}

          {myOffer && job.status === "abierto" && (
            <Card className="flex items-start gap-3 p-5">
              <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full bg-amber-ink text-amber-ink pulse-dot" />
              <div>
                <div className="font-semibold">Oferta enviada: {soles(myOffer.price)} {myOffer.kind === "acepta" ? "(aceptaste el precio)" : "(contraoferta)"}</div>
                <p className="mt-1 text-sm text-ink-3">El cliente está comparando ofertas. Te avisamos cuando decida.</p>
                <p className="mt-2 rounded-xl bg-mist px-3 py-2 text-sm">{myOffer.message}</p>
              </div>
            </Card>
          )}

          {lostToOther && (
            <Card className="flex items-start gap-3 p-5">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-ink-3" />
              <div>
                <div className="font-semibold">{job.status === "expirado" ? "Este pedido expiró" : job.status === "cancelado" ? "El cliente canceló el pedido" : "El cliente eligió a otro trabajador"}</div>
                {myOffer && <p className="mt-1 text-sm text-ink-3">Tu oferta fue de {soles(myOffer.price)}.</p>}
              </div>
            </Card>
          )}

          {isMine && (job.status === "asignado" || job.status === "en_curso") && (
            <Card className="border-navy-600 bg-navy-50 p-5">
              <div className="font-semibold">{job.status === "asignado" ? "Te eligieron. Coordina por chat y marca cuando empieces." : "Trabajo en curso"}</div>
              <p className="mt-1 text-sm text-ink-2">El pago de {soles(job.agreedPrice ?? 0)} ya está retenido por Chambea. Se libera cuando el cliente confirme. Si en sitio ves algo distinto a lo descrito, propón un ajuste antes de seguir.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.status === "asignado" ? (
                  <Button onClick={() => { startJob(job.id); notify("Marcaste el trabajo como iniciado"); }}>Empezar trabajo</Button>
                ) : (
                  <Button onClick={() => { finishJob(job.id); notify("Esperando confirmación del cliente"); scheduleClientConfirmation(job.id); }}><CircleCheck className="size-4" /> Marcar como terminado</Button>
                )}
                <Button variant="secondary" onClick={() => setAdjusting(true)}><Banknote className="size-4" /> Ajustar cotización</Button>
              </div>
            </Card>
          )}

          {isMine && job.status === "por_confirmar" && (
            <Card className="flex items-start gap-3 p-5">
              <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full bg-amber-ink text-amber-ink pulse-dot" />
              <div>
                <div className="font-semibold">Esperando que el cliente confirme</div>
                <p className="mt-1 text-sm text-ink-3">Cuando confirme, {soles(Math.round((job.agreedPrice ?? 0) * 0.9))} pasan a tu saldo (precio menos 10 % de comisión).</p>
              </div>
            </Card>
          )}

          {isMine && job.status === "completado" && (
            <Card className="p-5">
              <div className="flex items-center gap-2 font-semibold"><CircleCheck className="size-5 text-navy-700" /> Trabajo confirmado. Recibiste {soles(Math.round((job.agreedPrice ?? 0) * 0.9))}.</div>
              {!job.workerReviewed && (
                <>
                  <p className="mt-1 text-sm text-ink-3">Califica a {client?.name.split(" ")[0]}: otros trabajadores verán cómo es tratar con este cliente.</p>
                  <Button className="mt-3" onClick={() => setReviewing(true)}>Calificar cliente</Button>
                </>
              )}
            </Card>
          )}

          {isMine && (
            <section>
              <SectionTitle>Chat con {client?.name.split(" ")[0]}</SectionTitle>
              <Card className="p-4"><Chat job={job} me="trabajador" /></Card>
            </section>
          )}
        </div>

        <aside className="space-y-4 md:sticky md:top-20 md:self-start">
          <Card className="p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-ink-3">{job.agreedPrice ? "Monto acordado" : "El cliente ofrece"}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{soles(job.agreedPrice ?? job.budget)}</div>
            <div className="mt-1 text-xs text-ink-3">{job.laborOnly ? "Solo mano de obra" : "Con materiales"} · comisión 10 %</div>
          </Card>
          {client && (
            <Card className="p-4">
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-3">Cliente</div>
              <div className="flex items-center gap-3">
                <Avatar name={client.name} hue={client.hue} />
                <div className="min-w-0">
                  <div className="font-medium">{client.name}</div>
                  <Rating value={clientAvg} count={clientReviews.length} />
                </div>
              </div>
              <div className="mt-3 text-xs text-ink-3">{client.jobsHired} trabajos contratados · desde {formatMonthYear(client.memberSince).toLowerCase()}</div>
              {clientReviews.slice(0, 2).map((r) => (
                <p key={r.id} className="mt-2 rounded-xl bg-mist px-3 py-2 text-xs leading-relaxed text-ink-2">“{r.text}” <span className="text-ink-3">· {getWorker(r.fromId)?.name.split(" ")[0]}</span></p>
              ))}
            </Card>
          )}
        </aside>
      </div>

      <Sheet open={adjusting} onClose={() => setAdjusting(false)} title="Ajustar cotización en sitio">
        <AdjustQuote job={job} onDone={() => { setAdjusting(false); notify("Ajuste enviado al cliente", "info"); }} />
      </Sheet>
      <Sheet open={reviewing} onClose={() => setReviewing(false)} title="Califica al cliente">
        {client && <ReviewForm job={job} from="trabajador" toName={client.name.split(" ")[0]} onDone={() => setReviewing(false)} />}
      </Sheet>
    </div>
  );
}
