import type { Review } from "../types";

/** Reseñas históricas: lo que los clientes dicen de cada trabajador y viceversa. */
const raw: Array<[workerId: string, clientId: string, rating: number, text: string, daysAgo: number, sub: string, backText?: string]> = [
  ["w-jorge", "c-lucia", 5, "Llegó puntual, explicó qué estaba mal y me mostró la pieza que cambió. Dejó todo limpio.", 6, "gasfiteria", "Cliente clara con lo que necesitaba, pago inmediato."],
  ["w-jorge", "c-renzo", 5, "Instaló la terma en menos de dos horas. Me recomendó una llave térmica que no sabía que necesitaba.", 19, "gasfiteria", "Todo bien, muy amable."],
  ["w-jorge", "c-ines", 4, "Buen trabajo, aunque llegó 20 minutos tarde. Avisó por chat, eso se agradece.", 33, "electricidad"],
  ["w-jorge", "c-mateo", 5, "Tercera vez que lo contrato. Es mi gasfitero de cabecera ya.", 51, "gasfiteria", "Cliente de confianza, siempre tiene todo listo."],
  ["w-jorge", "c-daniela", 5, "Resolvió una fuga que otros dos no encontraron.", 80, "gasfiteria"],
  ["w-rosa", "c-me", 5, "Súper rápida y ordenada. Cambió la mezcladora y revisó las demás llaves sin cobrar extra.", 12, "gasfiteria", "Trato excelente, dejó el baño libre para trabajar."],
  ["w-rosa", "c-mateo", 5, "Vino un domingo. Precio justo.", 40, "gasfiteria"],
  ["w-rosa", "c-bruno", 4, "Bien, aunque el repuesto tardó un día en llegar.", 62, "gasfiteria", "El cliente cambió la hora dos veces."],
  ["w-cesar", "c-carmen", 5, "Hizo el pozo a tierra con certificado, muy profesional. Dejó el jardín como estaba.", 15, "electricidad", "Muy buena cliente, hasta nos invitó almuerzo."],
  ["w-cesar", "c-renzo", 4, "Buen trabajo en el tablero. Comunicación algo lenta.", 44, "electricidad"],
  ["w-luis", "c-me", 5, "Abrió la puerta en 10 minutos sin romper nada. Salvador.", 25, "cerrajeria", "Pago al toque, buena onda."],
  ["w-luis", "c-ines", 5, "Llegó en 15 minutos a las 11 de la noche.", 70, "cerrajeria"],
  ["w-ana", "c-lucia", 5, "La mampara quedó perfecta, parece de revista. Cumplió la fecha.", 28, "vidrieria", "Clienta puntual y decidida."],
  ["w-ana", "c-mateo", 5, "Ventanas nuevas en toda la casa. Trabajo fino.", 90, "vidrieria"],
  ["w-pedro", "c-daniela", 5, "Instaló el punto de gas para la secadora, con prueba y todo. Muy seguro.", 22, "gas", "Cliente excelente."],
  ["w-diego", "c-renzo", 5, "Las cámaras se ven desde el celular, me enseñó con paciencia.", 9, "cctv", "Sabía lo que quería, fácil de coordinar."],
  ["w-diego", "c-bruno", 4, "Buen trabajo, un poco más caro que otros pero lo vale.", 48, "cctv"],
  ["w-karla", "c-ines", 5, "Me asesoró con las telas y los rollers quedaron a nivel. Volvería a contratar.", 17, "cortinas"],
  ["w-marcos", "c-carmen", 5, "Hizo el tabique y el tarrajeo en dos días, cuadrilla seria.", 35, "albanileria", "Clienta ordenada, materiales listos."],
  ["w-marcos", "c-mateo", 4, "Buen trabajo, un poco de polvo quedó. Precio correcto.", 100, "enchapes"],
  ["w-elena", "c-me", 5, "Cielo raso con luces en la sala, quedó espectacular. Sin polvo como prometió.", 60, "drywall", "Muy buen cliente, sabe lo que quiere."],
  ["w-elena", "c-lucia", 5, "Dividió la oficina en casa en un día.", 95, "drywall"],
  ["w-victor", "c-daniela", 5, "Piso SPC en todo el depa, ni una junta abierta.", 30, "pisos", "Excelente clienta."],
  ["w-victor", "c-renzo", 5, "Puntual, rápido, limpio.", 75, "pisos"],
  ["w-sandra", "c-ines", 5, "Filos perfectos, me ayudó a elegir el color. Dejó todo tapado y limpio.", 14, "pintura", "Clienta encantadora."],
  ["w-sandra", "c-bruno", 4, "Bien, aunque tardó un día más de lo acordado.", 55, "pintura", "El cliente pidió cambios de color a mitad del trabajo."],
  ["w-raul", "c-lucia", 5, "El closet quedó idéntico al 3D. Instalación limpia.", 38, "melamina", "Clienta clara y puntual con los pagos."],
  ["w-raul", "c-mateo", 5, "Repostero completo, buena calidad de herrajes.", 110, "melamina"],
  ["w-walter", "c-me", 4, "Restauró la mesa de mis abuelos con mucho cariño. Tardó más de lo dicho.", 85, "carpinteria", "Paciente, buen cliente."],
  ["w-hector", "c-carmen", 5, "Rejas firmes y bien pintadas. Cumplió la fecha.", 45, "herreria"],
  ["w-julio", "c-daniela", 5, "La terraza ya no filtra al vecino. Dio garantía por escrito.", 20, "impermeabilizacion", "Muy buena clienta."],
  ["w-maria", "c-me", 5, "La terraza quedó preciosa y gasta poca agua. Viene cada mes.", 7, "jardineria", "Cliente de confianza, siempre puntual."],
  ["w-maria", "c-lucia", 5, "Diseño hermoso y plantas que sí sobreviven.", 65, "jardineria"],
  ["w-tomas", "c-carmen", 4, "Cortó el grass y podó rápido. Precio justo.", 11, "jardineria"],
  ["w-gloria", "c-ines", 5, "Fumigaron el edificio completo con certificado. Muy ordenados.", 27, "fumigacion", "Administración del edificio muy organizada."],
  ["w-gloria", "c-bruno", 5, "Se acabaron las cucarachas. Volvieron a revisar sin costo.", 58, "fumigacion"],
  ["w-andres", "c-me", 5, "TV de 65 en pared de drywall, sin cables a la vista. Rapidísimo.", 42, "tv", "Buen cliente."],
  ["w-andres", "c-renzo", 5, "Instaló lavadora y campana el mismo día.", 88, "artefactos"],
  ["w-paola", "c-mateo", 5, "Instaló dos splits en una mañana, todo prolijo.", 16, "artefactos", "Excelente cliente."],
  ["w-felipe", "c-carmen", 4, "Cambió la chapa rápido. Buen precio.", 23, "cerrajeria"],
  ["w-nancy", "c-lucia", 5, "Baño en gran formato, filos a 45°, ni una pieza desnivelada.", 50, "enchapes", "Clienta exigente en el buen sentido."],
  ["w-oscar", "c-ines", 5, "Vino a las 11 p. m. por una fuga. Precio claro desde antes.", 5, "gasfiteria", "Clienta muy amable."],
  ["w-oscar", "c-bruno", 3, "Resolvió, pero el recargo nocturno me pareció alto.", 36, "gasfiteria", "El cliente discutió el precio acordado al final."],
];

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (days % 9), (days * 7) % 60, 0, 0);
  return d.toISOString();
}

export const seedReviews: Review[] = raw.flatMap(([workerId, clientId, rating, text, daysAgo, sub, backText], i) => {
  const jobId = `hist-${i}`;
  const list: Review[] = [
    { id: `r-${i}-c`, jobId, from: "cliente", fromId: clientId, toId: workerId, rating, text, date: daysAgoIso(daysAgo), subcategoryId: sub },
  ];
  if (backText) {
    list.push({ id: `r-${i}-w`, jobId, from: "trabajador", fromId: workerId, toId: clientId, rating: rating >= 4 ? 5 : 4, text: backText, date: daysAgoIso(daysAgo), subcategoryId: sub });
  }
  return list;
});

export function reviewsForWorker(workerId: string, all: Review[] = seedReviews): Review[] {
  return all.filter((r) => r.toId === workerId && r.from === "cliente").sort((a, b) => b.date.localeCompare(a.date));
}

export function reviewsForClient(clientId: string, all: Review[] = seedReviews): Review[] {
  return all.filter((r) => r.toId === clientId && r.from === "trabajador").sort((a, b) => b.date.localeCompare(a.date));
}
