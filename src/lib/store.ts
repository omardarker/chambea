"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Job, JobMode, Message, Offer, PaymentMethod, Review, Role } from "./types";
import { seedJobs } from "./data/seed-jobs";
import { seedReviews } from "./data/reviews";
import { demoWorkerIds, getService } from "./data/workers";
import { currentClientId } from "./data/clients";
import { uid } from "./format";

export const SEED_VERSION = 3;

export interface NewJobInput {
  subcategoryId: string;
  title: string;
  description: string;
  photoCount: number;
  mode: JobMode;
  scheduledAt?: string;
  district: string;
  address: string;
  budget: number;
  laborOnly: boolean;
  wantsVisit: boolean;
}

export interface HireInput {
  serviceId: string;
  mode: JobMode;
  scheduledAt?: string;
  district: string;
  address: string;
  notes: string;
  method: PaymentMethod;
  quantity: number;
}

interface AppState {
  seedVersion: number;
  hydrated: boolean;
  role: Role;
  clientId: string;
  activeWorkerId: string;
  jobs: Job[];
  reviews: Review[];
  trusted: string[];
  toast: { id: string; text: string; tone: "ok" | "info" } | null;

  setHydrated: () => void;
  setRole: (r: Role) => void;
  setActiveWorker: (id: string) => void;
  notify: (text: string, tone?: "ok" | "info") => void;
  clearToast: () => void;

  createJob: (input: NewJobInput) => string;
  hireService: (input: HireInput) => string;
  addOffer: (jobId: string, offer: Omit<Offer, "id" | "jobId" | "createdAt" | "status">) => string;
  chooseOffer: (jobId: string, offerId: string, method: PaymentMethod) => void;
  startJob: (jobId: string) => void;
  finishJob: (jobId: string) => void;
  confirmJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  adjustQuote: (jobId: string, newPrice: number, reason: string) => void;
  acceptAdjustment: (jobId: string) => void;
  sendMessage: (jobId: string, from: Message["from"], text: string) => void;
  addReview: (review: Omit<Review, "id" | "date">) => void;
  toggleTrusted: (workerId: string) => void;
  expireJobs: () => void;
  resetDemo: () => void;
}

function initialData() {
  return {
    seedVersion: SEED_VERSION,
    role: "cliente" as Role,
    clientId: currentClientId,
    activeWorkerId: demoWorkerIds[0],
    jobs: seedJobs,
    reviews: seedReviews,
    trusted: ["w-jorge", "w-maria"],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(),
      hydrated: false,
      toast: null,

      setHydrated: () => set({ hydrated: true }),
      setRole: (role) => set({ role }),
      setActiveWorker: (activeWorkerId) => set({ activeWorkerId }),
      notify: (text, tone = "ok") => set({ toast: { id: uid("t"), text, tone } }),
      clearToast: () => set({ toast: null }),

      createJob: (input) => {
        const id = uid("j");
        const now = new Date();
        const job: Job = {
          id,
          clientId: get().clientId,
          ...input,
          createdAt: now.toISOString(),
          expiresAt: input.mode === "inmediato" ? new Date(now.getTime() + 3 * 3600_000).toISOString() : undefined,
          status: "abierto",
          source: "pedido",
          offers: [],
          messages: [],
          clientReviewed: false,
          workerReviewed: false,
        };
        set((s) => ({ jobs: [job, ...s.jobs] }));
        return id;
      },

      hireService: (input) => {
        const service = getService(input.serviceId);
        if (!service) throw new Error("Servicio no encontrado");
        const id = uid("j");
        const now = new Date().toISOString();
        const amount = service.price * input.quantity;
        const job: Job = {
          id,
          clientId: get().clientId,
          subcategoryId: service.subcategoryId,
          title: service.title,
          description: input.notes,
          photoCount: 0,
          mode: input.mode,
          scheduledAt: input.scheduledAt,
          createdAt: now,
          district: input.district,
          address: input.address,
          budget: amount,
          laborOnly: !service.includesMaterials,
          wantsVisit: false,
          status: "asignado",
          source: "catalogo",
          serviceId: service.id,
          workerId: service.workerId,
          agreedPrice: amount,
          offers: [],
          payment: { method: input.method, amount, status: "retenido", at: now },
          messages: [
            { id: uid("m"), from: "sistema", text: "Contrataste este servicio. El pago queda retenido por Chambea hasta que confirmes que el trabajo terminó.", at: now },
          ],
          clientReviewed: false,
          workerReviewed: false,
        };
        set((s) => ({ jobs: [job, ...s.jobs] }));
        return id;
      },

      addOffer: (jobId, offer) => {
        const id = uid("o");
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId && j.status === "abierto" && !j.offers.some((o) => o.workerId === offer.workerId)
              ? { ...j, offers: [...j.offers, { ...offer, id, jobId, createdAt: new Date().toISOString(), status: "pendiente" }] }
              : j,
          ),
        }));
        return id;
      },

      chooseOffer: (jobId, offerId, method) => {
        const now = new Date().toISOString();
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.id !== jobId) return j;
            const offer = j.offers.find((o) => o.id === offerId);
            if (!offer) return j;
            return {
              ...j,
              status: "asignado",
              workerId: offer.workerId,
              agreedPrice: offer.price,
              offers: j.offers.map((o) => ({ ...o, status: o.id === offerId ? "elegida" : "descartada" })),
              payment: { method, amount: offer.price, status: "retenido", at: now },
              messages: [
                ...j.messages,
                { id: uid("m"), from: "sistema", text: "Elegiste esta oferta. El pago queda retenido por Chambea hasta que confirmes que el trabajo terminó.", at: now },
              ],
            };
          }),
        }));
      },

      startJob: (jobId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? { ...j, status: "en_curso", messages: [...j.messages, { id: uid("m"), from: "sistema", text: "El trabajador marcó el trabajo como iniciado.", at: new Date().toISOString() }] }
              : j,
          ),
        })),

      finishJob: (jobId) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? { ...j, status: "por_confirmar", messages: [...j.messages, { id: uid("m"), from: "sistema", text: "El trabajador marcó el trabajo como terminado. El cliente debe confirmar para liberar el pago.", at: new Date().toISOString() }] }
              : j,
          ),
        })),

      confirmJob: (jobId) => {
        const now = new Date().toISOString();
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  status: "completado",
                  completedAt: now,
                  payment: j.payment ? { ...j.payment, status: "liberado" } : j.payment,
                  messages: [...j.messages, { id: uid("m"), from: "sistema", text: "Trabajo confirmado. El pago fue liberado al trabajador.", at: now }],
                }
              : j,
          ),
        }));
      },

      cancelJob: (jobId) =>
        set((s) => ({ jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: "cancelado" } : j)) })),

      adjustQuote: (jobId, newPrice, reason) =>
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  messages: [
                    ...j.messages,
                    { id: uid("m"), from: "trabajador", text: reason, at: new Date().toISOString() },
                    { id: uid("m"), from: "sistema", text: `AJUSTE:${newPrice}`, at: new Date().toISOString() },
                  ],
                }
              : j,
          ),
        })),

      acceptAdjustment: (jobId) =>
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.id !== jobId) return j;
            const last = [...j.messages].reverse().find((m) => m.from === "sistema" && m.text.startsWith("AJUSTE:"));
            if (!last) return j;
            const price = Number(last.text.split(":")[1]);
            return {
              ...j,
              agreedPrice: price,
              payment: j.payment ? { ...j.payment, amount: price } : j.payment,
              messages: [
                ...j.messages.filter((m) => m !== last),
                { id: uid("m"), from: "sistema", text: `El cliente aprobó el ajuste. Nuevo monto retenido: S/ ${price}.`, at: new Date().toISOString() },
              ],
            };
          }),
        })),

      sendMessage: (jobId, from, text) =>
        set((s) => ({
          jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, messages: [...j.messages, { id: uid("m"), from, text, at: new Date().toISOString() }] } : j)),
        })),

      addReview: (review) =>
        set((s) => ({
          reviews: [...s.reviews, { ...review, id: uid("r"), date: new Date().toISOString() }],
          jobs: s.jobs.map((j) =>
            j.id === review.jobId ? { ...j, clientReviewed: review.from === "cliente" ? true : j.clientReviewed, workerReviewed: review.from === "trabajador" ? true : j.workerReviewed } : j,
          ),
        })),

      toggleTrusted: (workerId) =>
        set((s) => ({ trusted: s.trusted.includes(workerId) ? s.trusted.filter((w) => w !== workerId) : [...s.trusted, workerId] })),

      expireJobs: () => {
        const now = Date.now();
        const stale = get().jobs.some((j) => j.status === "abierto" && j.expiresAt && new Date(j.expiresAt).getTime() < now);
        if (!stale) return;
        set((s) => ({
          jobs: s.jobs.map((j) => (j.status === "abierto" && j.expiresAt && new Date(j.expiresAt).getTime() < now ? { ...j, status: "expirado" } : j)),
        }));
      },

      resetDemo: () => set({ ...initialData() }),
    }),
    {
      name: "chambea-demo",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        seedVersion: s.seedVersion,
        role: s.role,
        clientId: s.clientId,
        activeWorkerId: s.activeWorkerId,
        jobs: s.jobs,
        reviews: s.reviews,
        trusted: s.trusted,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<AppState> | undefined;
        if (!p || p.seedVersion !== SEED_VERSION) return { ...current, ...initialData() };
        return { ...current, ...p };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

/* Selectores útiles */

export function selectJob(id: string) {
  return (s: AppState) => s.jobs.find((j) => j.id === id);
}

export function selectClientJobs(s: AppState) {
  return s.jobs.filter((j) => j.clientId === s.clientId);
}

export function selectWorkerJobs(s: AppState) {
  return s.jobs.filter((j) => j.workerId === s.activeWorkerId);
}

export function workerRating(s: AppState, workerId: string, base: { rating: number; reviewCount: number }) {
  const fresh = s.reviews.filter((r) => r.toId === workerId && r.from === "cliente" && !r.id.startsWith("r-"));
  if (fresh.length === 0) return base;
  const total = base.rating * base.reviewCount + fresh.reduce((a, r) => a + r.rating, 0);
  const count = base.reviewCount + fresh.length;
  return { rating: Math.round((total / count) * 10) / 10, reviewCount: count };
}
