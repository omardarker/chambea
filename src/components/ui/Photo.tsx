import { cn } from "@/lib/cn";
import { Hammer, Wrench, Zap, Paintbrush, Trees, Tv, Lock, Layers, KeyRound, Bug, Flame, Cctv, Blinds, Grid3x3, Square, Droplets, BrickWall, PanelsTopLeft, Refrigerator, type LucideIcon } from "lucide-react";

export const subIcons: Record<string, LucideIcon> = {
  gasfiteria: Droplets,
  electricidad: Zap,
  cerrajeria: KeyRound,
  vidrieria: Square,
  gas: Flame,
  cctv: Cctv,
  cortinas: Blinds,
  albanileria: BrickWall,
  drywall: PanelsTopLeft,
  pisos: Grid3x3,
  pintura: Paintbrush,
  melamina: Layers,
  enchapes: Grid3x3,
  carpinteria: Hammer,
  herreria: Wrench,
  impermeabilizacion: Droplets,
  jardineria: Trees,
  fumigacion: Bug,
  tv: Tv,
  artefactos: Refrigerator,
};

export function SubIcon({ id, className }: { id: string; className?: string }) {
  const Icon = subIcons[id] ?? Lock;
  return <Icon className={className} strokeWidth={1.75} />;
}

/**
 * Placeholder visual para fotos (trabajos anteriores, fotos de pedidos).
 * Sin imágenes externas: un degradado suave con el ícono de la especialidad.
 */
export function Photo({ tone, subcategoryId, label, className, ratio = "aspect-[4/3]" }: { tone: number; subcategoryId: string; label?: string; className?: string; ratio?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", ratio, className)}
      style={{ background: `linear-gradient(145deg, hsl(${tone} 28% 93%) 0%, hsl(${tone} 24% 84%) 100%)` }}
    >
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #12161c 1px, transparent 0)", backgroundSize: "14px 14px" }} />
      <SubIcon id={subcategoryId} className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-ink/25" />
      {label && <span className="absolute inset-x-3 bottom-2.5 truncate text-xs font-medium text-ink/70">{label}</span>}
    </div>
  );
}
