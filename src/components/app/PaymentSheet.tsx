"use client";

import { useState } from "react";
import { CreditCard, Smartphone, ShieldCheck } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import { soles } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const methods: Array<{ id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }> = [
  { id: "yape", label: "Yape", sub: "Aprobación en la app de Yape", icon: <span className="grid size-9 place-items-center rounded-xl bg-[#742284] text-xs font-bold text-white">Y</span> },
  { id: "plin", label: "Plin", sub: "Aprobación en tu banco", icon: <span className="grid size-9 place-items-center rounded-xl bg-[#00b2a9] text-xs font-bold text-white">P</span> },
  { id: "tarjeta", label: "Tarjeta de crédito o débito", sub: "Visa, Mastercard", icon: <span className="grid size-9 place-items-center rounded-xl bg-ink text-white"><CreditCard className="size-4" /></span> },
];

export function PaymentPicker({ amount, onConfirm, label = "Confirmar y retener pago" }: { amount: number; onConfirm: (m: PaymentMethod) => void; label?: string }) {
  const [method, setMethod] = useState<PaymentMethod>("yape");
  const fee = Math.round(amount * 0.1);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-mist p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink-2">Total a retener</span>
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{soles(amount)}</span>
        </div>
        <div className="mt-1 text-xs text-ink-3">Incluye la comisión de Chambea ({soles(fee)}). El trabajador recibe {soles(amount - fee)} cuando confirmes el trabajo.</div>
      </div>
      <div className="space-y-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors", method === m.id ? "border-ink" : "border-line hover:border-line-2")}
          >
            {m.icon}
            <span className="flex-1">
              <span className="block text-[15px] font-medium">{m.label}</span>
              <span className="block text-xs text-ink-3">{m.sub}</span>
            </span>
            <span className={cn("size-5 rounded-full border-2", method === m.id ? "border-ink bg-ink ring-2 ring-inset ring-white" : "border-line-2")} />
          </button>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-2xl border border-navy-200 bg-navy-50 p-3 text-xs text-navy-900">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <span>El dinero queda retenido por Chambea. Solo se libera cuando confirmas que el trabajo terminó bien. Los trabajos pagados por la app tienen garantía.</span>
      </div>
      <Button full size="lg" onClick={() => onConfirm(method)}>
        <Smartphone className="size-4" /> {label}
      </Button>
    </div>
  );
}
