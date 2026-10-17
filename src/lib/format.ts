import type { PriceUnit } from "./types";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 });
const penDec = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 });

export function soles(n: number, decimals = false): string {
  const s = (decimals ? penDec : pen).format(n);
  // Intl devuelve "S/ 80" con espacio duro; normalizamos a S/ 80
  return s.replace(/ /g, " ");
}

export const unitLabel: Record<PriceUnit, string> = {
  servicio: "por servicio",
  hora: "por hora",
  m2: "por m²",
  punto: "por punto",
  visita: "por visita",
  dia: "por día",
};

export function unitShort(u: PriceUnit): string {
  return { servicio: "", hora: "/h", m2: "/m²", punto: "/punto", visita: "/visita", dia: "/día" }[u];
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const future = diff > 0;
  const fmt = (n: number, unit: string) => (future ? `en ${n} ${unit}` : `hace ${n} ${unit}`);
  if (abs < 60) return future ? "en un momento" : "hace un momento";
  if (abs < 3600) {
    const m = Math.round(abs / 60);
    return fmt(m, m === 1 ? "min" : "min");
  }
  if (abs < 86400) {
    const h = Math.round(abs / 3600);
    return fmt(h, h === 1 ? "hora" : "horas");
  }
  const d = Math.round(abs / 86400);
  if (d < 30) return fmt(d, d === 1 ? "día" : "días");
  const mo = Math.round(d / 30);
  return fmt(mo, mo === 1 ? "mes" : "meses");
}

export function countdown(iso: string, now = Date.now()): string {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "expirado";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h >= 1) return `${h} h ${String(m % 60).padStart(2, "0")} min`;
  return `${m} min`;
}

const dayFmt = new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" });
const timeFmt = new Intl.DateTimeFormat("es-PE", { hour: "numeric", minute: "2-digit", hour12: true });
const shortFmt = new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" });
const monthYearFmt = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" });

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Hoy";
  if (same(d, tomorrow)) return "Mañana";
  return cap(dayFmt.format(d));
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso)).replace(/\s?([ap])\.\s?m\./, " $1. m.");
}

export function formatSchedule(iso: string): string {
  return `${formatDay(iso)}, ${formatTime(iso)}`;
}

export function formatShort(iso: string): string {
  return shortFmt.format(new Date(iso)).replace(".", "");
}

export function formatMonthYear(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return cap(monthYearFmt.format(new Date(y, m - 1, 1)));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function rangeLabel(prices: number[]): string {
  if (prices.length === 0) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? soles(min) : `${soles(min)} – ${soles(max)}`;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
