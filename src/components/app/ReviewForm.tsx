"use client";

import { useState } from "react";
import type { Job, Role } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { StarPicker } from "@/components/ui/Stars";
import { Button } from "@/components/ui/Button";

export function ReviewForm({ job, from, toName, onDone }: { job: Job; from: Role; toName: string; onDone: () => void }) {
  const addReview = useAppStore((s) => s.addReview);
  const clientId = useAppStore((s) => s.clientId);
  const activeWorkerId = useAppStore((s) => s.activeWorkerId);
  const notify = useAppStore((s) => s.notify);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const prompts = from === "cliente"
    ? ["Llegó puntual", "Explicó el trabajo", "Dejó todo limpio", "Precio justo"]
    : ["Puntual con el pago", "Claro con lo que necesitaba", "Buen trato", "Espacio listo para trabajar"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        {from === "cliente" ? `¿Cómo te fue con ${toName}? Tu calificación ayuda a otros clientes.` : `¿Cómo fue trabajar con ${toName}? Tu calificación ayuda a otros trabajadores a saber con quién tratan.`}
      </p>
      <div className="flex justify-center">
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((p) => (
          <button key={p} type="button" onClick={() => setText((t) => (t ? `${t} ${p}.` : `${p}.`))} className="rounded-full border border-line-2 px-3 py-1.5 text-xs font-medium text-ink-2 hover:bg-mist">
            {p}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Cuenta cómo fue" className="min-h-24 w-full rounded-xl border border-line-2 px-4 py-3 text-[15px] outline-none focus:border-ink" />
      <Button
        full
        onClick={() => {
          addReview({
            jobId: job.id,
            from,
            fromId: from === "cliente" ? clientId : activeWorkerId,
            toId: from === "cliente" ? job.workerId! : job.clientId,
            rating,
            text: text.trim() || (rating >= 4 ? "Todo bien." : "Podría mejorar."),
            subcategoryId: job.subcategoryId,
          });
          notify("Gracias por calificar");
          onDone();
        }}
      >
        Publicar calificación
      </Button>
    </div>
  );
}
