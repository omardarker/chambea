"use client";

import { useAppStore } from "./store";
import { getService, servicesOf, workersFor } from "./data/workers";
import { getClient } from "./data/clients";
import type { Job, Worker } from "./types";

/**
 * Simula el "otro lado" de la plataforma para que la demo se sienta viva:
 * trabajadores que ofertan, clientes que eligen y responden en el chat.
 * Todo corre en el navegador con temporizadores.
 */

const scheduled = new Set<string>();

function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}

function refPrice(worker: Worker, subcategoryId: string, budget: number): number {
  const own = servicesOf(worker.id).filter((s) => s.subcategoryId === subcategoryId && (s.unit === "servicio" || s.unit === "visita" || s.unit === "punto"));
  if (own.length === 0) return budget;
  return Math.min(...own.map((s) => s.price));
}

const acceptMessages = [
  "Puedo ir ahora mismo, estoy cerca. Llevo herramientas completas.",
  "De acuerdo con el precio. Si al llegar veo algo distinto a las fotos, te aviso antes de tocar nada.",
  "Listo, lo tomo. Confírmame el piso y si hay ascensor.",
  "Acepto. Trabajo similar hice la semana pasada en tu zona.",
];

const counterMessages = [
  "Por las fotos hay más trabajo del que parece; con {price} te lo dejo resuelto y con garantía.",
  "El precio que pones no cubre el repuesto que casi seguro va a necesitar. Con {price} incluyo materiales.",
  "Puedo hoy mismo, pero por la distancia y el tipo de trabajo mi precio es {price}.",
  "Te propongo {price}: incluye revisión completa y no solo el punto que describes.",
];

const etaImmediate = ["20 min", "30 min", "45 min", "1 hora"];

export function scheduleFakeOffers(jobId: string) {
  if (scheduled.has(jobId)) return;
  scheduled.add(jobId);
  const state = useAppStore.getState();
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job || job.status !== "abierto") return;

  const candidates = workersFor(job.subcategoryId)
    .filter((w) => w.id !== state.activeWorkerId && !job.offers.some((o) => o.workerId === w.id))
    .filter((w) => w.districts.includes(job.district) || Math.random() < 0.35)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  candidates.forEach((worker, i) => {
    const delay = 4000 + i * 7000 + Math.random() * 3000;
    setTimeout(() => {
      const current = useAppStore.getState();
      const fresh = current.jobs.find((j) => j.id === jobId);
      if (!fresh || fresh.status !== "abierto") return;
      const ref = refPrice(worker, job.subcategoryId, job.budget);
      const accepts = job.budget >= ref * 0.9 && Math.random() < 0.6;
      const price = accepts ? job.budget : roundTo5(Math.max(ref, job.budget * (1.15 + Math.random() * 0.3)));
      const msgPool = accepts ? acceptMessages : counterMessages;
      const message = msgPool[Math.floor(Math.random() * msgPool.length)].replace("{price}", `S/ ${price}`);
      current.addOffer(jobId, {
        workerId: worker.id,
        kind: accepts ? "acepta" : "contraoferta",
        price,
        message,
        etaLabel: job.mode === "inmediato" ? etaImmediate[Math.floor(Math.random() * etaImmediate.length)] : "en la fecha propuesta",
      });
      if (current.role === "cliente") current.notify(`${worker.name.split(" ")[0]} ${accepts ? "aceptó tu precio" : "envió una contraoferta"}`, "info");
    }, delay);
  });
}

const workerGreetings = [
  "¡Hola! Gracias por elegirme. ¿Alguna indicación para llegar?",
  "Perfecto, confirmado. Te aviso cuando esté saliendo.",
  "Gracias. Si puedes, déjame libre el espacio donde voy a trabajar.",
];

const workerReplies = [
  "Entendido, gracias por el dato.",
  "Perfecto. Cualquier cosa me escribes por aquí.",
  "Ok. Estoy saliendo en unos minutos.",
  "Sí, sin problema.",
  "Lo tengo en cuenta. Nos vemos.",
];

const clientReplies = [
  "Perfecto, te espero.",
  "Gracias, avísame cuando estés cerca.",
  "Ok. Toca el timbre del 402.",
  "Listo, gracias.",
];

export function scheduleWorkerGreeting(jobId: string) {
  setTimeout(() => {
    const s = useAppStore.getState();
    const job = s.jobs.find((j) => j.id === jobId);
    if (!job || job.workerId === s.activeWorkerId) return;
    s.sendMessage(jobId, "trabajador", workerGreetings[Math.floor(Math.random() * workerGreetings.length)]);
  }, 2500 + Math.random() * 2000);
}

/** Respuesta automática de la contraparte cuando el usuario escribe en el chat. */
export function scheduleReply(jobId: string, fromRole: "cliente" | "trabajador") {
  setTimeout(() => {
    const s = useAppStore.getState();
    const job = s.jobs.find((j) => j.id === jobId);
    if (!job) return;
    if (fromRole === "cliente") {
      if (job.workerId === s.activeWorkerId && s.role === "trabajador") return;
      s.sendMessage(jobId, "trabajador", workerReplies[Math.floor(Math.random() * workerReplies.length)]);
    } else {
      if (job.clientId === s.clientId && s.role === "cliente") return;
      s.sendMessage(jobId, "cliente", clientReplies[Math.floor(Math.random() * clientReplies.length)]);
    }
  }, 2000 + Math.random() * 2500);
}

/** Cuando el trabajador demo oferta en el pedido de otro cliente, ese cliente lo elige al rato. */
export function scheduleClientDecision(jobId: string, offerId: string) {
  setTimeout(() => {
    const s = useAppStore.getState();
    const job = s.jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "abierto" || job.clientId === s.clientId) return;
    const methods = ["yape", "plin", "tarjeta"] as const;
    s.chooseOffer(jobId, offerId, methods[Math.floor(Math.random() * methods.length)]);
    const client = getClient(job.clientId);
    s.sendMessage(jobId, "cliente", `Hola, elegí tu oferta. ${job.mode === "inmediato" ? "¿En cuánto llegas?" : "Nos vemos en la fecha acordada."}`);
    s.notify(`${client?.name.split(" ")[0] ?? "El cliente"} eligió tu oferta`, "info");
  }, 9000 + Math.random() * 5000);
}

/** Cuando el trabajador demo marca terminado, el cliente simulado confirma y califica. */
export function scheduleClientConfirmation(jobId: string) {
  setTimeout(() => {
    const s = useAppStore.getState();
    const job = s.jobs.find((j) => j.id === jobId);
    if (!job || job.status !== "por_confirmar" || job.clientId === s.clientId) return;
    s.confirmJob(jobId);
    s.addReview({
      jobId,
      from: "cliente",
      fromId: job.clientId,
      toId: job.workerId!,
      rating: 5,
      text: "Rápido y claro con el precio. Lo volvería a contratar.",
      subcategoryId: job.subcategoryId,
    });
    s.notify("El cliente confirmó el trabajo. Pago liberado.", "ok");
  }, 7000 + Math.random() * 4000);
}

/** Cuando el trabajador demo ajusta la cotización, el cliente simulado la aprueba. */
export function scheduleClientAdjustmentApproval(jobId: string) {
  setTimeout(() => {
    const s = useAppStore.getState();
    const job = s.jobs.find((j) => j.id === jobId);
    if (!job || job.clientId === s.clientId) return;
    s.acceptAdjustment(jobId);
    s.notify("El cliente aprobó el ajuste de precio.", "ok");
  }, 6000 + Math.random() * 3000);
}

/** Al cargar, reanuda ofertas pendientes de pedidos abiertos recientes del cliente. */
export function resumeSimulations(jobs: Job[], clientId: string) {
  const now = Date.now();
  jobs
    .filter((j) => j.clientId === clientId && j.status === "abierto" && j.offers.length < 3 && now - new Date(j.createdAt).getTime() < 2 * 3600_000)
    .forEach((j) => scheduleFakeOffers(j.id));
}

export function describeService(serviceId: string | undefined): string | undefined {
  return serviceId ? getService(serviceId)?.title : undefined;
}
