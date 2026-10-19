"use client";

import { useShallow } from "zustand/shallow";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search, Sparkles, ChevronRight } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { getWorker } from "@/lib/data/workers";
import { getClient } from "@/lib/data/clients";
import { useAppStore, selectClientJobs } from "@/lib/store";
import { SubIcon } from "@/components/ui/Photo";
import { Card, SectionTitle } from "@/components/ui/Misc";
import { JobCard, WorkerRow } from "@/components/app/Cards";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const client = useAppStore((s) => getClient(s.clientId));
  const jobs = useAppStore(useShallow(selectClientJobs));
  const trusted = useAppStore((s) => s.trusted);
  const active = jobs.filter((j) => ["abierto", "asignado", "en_curso", "por_confirmar"].includes(j.status));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-10">
      <section>
        <p className="text-sm font-medium text-navy-700">{greeting}, {client?.name.split(" ")[0]}</p>
        <h1 className="mt-1 text-[32px] font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          ¿Qué necesita<br className="sm:hidden" /> tu casa hoy?
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : "/buscar");
          }}
          className="mt-5 flex h-14 items-center gap-3 rounded-full border border-line-2 bg-paper pl-5 pr-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-within:border-ink"
        >
          <Search className="size-5 shrink-0 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gasfitero, pintar la sala, colgar la TV…" className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-ink-4" />
          <button type="submit" className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white" aria-label="Buscar">
            <ArrowRight className="size-4" />
          </button>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/pedidos/nuevo" className="group block">
          <div className="flex h-full flex-col justify-between rounded-3xl bg-navy-700 p-5 text-white transition-colors group-hover:bg-navy-800 sm:p-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium"><Sparkles className="size-3.5" /> Lo más usado</div>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">Publica tu pedido y pon tu precio</h2>
              <p className="mt-2 text-[15px] text-white/80">Describe el problema, sube fotos y di cuánto pagarías. Los trabajadores de la categoría aceptan o te contraofertan. Tú eliges viendo su perfil.</p>
            </div>
            <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium">Crear pedido <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></div>
          </div>
        </Link>
        <Link href="/buscar" className="group block">
          <div className="flex h-full flex-col justify-between rounded-3xl border border-line bg-paper p-5 transition-colors group-hover:border-line-2 sm:p-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-mist-2 px-2.5 py-1 text-xs font-medium text-ink-2">Catálogo</div>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">Elige un servicio con precio fijo</h2>
              <p className="mt-2 text-[15px] text-ink-3">Servicios publicados por los trabajadores con precio, calificaciones y perfil completo. Contratas y agendas directo.</p>
            </div>
            <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium">Ver catálogo <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></div>
          </div>
        </Link>
      </section>

      {active.length > 0 && (
        <section>
          <SectionTitle action={<Link href="/pedidos" className="text-sm font-medium text-ink-2 hover:text-ink">Ver todos</Link>}>Tus pedidos activos</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {active.slice(0, 2).map((j) => (
              <JobCard key={j.id} job={j} perspective="cliente" />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        {categories.map((c) => (
          <div key={c.id}>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{c.name}</h2>
                <p className="text-sm text-ink-3">{c.tagline}</p>
              </div>
              <Link href={`/buscar?cat=${c.id}`} className="flex items-center text-sm font-medium text-ink-2 hover:text-ink">Ver todo <ChevronRight className="size-4" /></Link>
            </div>
            <div className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
              {c.subcategories.map((s) => (
                <Link key={s.id} href={`/buscar?sub=${s.id}`} className="block w-36 shrink-0 sm:w-auto">
                  <Card className="flex h-full flex-col gap-3 p-3.5 transition-colors hover:border-line-2">
                    <span className="grid size-10 place-items-center rounded-xl bg-navy-50 text-navy-800">
                      <SubIcon id={s.id} className="size-5" />
                    </span>
                    <span className="text-[14px] font-medium leading-tight">{s.name}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {trusted.length > 0 && (
        <section>
          <SectionTitle action={<Link href="/confianza" className="text-sm font-medium text-ink-2 hover:text-ink">Ver todos</Link>}>Tus trabajadores de confianza</SectionTitle>
          <Card className="divide-y divide-line">
            {trusted.slice(0, 3).map((id) => {
              const w = getWorker(id);
              if (!w) return null;
              return (
                <div key={id} className="p-4">
                  <WorkerRow worker={w} href={`/trabajadores/${w.id}`} right={<Button size="sm" variant="secondary" href={`/trabajadores/${w.id}`}>Recontratar</Button>} />
                </div>
              );
            })}
          </Card>
        </section>
      )}
    </div>
  );
}
