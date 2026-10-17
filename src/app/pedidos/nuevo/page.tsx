"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, ChevronLeft, Info, Timer, CalendarDays, X } from "lucide-react";
import { categories, getSubcategory } from "@/lib/data/categories";
import { districts } from "@/lib/data/districts";
import { services, workersFor } from "@/lib/data/workers";
import { getClient } from "@/lib/data/clients";
import { useAppStore } from "@/lib/store";
import { scheduleFakeOffers } from "@/lib/simulate";
import { rangeLabel, plural } from "@/lib/format";
import type { JobMode } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label, MoneyInput, Select, Textarea, Toggle } from "@/components/ui/Field";
import { Card, PageTitle } from "@/components/ui/Misc";
import { Photo, SubIcon } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";

function defaultSchedule(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const client = useAppStore((s) => getClient(s.clientId));
  const createJob = useAppStore((s) => s.createJob);
  const notify = useAppStore((s) => s.notify);

  const [sub, setSub] = useState(params.get("sub") ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<number[]>([]);
  const [mode, setMode] = useState<JobMode>("inmediato");
  const [when, setWhen] = useState(defaultSchedule());
  const [district, setDistrict] = useState(client?.district ?? "Miraflores");
  const [address, setAddress] = useState("Av. La Paz 1030, dpto. 402");
  const [budget, setBudget] = useState<number | "">("");
  const [laborOnly, setLaborOnly] = useState(true);
  const [wantsVisit, setWantsVisit] = useState(false);

  const reference = useMemo(() => {
    if (!sub) return null;
    const prices = services.filter((s) => s.subcategoryId === sub && (s.unit === "servicio" || s.unit === "visita" || s.unit === "punto")).map((s) => s.price);
    return { range: rangeLabel(prices), workers: workersFor(sub).length };
  }, [sub]);

  const valid = sub && title.trim().length >= 6 && description.trim().length >= 20 && photos.length > 0 && budget !== "" && budget > 0 && address.trim();

  function submit() {
    if (!valid) return;
    const id = createJob({
      subcategoryId: sub,
      title: title.trim(),
      description: description.trim(),
      photoCount: photos.length,
      mode,
      scheduledAt: mode === "programado" ? new Date(when).toISOString() : undefined,
      district,
      address: address.trim(),
      budget: Number(budget),
      laborOnly,
      wantsVisit,
    });
    scheduleFakeOffers(id);
    notify("Pedido publicado. Los trabajadores de la zona ya lo ven.");
    router.push(`/pedidos/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-ink"><ChevronLeft className="size-4" /> Volver</button>
      <PageTitle sub="Describe lo que necesitas y cuánto pagarías. Los trabajadores aceptan o te contraofertan; tú eliges.">Publica un pedido</PageTitle>

      <div className="space-y-8">
        <section>
          <Label>¿Qué tipo de trabajo es?</Label>
          <div className="space-y-4">
            {categories.map((c) => (
              <div key={c.id}>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">{c.name}</div>
                <div className="flex flex-wrap gap-2">
                  {c.subcategories.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSub(s.id)}
                      className={cn("inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors", sub === s.id ? "border-ink bg-ink text-white" : "border-line-2 bg-paper text-ink-2 hover:border-ink-4")}
                    >
                      <SubIcon id={s.id} className="size-4" /> {s.short ?? s.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <Label>Título corto</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Fuga debajo del lavadero de cocina" maxLength={80} />
          </div>
          <div>
            <Label hint={`${description.trim().length}/20 mín.`}>Describe el problema</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qué pasa, desde cuándo, qué materiales hay, si ya intentaste algo. Mientras más detalle, mejores ofertas." />
          </div>
          <div>
            <Label hint="obligatorio">Fotos</Label>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((tone, i) => (
                <div key={tone} className="relative">
                  <Photo tone={tone} subcategoryId={sub || "gasfiteria"} ratio="aspect-square" className="rounded-xl" />
                  <button onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-white" aria-label="Quitar foto"><X className="size-3" /></button>
                </div>
              ))}
              {photos.length < 6 && (
                <button type="button" onClick={() => setPhotos((p) => [...p, (p.length * 73 + 40) % 360])} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line-2 text-xs font-medium text-ink-3 hover:border-ink-4">
                  <Camera className="size-5" /> Agregar
                </button>
              )}
            </div>
            <p className="mt-1.5 flex items-start gap-1 text-xs text-ink-3"><Info className="mt-0.5 size-3 shrink-0" /> En la demo las fotos se simulan. Los pedidos con fotos reciben mejores cotizaciones porque el trabajador puede ver el problema antes de ir.</p>
          </div>
        </section>

        <section>
          <Label>¿Cuándo lo necesitas?</Label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { v: "inmediato", icon: Timer, t: "Inmediato", d: "Hoy. El pedido expira en 3 horas." },
              { v: "programado", icon: CalendarDays, t: "Programado", d: "Eliges fecha y hora." },
            ] as const).map((o) => (
              <button key={o.v} type="button" onClick={() => setMode(o.v)} className={cn("rounded-2xl border p-4 text-left transition-colors", mode === o.v ? "border-ink" : "border-line hover:border-line-2")}>
                <o.icon className="size-5" />
                <div className="mt-2 font-medium">{o.t}</div>
                <div className="text-xs text-ink-3">{o.d}</div>
              </button>
            ))}
          </div>
          {mode === "programado" && <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-3" />}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Distrito</Label>
            <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            <p className="mt-1 text-xs text-ink-3">Solo la ve el trabajador que elijas.</p>
          </div>
        </section>

        <section>
          <Label hint={reference?.range ? `referencia en el catálogo: ${reference.range}` : undefined}>¿Cuánto pagarías?</Label>
          <MoneyInput value={budget} onChange={setBudget} placeholder="80" />
          {reference && (
            <p className="mt-1.5 text-xs text-ink-3">{plural(reference.workers, "trabajador", "trabajadores")} de {getSubcategory(sub).name.toLowerCase()} verán tu pedido. Si tu precio es bajo, probablemente recibas contraofertas.</p>
          )}
          <Card className="mt-4 divide-y divide-line px-4">
            <Toggle checked={laborOnly} onChange={setLaborOnly} label="Solo mano de obra" description="Los materiales se cotizan aparte con boleta. Desactívalo si quieres que el precio incluya todo." />
            <Toggle checked={wantsVisit} onChange={setWantsVisit} label="Acepto visita de diagnóstico" description="Para trabajos difíciles de cotizar por foto. Tiene una tarifa fija que se descuenta del trabajo." />
          </Card>
        </section>

        <div className="pt-2">
          <Button full size="lg" disabled={!valid} onClick={submit}>Publicar pedido</Button>
          {!valid && <p className="mt-2 text-center text-xs text-ink-3">Completa categoría, título, descripción, al menos una foto y tu precio.</p>}
        </div>
      </div>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
