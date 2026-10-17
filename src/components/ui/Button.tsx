"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg";

const base = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none select-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-leaf-700 text-white hover:bg-leaf-800",
  dark: "bg-ink text-white hover:bg-black",
  secondary: "bg-paper text-ink border border-line-2 hover:bg-mist",
  ghost: "text-ink-2 hover:bg-mist-2",
  danger: "bg-red-soft text-red-ink hover:bg-red-100",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-6 text-base",
};

type Props = {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({ variant = "primary", size = "md", full, href, className, children, ...rest }: Props) {
  const cls = cn(base, variants[variant], sizes[size], full && "w-full", className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
