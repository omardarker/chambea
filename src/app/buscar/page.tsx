"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, Plus } from "lucide-react";
import { categories, getSubcategory, subcategories } from "@/lib/data/categories";
import { services, workers, getWorker } from "@/lib/data/workers";
import { districts } from "@/lib/data/districts";
import { Pill } from "@/components/ui/Chip";
import { Select } from "@/components/ui/Field";
import { ServiceCard } from "@/components/app/Cards";
import { Empty, PageTitle } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { plural } from "@/lib/format";

const synonyms: Record<string, string[]> = {
  gasfiteria: ["gasfitero", "fuga", "caño", "desagüe", "atoro", "inodoro", "terma", "agua", "tubería", "ducha"],
  electricidad: ["electricista", "luz", "tomacorriente", "tablero", "llave", "corto", "foco", "cable"],
  cerrajeria: ["cerrajero", "chapa", "llave", "puerta", "cerradura", "candado"],
  vidrieria: ["vidrio", "ventana", "mampara", "aluminio", "espejo"],
  gas: ["gas", "cálidda", "glp", "cocina"],
  cctv: ["cámara", "camaras", "alarma", "seguridad"],
  cortinas: ["cortina", "roller", "persiana"],
  albanileria: ["albañil", "muro", "ladrillo", "tarrajeo", "ampliación", "obra"],
  drywall: ["drywall", "tabique", "cielo raso", "falso techo"],
  pisos: ["piso", "laminado", "vinílico", "vinilico", "spc"],
  pintura: ["pintar", "pintor", "pintura", "sala", "pared"],
  melamina: ["melamina", "closet", "repostero", "mueble", "escritorio"],
  enchapes: ["enchape", "porcelanato", "cerámico", "mayólica", "baño"],
  carpinteria: ["carpintero", "madera", "puerta", "mueble"],
  herreria: ["herrero", "reja", "portón", "soldadura", "fierro"],
  impermeabilizacion: ["impermeabilizar", "filtración", "humedad", "techo", "goteras"],
  jardineria: ["jardín", "jardin", "grass", "poda", "plantas", "terraza"],
  fumigacion: ["fumigar", "cucarachas", "plagas", "chinches", "ratas"],
  tv: ["tv", "televisor", "colgar", "pared", "rack", "soporte"],
  artefactos: ["lavadora", "campana", "aire acondicionado", "instalar", "refrigeradora", "secadora"],
};

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "";
  const sub = params.get("sub") ?? "";
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState<"relevancia" | "precio" | "rating">("relevancia");

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    if (key === "cat") p.delete("sub");
    if (key === "sub" && value) p.delete("cat");
    router.replace(`/buscar?${p.toString()}`);
  }

  const results = useMemo(() => {
    const nq = norm(q);
    let subIds: Set<string> | null = null;
    if (sub) subIds = new Set([sub]);
    else if (cat) subIds = new Set(subcategories.filter((s) => s.categoryId === cat).map((s) => s.id));
    else if (nq) {
      const hits = subcategories.filter((s) => norm(s.name).includes(nq) || (synonyms[s.id] ?? []).some((k) => nq.includes(norm(k)) || norm(k).includes(nq)));
      subIds = hits.length ? new Set(hits.map((s) => s.id)) : null;
    }
    let list = services.filter((s) => {
      if (subIds && !subIds.has(s.subcategoryId)) return false;
      if (!subIds && nq && !norm(s.title + " " + s.description).includes(nq)) return false;
      const w = getWorker(s.workerId)!;
      if (district && !w.districts.includes(district)) return false;
      return true;
    });
    const score = (s: (typeof services)[number]) => {
      const w = getWorker(s.workerId)!;
      return w.rating * 10 + Math.log(w.reviewCount + 1) + (w.identityVerified ? 1 : 0);
    };
    list = [...list].sort((a, b) => {
      if (sort === "precio") return a.price - b.price;
      if (sort === "rating") return getWorker(b.workerId)!.rating - getWorker(a.workerId)!.rating;
      return score(b) - score(a);
    });
    return list;
  }, [q, cat, sub, district, sort]);

  const activeCat = sub ? getSubcategory(sub).categoryId : cat;
  const chips = activeCat ? categories.find((c) => c.id === activeCat)!.subcategories : [];
  const title = sub ? getSubcategory(sub).name : cat ? categories.find((c) => c.id === cat)!.name : q ? `Resultados para “${q}”` : "Catálogo de servicios";
  const workerCount = new Set(results.map((r) => r.workerId)).size;

  return (
    <div>
      <PageTitle sub={`${plural(results.length, "servicio", "servicios")} de ${plural(workerCount, "trabajador", "trabajadores")}${district ? ` en ${district}` : " en Lima"}`}>{title}</PageTitle>

      <div className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        <Pill active={!cat && !sub} onClick={() => router.replace(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar")}>Todo</Pill>
        {categories.map((c) => (
          <Pill key={c.id} active={activeCat === c.id} onClick={() => setParam("cat", c.id)}>{c.name}</Pill>
        ))}
      </div>
      {chips.length > 0 && (
        <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
          {chips.map((s) => (
            <Pill key={s.id} active={sub === s.id} onClick={() => setParam("sub", sub === s.id ? "" : s.id)} className="h-8 text-[13px]">{s.short ?? s.name}</Pill>
          ))}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Select value={district} onChange={(e) => setDistrict(e.target.value)} className="h-10 w-auto min-w-44 rounded-full py-0 text-sm">
            <option value="">Todos los distritos</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </div>
        <div className="relative">
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 w-auto min-w-40 rounded-full py-0 text-sm">
            <option value="relevancia">Más relevantes</option>
            <option value="rating">Mejor calificados</option>
            <option value="precio">Menor precio</option>
          </Select>
        </div>
        <span className="ml-auto hidden items-center gap-1 text-xs text-ink-3 sm:inline-flex"><SlidersHorizontal className="size-3.5" /> {workers.length} trabajadores en la demo</span>
      </div>

      {results.length === 0 ? (
        <Empty
          title="No encontramos servicios con ese filtro"
          text="Prueba con otra palabra o publica un pedido: los trabajadores de la categoría te mandan ofertas."
          action={<Button href={`/pedidos/nuevo${sub ? `?sub=${sub}` : ""}`}><Plus className="size-4" /> Publicar pedido</Button>}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((s) => (
              <ServiceCard key={s.id} service={s} worker={getWorker(s.workerId)!} />
            ))}
          </div>
          <div className="mt-8 rounded-3xl border border-dashed border-line-2 p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <div>
              <div className="font-medium">¿No encaja ninguno con tu caso?</div>
              <div className="text-sm text-ink-3">Publica lo que necesitas con fotos y tu precio. Recibes ofertas en minutos.</div>
            </div>
            <Link href={`/pedidos/nuevo${sub ? `?sub=${sub}` : ""}`} className="mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white sm:mt-0">
              <Plus className="size-4" /> Publicar pedido
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
