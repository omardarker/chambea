import type { Client } from "../types";

export const clients: Client[] = [
  { id: "c-me", name: "Omar Gutiérrez", hue: 205, district: "Miraflores", rating: 4.9, reviewCount: 14, memberSince: "2024-02", jobsHired: 17 },
  { id: "c-lucia", name: "Lucía Benavides", hue: 20, district: "Surco", rating: 4.8, reviewCount: 9, memberSince: "2024-05", jobsHired: 11 },
  { id: "c-renzo", name: "Renzo Paz", hue: 280, district: "San Borja", rating: 4.6, reviewCount: 5, memberSince: "2024-09", jobsHired: 6 },
  { id: "c-carmen", name: "Carmen Yupanqui", hue: 340, district: "Los Olivos", rating: 5, reviewCount: 3, memberSince: "2025-01", jobsHired: 3 },
  { id: "c-mateo", name: "Mateo Villanueva", hue: 95, district: "La Molina", rating: 4.7, reviewCount: 7, memberSince: "2024-03", jobsHired: 9 },
  { id: "c-ines", name: "Inés Cárdenas", hue: 165, district: "Jesús María", rating: 4.9, reviewCount: 12, memberSince: "2023-11", jobsHired: 15 },
  { id: "c-bruno", name: "Bruno Salcedo", hue: 45, district: "San Isidro", rating: 4.3, reviewCount: 4, memberSince: "2025-03", jobsHired: 4 },
  { id: "c-daniela", name: "Daniela Cueva", hue: 300, district: "Barranco", rating: 4.8, reviewCount: 6, memberSince: "2024-08", jobsHired: 8 },
];

export const currentClientId = "c-me";

const map = new Map(clients.map((c) => [c.id, c]));
export function getClient(id: string): Client | undefined {
  return map.get(id);
}
