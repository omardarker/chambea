import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BadgeCheck, FileText } from "lucide-react";

export function Card({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <Tag className={cn("rounded-2xl border border-line bg-paper", className)}>{children}</Tag>;
}

export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-end justify-between", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function PageTitle({ children, sub, className }: { children: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-3xl">{children}</h1>
      {sub && <p className="mt-1.5 text-[15px] text-ink-3">{sub}</p>}
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-2 px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {text && <p className="mt-1 text-sm text-ink-3">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function VerifiedMark({ verified, small }: { verified: boolean; small?: boolean }) {
  return verified ? (
    <span className={cn("inline-flex items-center gap-1 font-medium text-leaf-700", small ? "text-[11px]" : "text-xs")}>
      <BadgeCheck className={small ? "size-3.5" : "size-4"} strokeWidth={2} /> Verificado
    </span>
  ) : (
    <span className={cn("inline-flex items-center gap-1 font-medium text-ink-3", small ? "text-[11px]" : "text-xs")}>
      <FileText className={small ? "size-3.5" : "size-4"} strokeWidth={2} /> Declarado
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line", className)} />;
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold tabular-nums tracking-tight">{value}</div>
      <div className="text-xs text-ink-3">{label}</div>
    </div>
  );
}
