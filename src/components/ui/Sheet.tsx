"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <button aria-label="Cerrar" className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("rise relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-paper shadow-float sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")}>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-paper/90 px-5 pt-5 pb-3 backdrop-blur">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-3 hover:bg-mist" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
