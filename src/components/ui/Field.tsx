import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const inputBase = "w-full rounded-xl border border-line-2 bg-paper px-4 text-[15px] outline-none transition-colors placeholder:text-ink-4 focus:border-ink";

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="text-sm font-medium text-ink">{children}</span>
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cn(inputBase, "h-12", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputBase, "min-h-28 py-3 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select className={cn(inputBase, "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%2346524a%22 stroke-width=%222%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10", className)} {...rest}>
      {children}
    </select>
  );
}

export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: ReactNode }>; className?: string }) {
  return (
    <div className={cn("grid rounded-full bg-mist-2 p-1", className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-full text-sm font-medium transition-[background-color,box-shadow,color]",
            value === o.value ? "bg-paper text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function MoneyInput({ value, onChange, placeholder = "0" }: { value: number | ""; onChange: (v: number | "") => void; placeholder?: string }) {
  return (
    <div className="flex h-14 items-center rounded-xl border border-line-2 bg-paper px-4 focus-within:border-ink">
      <span className="mr-2 text-lg font-medium text-ink-3">S/</span>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          onChange(raw === "" ? "" : Number(raw));
        }}
        className="w-full bg-transparent text-2xl font-semibold tabular-nums outline-none placeholder:text-ink-4"
      />
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 py-3 text-left">
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {description && <span className="block text-sm text-ink-3">{description}</span>}
      </span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-leaf-600" : "bg-line-2")}>
        <span className={cn("absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
