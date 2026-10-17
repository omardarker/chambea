"use client";

import { useShallow } from "zustand/shallow";
import Link from "next/link";
import { Clock, MapPin, Camera, CalendarDays, Timer, Heart, ShieldCheck } from "lucide-react";
import type { Job, Offer, Service, Worker } from "@/lib/types";
import { getWorker } from "@/lib/data/workers";
import { getClient } from "@/lib/data/clients";
import { getSubcategory } from "@/lib/data/categories";
import { soles, unitShort, relativeTime, countdown, formatSchedule, plural } from "@/lib/format";
import { useAppStore, workerRating } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Stars";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";

export function WorkerRow({ worker, sub, right, href }: { worker: Worker; sub?: string; right?: React.ReactNode; href?: string }) {
  const rating = useAppStore(useShallow((s) => workerRating(s, worker.id, worker)));
  const trusted = useAppStore((s) => s.trusted.includes(worker.id));
  const content = (
    <div className="flex items-center gap-3">
      <Avatar name={worker.name} hue={worker.hue} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{worker.name}</span>
          {worker.identityVerified && <ShieldCheck className="size-4 shrink-0 text-leaf-600" strokeWidth={2} />}
          {trusted && <Heart className="size-3.5 shrink-0 fill-red-ink text-red-ink" strokeWidth={0} />}
        </div>
        <div className="flex items-center gap-2 text-[13px] text-ink-3">
          <Rating value={rating.rating} count={rating.reviewCount} />
          <span>·</span>
          <span className="truncate">{sub ?? worker.headline}</span>
        </div>
      </div>
      {right}
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

export function ServiceCard({ service, worker }: { service: Service; worker: Worker }) {
  const rating = useAppStore(useShallow((s) => workerRating(s, worker.id, worker)));
  return (
    <Link href={`/servicios/${service.id}`} className="block">
      <Card className="h-full p-4 transition-colors hover:border-line-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug">{service.title}</h3>
          <div className="shrink-0 text-right">
            <div className="text-lg font-semibold tabular-nums tracking-tight">
              {soles(service.price)}
              <span className="text-xs font-medium text-ink-3">{unitShort(service.unit)}</span>
            </div>
          </div>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-3">{service.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip tone={service.includesMaterials ? "green" : "neutral"}>{service.includesMaterials ? "Materiales incluidos" : "Solo mano de obra"}</Chip>
          <Chip tone="outline"><Clock className="size-3" /> {service.durationLabel}</Chip>
        </div>
        <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-3">
          <Avatar name={worker.name} hue={worker.hue} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-sm font-medium">
              <span className="truncate">{worker.name}</span>
              {worker.identityVerified && <ShieldCheck className="size-3.5 text-leaf-600" strokeWidth={2} />}
            </div>
            <div className="text-xs text-ink-3">Responde en ~{worker.responseMinutes} min</div>
          </div>
          <Rating value={rating.rating} count={rating.reviewCount} />
        </div>
      </Card>
    </Link>
  );
}

export const statusLabel: Record<Job["status"], { label: string; tone: "neutral" | "green" | "amber" | "blue" | "red" }> = {
  abierto: { label: "Recibiendo ofertas", tone: "amber" },
  asignado: { label: "Confirmado", tone: "blue" },
  en_curso: { label: "En curso", tone: "blue" },
  por_confirmar: { label: "Por confirmar", tone: "amber" },
  completado: { label: "Completado", tone: "green" },
  cancelado: { label: "Cancelado", tone: "neutral" },
  expirado: { label: "Expirado", tone: "neutral" },
};

export function JobCard({ job, perspective }: { job: Job; perspective: "cliente" | "trabajador" }) {
  const sub = getSubcategory(job.subcategoryId);
  const worker = job.workerId ? getWorker(job.workerId) : undefined;
  const client = getClient(job.clientId);
  const activeWorkerId = useAppStore((s) => s.activeWorkerId);
  const myOffer = job.offers.find((o) => o.workerId === activeWorkerId);
  const href = perspective === "cliente" ? `/pedidos/${job.id}` : `/trabajador/pedidos/${job.id}`;
  const st = statusLabel[job.status];
  const price = job.agreedPrice ?? job.budget;

  return (
    <Link href={href} className="block">
      <Card className="p-4 transition-colors hover:border-line-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <Chip tone={st.tone}>{st.label}</Chip>
              {job.mode === "inmediato" ? (
                <Chip tone="outline"><Timer className="size-3" /> Inmediato</Chip>
              ) : (
                <Chip tone="outline"><CalendarDays className="size-3" /> {job.scheduledAt ? formatSchedule(job.scheduledAt) : "Programado"}</Chip>
              )}
            </div>
            <h3 className="truncate text-[15px] font-semibold">{job.title}</h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-3">
              <span>{sub.name}</span>
              <span>·</span>
              <MapPin className="size-3" /> {job.district}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-lg font-semibold tabular-nums tracking-tight">{soles(price)}</div>
            <div className="text-[11px] text-ink-3">{job.agreedPrice ? "acordado" : "tu oferta"}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px]">
          {perspective === "cliente" ? (
            job.status === "abierto" ? (
              <span className={cn("font-medium", job.offers.length ? "text-leaf-700" : "text-ink-3")}>
                {job.offers.length ? plural(job.offers.length, "oferta recibida", "ofertas recibidas") : "Esperando ofertas"}
              </span>
            ) : worker ? (
              <span className="flex items-center gap-2">
                <Avatar name={worker.name} hue={worker.hue} size="xs" /> {worker.name}
              </span>
            ) : (
              <span className="text-ink-3">Sin trabajador</span>
            )
          ) : client ? (
            <span className="flex items-center gap-2">
              <Avatar name={client.name} hue={client.hue} size="xs" /> {client.name}
              <Rating value={client.rating} />
            </span>
          ) : null}
          <span className="flex items-center gap-1 text-ink-3">
            {job.status === "abierto" && job.expiresAt ? (
              <><Clock className="size-3" /> {countdown(job.expiresAt)}</>
            ) : perspective === "trabajador" && myOffer ? (
              <span className="font-medium text-leaf-700">Ofertaste {soles(myOffer.price)}</span>
            ) : (
              relativeTime(job.createdAt)
            )}
            {job.photoCount > 0 && job.status === "abierto" && <span className="ml-2 inline-flex items-center gap-0.5"><Camera className="size-3" /> {job.photoCount}</span>}
          </span>
        </div>
      </Card>
    </Link>
  );
}

export function OfferCard({ offer, job, onChoose, chosen }: { offer: Offer; job: Job; onChoose?: () => void; chosen?: boolean }) {
  const worker = getWorker(offer.workerId);
  const rating = useAppStore(useShallow((s) => workerRating(s, offer.workerId, worker ?? { rating: 0, reviewCount: 0 })));
  const trusted = useAppStore((s) => s.trusted.includes(offer.workerId));
  if (!worker) return null;
  const diff = offer.price - job.budget;
  return (
    <Card className={cn("p-4", chosen && "border-leaf-600 ring-1 ring-leaf-600", offer.status === "descartada" && "opacity-50")}>
      <div className="flex items-start gap-3">
        <Link href={`/trabajadores/${worker.id}?from=${job.id}`}>
          <Avatar name={worker.name} hue={worker.hue} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/trabajadores/${worker.id}?from=${job.id}`} className="flex items-center gap-1.5">
            <span className="truncate font-medium">{worker.name}</span>
            {worker.identityVerified && <ShieldCheck className="size-4 shrink-0 text-leaf-600" strokeWidth={2} />}
            {trusted && <Heart className="size-3.5 shrink-0 fill-red-ink text-red-ink" strokeWidth={0} />}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
            <Rating value={rating.rating} count={rating.reviewCount} />
            <span>·</span>
            <span>{plural(worker.jobsDone, "trabajo", "trabajos")}</span>
            <span>·</span>
            <span>{offer.etaLabel}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-semibold tabular-nums tracking-tight">{soles(offer.price)}</div>
          <div className={cn("text-[11px] font-medium", offer.kind === "acepta" ? "text-leaf-700" : "text-amber-ink")}>
            {offer.kind === "acepta" ? "Acepta tu precio" : `+${soles(diff)} sobre tu oferta`}
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-mist px-3.5 py-2.5 text-sm leading-relaxed">{offer.message}</p>
      {onChoose && offer.status === "pendiente" && (
        <div className="mt-3 flex gap-2">
          <Link href={`/trabajadores/${worker.id}?from=${job.id}`} className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-line-2 text-sm font-medium hover:bg-mist">
            Ver perfil
          </Link>
          <button onClick={onChoose} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-leaf-700 text-sm font-medium text-white hover:bg-leaf-800">
            Elegir por {soles(offer.price)}
          </button>
        </div>
      )}
      {chosen && <div className="mt-3 text-center text-xs font-medium text-leaf-700">Oferta elegida</div>}
    </Card>
  );
}
