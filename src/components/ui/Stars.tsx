import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Rating({ value, count, className, size = "sm" }: { value: number; count?: number; className?: string; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", size === "sm" ? "text-[13px]" : "text-[15px]", className)}>
      <Star className={cn("fill-ink text-ink", size === "sm" ? "size-3.5" : "size-4")} strokeWidth={0} />
      <span className="font-semibold">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-ink-3">({count})</span>}
    </span>
  );
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-1 transition-transform active:scale-90" aria-label={`${n} estrellas`}>
          <Star className={cn("size-8", n <= value ? "fill-ink text-ink" : "fill-mist-2 text-mist-2")} strokeWidth={0} />
        </button>
      ))}
    </div>
  );
}
