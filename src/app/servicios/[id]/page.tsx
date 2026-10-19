"use client";

import { useShallow } from "zustand/shallow";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Clock, Check, ShieldCheck, Minus, Plus } from "lucide-react";
import { getService, getWorker, servicesOf } from "@/lib/data/workers";
import { getSubcategory } from "@/lib/data/categories";
import { districts } from "@/lib/data/districts";
import { getClient } from "@/lib/data/clients";
import { useAppStore, workerRating } from "@/lib/store";
import { scheduleWorkerGreeting } from "@/lib/simulate";
import { soles, unitLabel, unitShort } from "@/lib/format";
import type { JobMode, PaymentMethod } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Stars";
import { Chip } from "@/components/ui/Chip";
import { Card, SectionTitle } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Input, Label, Segmented, Select, Textarea } from "@/components/ui/Field";
import { PaymentPicker } from "@/components/app/PaymentSheet";
import { Photo } from "@/components/ui/Photo";

function defaultSchedule(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const service = getService(id);
  const worker = service ? getWorker(service.workerId) : undefined;
  const rating = useAppStore(useShallow((s) => (worker ? workerRating(s, worker.id, worker) : { rating: 0, reviewCount: 0 })));
  const client = useAppStore((s) => getClient(s.clientId));
  const hireService = useAppStore((s) => s.hireService);
  const notify = useAppStore((s) => s.notify);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"detalles" | "pago">("detalles");
  const [mode, setMode] = useState<JobMode>("programado");
  const [when, setWhen] = useState(defaultSchedule());
  const [district, setDistrict] = useState(client?.district ?? "Miraflores");
  const [address, setAddress] = useState("Av. La Paz 1030, dpto. 402");
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  if (!service || !worker) {
    return <p className="text-ink-3">Servicio no encontrado.</p>;
  }
  const sub = getSubcategory(service.subcategoryId);
  const perUnit = service.unit !== "servicio";
  const total = service.price * qty;
  const others = servicesOf(worker.id).filter((s) => s.id !== service.id);

  function confirm(method: PaymentMethod) {
    const jobId = hireService({
      serviceId: service!.id,
      mode,
      scheduledAt: mode === "programado" ? new Date(when).toISOString() : undefined,
      district,
      address,
      notes: notes.trim() || `Contratación directa: ${service!.title}`,
      method,
      quantity: qty,
    });
    setOpen(false);
    notify("Contratado. El pago queda retenido hasta que confirmes.");
    scheduleWorkerGreeting(jobId);
    router.push(`/pedidos/${jobId}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"><ChevronLeft className="size-4" /> Volver</button>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div>
            <Chip tone="outline">{sub.name}</Chip>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight">{service.title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{service.description || "El trabajador no agregó una descripción."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip tone={service.includesMaterials ? "brand" : "neutral"}><Check className="size-3" /> {service.includesMaterials ? "Materiales incluidos" : "Solo mano de obra, materiales con boleta"}</Chip>
              <Chip tone="outline"><Clock className="size-3" /> {service.durationLabel}</Chip>
              <Chip tone="outline">Precio {unitLabel[service.unit]}</Chip>
            </div>
          </div>

          <Card className="p-4">
            <Link href={`/trabajadores/${worker.id}`} className="flex items-center gap-3">
              <Avatar name={worker.name} hue={worker.hue} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {worker.name}
                  {worker.identityVerified && <ShieldCheck className="size-4 text-navy-600" strokeWidth={2} />}
                </div>
                <div className="truncate text-sm text-ink-3">{worker.headline}</div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Rating value={rating.rating} count={rating.reviewCount} />
                  <span className="text-ink-3">· {worker.jobsDone} trabajos</span>
                </div>
              </div>
              <span className="text-sm font-medium text-ink-2">Ver perfil</span>
            </Link>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {worker.portfolio.slice(0, 3).map((p) => (
                <Photo key={p.id} tone={p.tone} subcategoryId={p.subcategoryId} ratio="aspect-square" className="rounded-xl" />
              ))}
            </div>
          </Card>

          <div>
            <SectionTitle>Cómo funciona</SectionTitle>
            <ol className="space-y-3 text-[15px]">
              {[
                ["Agendas", "Eliges si lo necesitas ahora o en una fecha. El trabajador confirma por chat."],
                ["Pagas a Chambea", "Con Yape, Plin o tarjeta. El dinero queda retenido, no va directo al trabajador."],
                ["Confirmas", "Cuando el trabajo termina y estás conforme, liberas el pago. Si algo cambia en sitio, el trabajador propone un ajuste y tú apruebas."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{i + 1}</span>
                  <span><span className="font-medium">{t}.</span> <span className="text-ink-2">{d}</span></span>
                </li>
              ))}
            </ol>
          </div>

          {others.length > 0 && (
            <div>
              <SectionTitle>Más de {worker.name.split(" ")[0]}</SectionTitle>
              <Card className="divide-y divide-line">
                {others.map((s) => (
                  <Link key={s.id} href={`/servicios/${s.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-mist">
                    <span className="font-medium">{s.title}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{soles(s.price)}<span className="text-xs font-medium text-ink-3">{unitShort(s.unit)}</span></span>
                  </Link>
                ))}
              </Card>
            </div>
          )}
        </div>

        <aside className="md:sticky md:top-20 md:self-start">
          <Card className="p-5">
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {soles(service.price)}
              <span className="text-sm font-medium text-ink-3"> {unitLabel[service.unit]}</span>
            </div>
            <p className="mt-1 text-sm text-ink-3">Responde en ~{worker.responseMinutes} min · {worker.offersVisit ? (worker.visitFee ? `visita de diagnóstico ${soles(worker.visitFee)}, descontable` : "visita de diagnóstico gratis") : "sin visita previa"}</p>
            <Button full size="lg" className="mt-5" onClick={() => { setStep("detalles"); setOpen(true); }}>Contratar</Button>
            <p className="mt-3 text-center text-xs text-ink-3">No pagas hasta confirmar. Garantía en trabajos pagados por la app.</p>
          </Card>
        </aside>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={step === "detalles" ? "Contratar servicio" : "Pago retenido"}>
        {step === "detalles" ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-mist p-4">
              <div className="font-medium">{service.title}</div>
              <div className="text-sm text-ink-3">con {worker.name}</div>
            </div>
            <div>
              <Label>¿Cuándo?</Label>
              <Segmented value={mode} onChange={setMode} options={[{ value: "inmediato", label: "Lo antes posible" }, { value: "programado", label: "Programar" }]} />
              {mode === "programado" ? (
                <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-2" />
              ) : (
                <p className="mt-2 text-sm text-ink-3">El trabajador te confirma por chat en cuánto llega.</p>
              )}
            </div>
            {perUnit && (
              <div>
                <Label hint={unitLabel[service.unit]}>Cantidad</Label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center rounded-full border border-line-2" aria-label="Menos"><Minus className="size-4" /></button>
                  <span className="w-12 text-center text-xl font-semibold tabular-nums">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="grid size-11 place-items-center rounded-full border border-line-2" aria-label="Más"><Plus className="size-4" /></button>
                  <span className="ml-auto text-lg font-semibold tabular-nums">{soles(total)}</span>
                </div>
              </div>
            )}
            <div>
              <Label>Distrito</Label>
              <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                {districts.map((d) => <option key={d} value={d} disabled={!worker.districts.includes(d)}>{d}{!worker.districts.includes(d) ? " (fuera de su zona)" : ""}</option>)}
              </Select>
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, departamento" />
              <p className="mt-1 text-xs text-ink-3">El trabajador la ve solo después de que confirmes el pago.</p>
            </div>
            <div>
              <Label hint="opcional">Indicaciones</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej.: pared de drywall, el rack ya está comprado." className="min-h-20" />
            </div>
            <Button full size="lg" onClick={() => setStep("pago")} disabled={!address.trim()}>Continuar · {soles(total)}</Button>
          </div>
        ) : (
          <PaymentPicker amount={total} onConfirm={confirm} />
        )}
      </Sheet>
    </div>
  );
}
