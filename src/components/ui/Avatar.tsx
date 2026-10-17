import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const sizes = {
  xs: "size-7 text-[11px]",
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
};

export function Avatar({ name, hue, size = "md", className }: { name: string; hue: number; size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight select-none", sizes[size], className)}
      style={{ background: `hsl(${hue} 42% 88%)`, color: `hsl(${hue} 45% 28%)` }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
