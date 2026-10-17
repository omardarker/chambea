"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Home, Search, ClipboardList, User, Briefcase, Store, RotateCcw, Heart } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { resumeSimulations } from "@/lib/simulate";
import { cn } from "@/lib/cn";
import { getWorker } from "@/lib/data/workers";
import { getClient } from "@/lib/data/clients";
import { Avatar } from "@/components/ui/Avatar";
import type { Role } from "@/lib/types";

const clientNav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/confianza", label: "De confianza", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
];

const workerNav = [
  { href: "/trabajador", label: "Pedidos", icon: ClipboardList },
  { href: "/trabajador/trabajos", label: "Mis trabajos", icon: Briefcase },
  { href: "/trabajador/servicios", label: "Servicios", icon: Store },
  { href: "/trabajador/perfil", label: "Perfil", icon: User },
];

function Logo() {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span className="grid size-7 place-items-center rounded-[9px] bg-leaf-700">
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden>
          <path d="M4 11.5 8.5 16 16 5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[19px] font-semibold tracking-tight">chambea</span>
    </span>
  );
}

function isActive(pathname: string, href: string, role: Role) {
  if (href === "/" || href === "/trabajador") return pathname === href;
  if (role === "cliente" && href === "/pedidos") return pathname.startsWith("/pedidos") || pathname.startsWith("/servicios");
  return pathname.startsWith(href);
}

export function Shell({ children }: { children: ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const activeWorkerId = useAppStore((s) => s.activeWorkerId);
  const clientId = useAppStore((s) => s.clientId);
  const jobs = useAppStore((s) => s.jobs);
  const expireJobs = useAppStore((s) => s.expireJobs);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    resumeSimulations(useAppStore.getState().jobs, clientId);
    expireJobs();
    const t = setInterval(expireJobs, 30_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const nav = role === "cliente" ? clientNav : workerNav;
  const worker = getWorker(activeWorkerId);
  const client = getClient(clientId);
  const me = role === "cliente" ? client : worker;

  const openOffersForMe = jobs.filter((j) => j.clientId === clientId && j.status === "abierto").reduce((a, j) => a + j.offers.length, 0);
  const pendingForWorker = jobs.filter((j) => j.workerId === activeWorkerId && (j.status === "asignado" || j.status === "en_curso")).length;

  function switchRole(next: Role) {
    if (next === role) return;
    setRole(next);
    router.push(next === "cliente" ? "/" : "/trabajador");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-mist/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href={role === "cliente" ? "/" : "/trabajador"} aria-label="Inicio">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", isActive(pathname, n.href, role) ? "bg-ink text-white" : "text-ink-2 hover:bg-mist-2")}
              >
                {n.label}
                {n.href === "/pedidos" && openOffersForMe > 0 && <span className="ml-1.5 rounded-full bg-leaf-600 px-1.5 text-[11px] text-white">{openOffersForMe}</span>}
                {n.href === "/trabajador/trabajos" && pendingForWorker > 0 && <span className="ml-1.5 rounded-full bg-leaf-600 px-1.5 text-[11px] text-white">{pendingForWorker}</span>}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 rounded-full bg-mist-2 p-0.5" role="tablist" aria-label="Cambiar de rol">
              {(["cliente", "trabajador"] as Role[]).map((r) => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={role === r}
                  onClick={() => switchRole(r)}
                  className={cn("h-8 rounded-full px-3 text-[13px] font-medium capitalize transition-all", role === r ? "bg-paper text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-ink-3 hover:text-ink-2")}
                >
                  {r}
                </button>
              ))}
            </div>
            {hydrated && me && (
              <Link href={role === "cliente" ? "/perfil" : "/trabajador/perfil"} className="hidden sm:block" aria-label="Mi perfil">
                <Avatar name={me.name} hue={me.hue} size="sm" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:pb-16">
        {hydrated ? children : <Skeleton />}
      </main>

      <footer className="hidden border-t border-line py-6 text-center text-xs text-ink-4 md:block">
        Demo de producto · Lima, Perú · Los datos son de ejemplo ·{" "}
        <button onClick={() => { if (confirm("¿Reiniciar la demo? Se borran los cambios que hiciste.")) { resetDemo(); router.push("/"); } }} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink">
          <RotateCcw className="size-3" /> Reiniciar demo
        </button>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
          {nav.map((n) => {
            const active = isActive(pathname, n.href, role);
            const badge = n.href === "/pedidos" ? openOffersForMe : n.href === "/trabajador/trabajos" ? pendingForWorker : 0;
            return (
              <Link key={n.href} href={n.href} className={cn("relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-ink" : "text-ink-3")}>
                <n.icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                {n.label}
                {badge > 0 && <span className="absolute right-[calc(50%-22px)] top-2 rounded-full bg-leaf-600 px-1.5 text-[10px] leading-4 text-white">{badge}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <Toast />
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded-lg bg-mist-2" />
      <div className="h-40 rounded-2xl bg-mist-2" />
      <div className="h-40 rounded-2xl bg-mist-2" />
    </div>
  );
}

function Toast() {
  const toast = useAppStore((s) => s.toast);
  const clear = useAppStore((s) => s.clearToast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clear, 3800);
    return () => clearTimeout(t);
  }, [toast, clear]);
  if (!toast) return null;
  return (
    <div className="rise pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-float">
        <span className={cn("relative size-2 rounded-full", toast.tone === "ok" ? "bg-leaf-400 pulse-dot" : "bg-amber-300 pulse-dot")} />
        {toast.text}
      </div>
    </div>
  );
}
