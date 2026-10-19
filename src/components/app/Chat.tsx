"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { Job, Role } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { scheduleReply, scheduleClientAdjustmentApproval } from "@/lib/simulate";
import { formatTime, soles } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export function Chat({ job, me }: { job: Job; me: Role }) {
  const sendMessage = useAppStore((s) => s.sendMessage);
  const acceptAdjustment = useAppStore((s) => s.acceptAdjustment);
  const notify = useAppStore((s) => s.notify);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [job.messages.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    sendMessage(job.id, me, t);
    setText("");
    scheduleReply(job.id, me);
  }

  const closed = job.status === "completado" || job.status === "cancelado" || job.status === "expirado";

  return (
    <div className="flex flex-col">
      <div className="max-h-[50dvh] space-y-2 overflow-y-auto px-1 py-2">
        {job.messages.length === 0 && <p className="py-6 text-center text-sm text-ink-3">Todavía no hay mensajes. El teléfono no se comparte: coordina por aquí.</p>}
        {job.messages.map((m) => {
          if (m.from === "sistema") {
            if (m.text.startsWith("AJUSTE:")) {
              const price = Number(m.text.split(":")[1]);
              return (
                <div key={m.id} className="mx-auto my-2 max-w-sm rounded-2xl border border-amber-ink/20 bg-amber-soft p-3.5 text-center">
                  <div className="text-xs font-medium text-amber-ink">Ajuste de cotización propuesto</div>
                  <div className="mt-0.5 text-xl font-semibold tabular-nums">{soles(price)}</div>
                  <div className="text-xs text-ink-2">El monto retenido cambia solo si lo apruebas.</div>
                  {me === "cliente" ? (
                    <Button size="sm" className="mt-2.5" onClick={() => { acceptAdjustment(job.id); notify("Ajuste aprobado"); }}>
                      Aprobar nuevo monto
                    </Button>
                  ) : (
                    <div className="mt-2 text-xs text-ink-3">Esperando aprobación del cliente</div>
                  )}
                </div>
              );
            }
            return (
              <div key={m.id} className="mx-auto max-w-xs py-1 text-center text-xs text-ink-3">
                {m.text}
              </div>
            );
          }
          const mine = m.from === me;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug", mine ? "rounded-br-md bg-navy-700 text-white" : "rounded-bl-md bg-mist-2 text-ink")}>
                {m.text}
                <div className={cn("mt-0.5 text-[10px] tabular-nums", mine ? "text-white/60" : "text-ink-3")}>{formatTime(m.at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      {!closed && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" className="h-11 flex-1 rounded-full border border-line-2 bg-paper px-4 text-[15px] outline-none focus:border-ink" />
          <button type="submit" aria-label="Enviar" className="grid size-11 place-items-center rounded-full bg-ink text-white disabled:opacity-40" disabled={!text.trim()}>
            <Send className="size-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export function AdjustQuote({ job, onDone }: { job: Job; onDone: () => void }) {
  const adjustQuote = useAppStore((s) => s.adjustQuote);
  const [price, setPrice] = useState<number | "">(job.agreedPrice ?? job.budget);
  const [reason, setReason] = useState("");
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2">
        Si al ver el trabajo en sitio hay algo distinto a lo descrito, propón un nuevo monto. El cliente lo ve en el chat y decide. Hasta que apruebe, el monto retenido no cambia.
      </p>
      <div>
        <div className="mb-1.5 text-sm font-medium">Nuevo monto</div>
        <div className="flex h-14 items-center rounded-xl border border-line-2 px-4 focus-within:border-ink">
          <span className="mr-2 text-lg text-ink-3">S/</span>
          <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value.replace(/\D/g, "")))} className="w-full bg-transparent text-2xl font-semibold tabular-nums outline-none" />
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-sm font-medium">Explica el motivo</div>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej.: la tubería está rota detrás del muro, hay que picar y resanar." className="min-h-24 w-full rounded-xl border border-line-2 px-4 py-3 text-[15px] outline-none focus:border-ink" />
      </div>
      <Button
        full
        disabled={!price || !reason.trim() || price === (job.agreedPrice ?? job.budget)}
        onClick={() => {
          adjustQuote(job.id, Number(price), reason.trim());
          scheduleClientAdjustmentApproval(job.id);
          onDone();
        }}
      >
        Enviar ajuste al cliente
      </Button>
    </div>
  );
}
