export type CategoryId = "construccion" | "instalaciones" | "mantenimiento";

export interface Subcategory {
  id: string;
  name: string;
  categoryId: CategoryId;
  /** Nombre corto para chips */
  short?: string;
  /** Sugerencia de unidad de precio habitual */
  hint: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  subcategories: Subcategory[];
}

export type PriceUnit = "servicio" | "hora" | "m2" | "punto" | "visita" | "dia";

export interface Service {
  id: string;
  workerId: string;
  subcategoryId: string;
  title: string;
  description: string;
  price: number;
  unit: PriceUnit;
  includesMaterials: boolean;
  durationLabel: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
  verified: boolean;
}

export interface Education {
  title: string;
  institution: string;
  year: number;
}

export interface Experience {
  role: string;
  place: string;
  from: number;
  to: number | null;
  summary: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  subcategoryId: string;
  district: string;
  tone: number; // 0..7, para el placeholder visual
}

export interface Worker {
  id: string;
  name: string;
  hue: number;
  headline: string;
  bio: string;
  districts: string[];
  subcategoryIds: string[];
  identityVerified: boolean;
  backgroundChecked: boolean;
  certifications: Certification[];
  education: Education[];
  experience: Experience[];
  portfolio: PortfolioItem[];
  rating: number;
  reviewCount: number;
  jobsDone: number;
  memberSince: string; // YYYY-MM
  responseMinutes: number;
  offersVisit: boolean;
  visitFee: number;
  languages?: string[];
}

export interface Client {
  id: string;
  name: string;
  hue: number;
  district: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  jobsHired: number;
}

export type Role = "cliente" | "trabajador";

export interface Review {
  id: string;
  jobId: string;
  from: Role;
  fromId: string;
  toId: string;
  rating: number;
  text: string;
  date: string; // ISO
  subcategoryId: string;
}

export type OfferKind = "acepta" | "contraoferta";
export type OfferStatus = "pendiente" | "elegida" | "descartada";

export interface Offer {
  id: string;
  jobId: string;
  workerId: string;
  kind: OfferKind;
  price: number;
  message: string;
  etaLabel: string;
  createdAt: string;
  status: OfferStatus;
}

export type JobMode = "inmediato" | "programado";
export type JobSource = "pedido" | "catalogo";
export type JobStatus =
  | "abierto"
  | "asignado"
  | "en_curso"
  | "por_confirmar"
  | "completado"
  | "cancelado"
  | "expirado";

export type PaymentMethod = "yape" | "plin" | "tarjeta";

export interface Payment {
  method: PaymentMethod;
  amount: number;
  status: "retenido" | "liberado";
  at: string;
}

export interface Message {
  id: string;
  from: Role | "sistema";
  text: string;
  at: string;
}

export interface Job {
  id: string;
  clientId: string;
  subcategoryId: string;
  title: string;
  description: string;
  photoCount: number;
  mode: JobMode;
  scheduledAt?: string;
  createdAt: string;
  expiresAt?: string;
  district: string;
  address: string;
  budget: number;
  laborOnly: boolean;
  wantsVisit: boolean;
  status: JobStatus;
  source: JobSource;
  serviceId?: string;
  workerId?: string;
  agreedPrice?: number;
  offers: Offer[];
  payment?: Payment;
  messages: Message[];
  clientReviewed: boolean;
  workerReviewed: boolean;
  completedAt?: string;
}
