"use client";

import { useAppStore } from "@/lib/store";
import { demoWorkerIds, getWorker } from "@/lib/data/workers";
import { getSubcategory } from "@/lib/data/categories";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

/** En la demo puedes "ser" distintos trabajadores para ver pedidos de otras categorías. */
export function WorkerSwitch() {
  const activeWorkerId = useAppStore((s) => s.activeWorkerId);
  const setActiveWorker = useAppStore((s) => s.setActiveWorker);
  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
      {demoWorkerIds.map((id) => {
        const w = getWorker(id)!;
        const active = id === activeWorkerId;
        return (
          <button key={id} onClick={() => setActiveWorker(id)} className={cn("flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-left transition-colors", active ? "border-ink bg-ink text-white" : "border-line-2 bg-paper hover:border-ink-4")}>
            <Avatar name={w.name} hue={w.hue} size="sm" />
            <span>
              <span className="block text-[13px] font-medium leading-tight">{w.name.split(" ")[0]}</span>
              <span className={cn("block text-[11px] leading-tight", active ? "text-white/70" : "text-ink-3")}>{w.subcategoryIds.map((s) => getSubcategory(s).short ?? getSubcategory(s).name).join(" · ")}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
