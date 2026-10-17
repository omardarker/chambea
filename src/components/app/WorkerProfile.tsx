"use client";

import { useShallow } from "zustand/shallow";
import Link from "next/link";
import { ShieldCheck, Heart, MapPin, Clock, Award, GraduationCap, BriefcaseBusiness, Images } from "lucide-react";
import type { Worker } from "@/lib/types";
import { servicesOf } from "@/lib/data/workers";
import { getClient } from "@/lib/data/clients";
import { getSubcategory } from "@/lib/data/categories";
import { reviewsForWorker } from "@/lib/data/reviews";
import { useAppStore, workerRating } from "@/lib/store";
import { formatMonthYear, formatShort, plural, soles, unitShort } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Stars";
import { Chip } from "@/components/ui/Chip";
import { Card, SectionTitle, VerifiedMark, Stat, Divider } from "@/components/ui/Misc";
import { Photo } from "@/components/ui/Photo";
import { cn } from "@/lib/cn";

export function WorkerProfile({ worker, viewer }: { worker: Worker; viewer: "cliente" | "self" }) {
  const rating = useAppStore(useShallow((s) => workerRating(s, worker.id, worker)));
  const reviews = useAppStore(useShallow((s) => reviewsForWorker(worker.id, s.reviews)));
  const trusted = useAppStore((s) => s.trusted.includes(worker.id));
  const toggleTrusted = useAppStore((s) => s.toggleTrusted);
  const notify = useAppStore((s) => s.notify);
  const services = servicesOf(worker.id);
  const verifiedCerts = worker.certifications.filter((c) => c.verified).length;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={worker.name} hue={worker.hue} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{worker.name}</h1>
            {worker.identityVerified && (
              <Chip tone="green"><ShieldCheck className="size-3.5" /> Identidad verificada</Chip>
            )}
            {worker.backgroundChecked && <Chip tone="green">Antecedentes revisados</Chip>}
          </div>
          <p className="mt-1 text-[15px] text-ink-2">{worker.headline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
            <Rating value={rating.rating} count={rating.reviewCount} size="md" />
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> Responde en ~{worker.responseMinutes} min</span>
            <span>En Chambea desde {formatMonthYear(worker.memberSince).toLowerCase()}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {worker.subcategoryIds.map((s) => (
              <Chip key={s} tone="outline">{getSubcategory(s).name}</Chip>
            ))}
          </div>
        </div>
        {viewer === "cliente" && (
          <button
            onClick={() => {
              toggleTrusted(worker.id);
              notify(trusted ? "Quitado de tus trabajadores de confianza" : "Guardado como trabajador de confianza");
            }}
            className={cn("inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors", trusted ? "border-red-ink/20 bg-red-soft text-red-ink" : "border-line-2 bg-paper hover:bg-mist")}
          >
            <Heart className={cn("size-4", trusted && "fill-red-ink")} strokeWidth={trusted ? 0 : 2} />
            {trusted ? "De confianza" : "Guardar"}
          </button>
        )}
      </section>

      <Card className="grid grid-cols-3 divide-x divide-line p-4 text-center sm:grid-cols-4">
        <Stat value={worker.jobsDone} label="trabajos en la app" />
        <Stat value={rating.rating.toFixed(1)} label="calificación" />
        <Stat value={`${verifiedCerts}/${worker.certifications.length}`} label="certificados verificados" />
        <div className="hidden sm:block"><Stat value={worker.districts.length} label="distritos" /></div>
      </Card>

      <section>
        <p className="text-[15px] leading-relaxed text-ink-2">{worker.bio}</p>
        <div className="mt-3 flex items-start gap-2 text-sm text-ink-3">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span>{worker.districts.join(", ")}</span>
        </div>
      </section>

      <section>
        <SectionTitle>Servicios publicados</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <Link key={s.id} href={viewer === "cliente" ? `/servicios/${s.id}` : "/trabajador/servicios"} className="block">
              <Card className="flex h-full items-start justify-between gap-3 p-4 transition-colors hover:border-line-2">
                <div className="min-w-0">
                  <div className="font-medium leading-snug">{s.title}</div>
                  <div className="mt-1 text-xs text-ink-3">{getSubcategory(s.subcategoryId).name} · {s.durationLabel} · {s.includesMaterials ? "materiales incluidos" : "solo mano de obra"}</div>
                </div>
                <div className="shrink-0 text-lg font-semibold tabular-nums tracking-tight">
                  {soles(s.price)}<span className="text-xs font-medium text-ink-3">{unitShort(s.unit)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle><span className="inline-flex items-center gap-2"><Images className="size-5" /> Trabajos anteriores</span></SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {worker.portfolio.map((p) => (
            <div key={p.id}>
              <Photo tone={p.tone} subcategoryId={p.subcategoryId} />
              <div className="mt-1.5 text-sm font-medium leading-tight">{p.title}</div>
              <div className="text-xs text-ink-3">{p.district}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <SectionTitle><span className="inline-flex items-center gap-2"><Award className="size-5" /> Certificaciones</span></SectionTitle>
          {worker.certifications.length === 0 ? (
            <p className="text-sm text-ink-3">No ha registrado certificaciones.</p>
          ) : (
            <Card className="divide-y divide-line">
              {worker.certifications.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="font-medium leading-snug">{c.name}</div>
                    <div className="text-xs text-ink-3">{c.issuer} · {c.year}</div>
                  </div>
                  <VerifiedMark verified={c.verified} />
                </div>
              ))}
            </Card>
          )}
          <p className="mt-2 text-xs text-ink-3">
            <span className="font-medium text-leaf-700">Verificado</span>: Chambea revisó el documento. <span className="font-medium">Declarado</span>: lo indica el trabajador, sin revisión.
          </p>
        </div>

        {worker.education.length > 0 && (
          <div>
            <SectionTitle><span className="inline-flex items-center gap-2"><GraduationCap className="size-5" /> Estudios</span></SectionTitle>
            <Card className="divide-y divide-line">
              {worker.education.map((e) => (
                <div key={e.title} className="p-4">
                  <div className="font-medium leading-snug">{e.title}</div>
                  <div className="text-xs text-ink-3">{e.institution} · {e.year}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        <div>
          <SectionTitle><span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-5" /> Experiencia</span></SectionTitle>
          <Card className="divide-y divide-line">
            {worker.experience.map((e) => (
              <div key={`${e.role}-${e.from}`} className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-medium leading-snug">{e.role}</div>
                  <div className="shrink-0 text-xs tabular-nums text-ink-3">{e.from} – {e.to ?? "hoy"}</div>
                </div>
                <div className="text-sm text-ink-2">{e.place}</div>
                {e.summary && <div className="mt-1 text-sm text-ink-3">{e.summary}</div>}
              </div>
            ))}
          </Card>
        </div>
      </section>

      <section>
        <SectionTitle>{plural(reviews.length, "reseña", "reseñas")} de clientes</SectionTitle>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-3">Aún no tiene reseñas.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const c = getClient(r.fromId);
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {c && <Avatar name={c.name} hue={c.hue} size="sm" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{c?.name ?? "Cliente"}</div>
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
      <Divider />
    </div>
  );
}
