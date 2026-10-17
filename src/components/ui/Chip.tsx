import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "outline" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-mist-2 text-ink-2",
  green: "bg-leaf-100 text-leaf-800",
  amber: "bg-amber-soft text-amber-ink",
  red: "bg-red-soft text-red-ink",
  blue: "bg-blue-soft text-blue-ink",
  outline: "border border-line-2 text-ink-2 bg-paper",
  dark: "bg-ink text-white",
};

export function Chip({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium leading-none", tones[tone], className)}>{children}</span>;
}

export function Pill({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
        active ? "border-ink bg-ink text-white" : "border-line-2 bg-paper text-ink-2 hover:border-ink-4",
        className,
      )}
    >
      {children}
    </button>
  );
}
