import type { Category, Subcategory } from "../types";

export const categories: Category[] = [
  {
    id: "instalaciones",
    name: "Instalaciones del hogar",
    tagline: "Lo que hace funcionar tu casa",
    subcategories: [
      { id: "gasfiteria", name: "Gasfitería", categoryId: "instalaciones", hint: "por punto o servicio" },
      { id: "electricidad", name: "Electricidad", categoryId: "instalaciones", hint: "por punto o servicio" },
      { id: "cerrajeria", name: "Cerrajería", categoryId: "instalaciones", hint: "por servicio" },
      { id: "vidrieria", name: "Vidriería y aluminio", categoryId: "instalaciones", short: "Vidriería", hint: "por m²" },
      { id: "gas", name: "Instalaciones de gas", categoryId: "instalaciones", short: "Gas", hint: "por punto" },
      { id: "cctv", name: "CCTV y alarmas", categoryId: "instalaciones", hint: "por cámara o kit" },
      { id: "cortinas", name: "Cortinas y persianas", categoryId: "instalaciones", short: "Cortinas", hint: "por ventana" },
    ],
  },
  {
    id: "construccion",
    name: "Construcción y acabados",
    tagline: "Obra, remodelación y terminaciones",
    subcategories: [
      { id: "albanileria", name: "Albañilería", categoryId: "construccion", hint: "por m² o día" },
      { id: "drywall", name: "Drywall", categoryId: "construccion", hint: "por m²" },
      { id: "pisos", name: "Pisos laminados y vinílicos", categoryId: "construccion", short: "Pisos", hint: "por m²" },
      { id: "pintura", name: "Pintura", categoryId: "construccion", hint: "por m²" },
      { id: "melamina", name: "Melamina", categoryId: "construccion", hint: "por mueble" },
      { id: "enchapes", name: "Enchapes y revestimientos", categoryId: "construccion", short: "Enchapes", hint: "por m²" },
      { id: "carpinteria", name: "Carpintería", categoryId: "construccion", hint: "por pieza" },
      { id: "herreria", name: "Herrería y soldadura", categoryId: "construccion", short: "Herrería", hint: "por pieza o metro" },
      { id: "impermeabilizacion", name: "Impermeabilización", categoryId: "construccion", short: "Impermeab.", hint: "por m²" },
    ],
  },
  {
    id: "mantenimiento",
    name: "Mantenimiento y montaje",
    tagline: "Pequeños trabajos, resueltos hoy",
    subcategories: [
      { id: "jardineria", name: "Jardinería", categoryId: "mantenimiento", hint: "por visita o m²" },
      { id: "fumigacion", name: "Fumigación", categoryId: "mantenimiento", hint: "por ambiente" },
      { id: "tv", name: "Instalación de TV en pared", categoryId: "mantenimiento", short: "TV en pared", hint: "por equipo" },
      { id: "artefactos", name: "Instalación de artefactos", categoryId: "mantenimiento", short: "Artefactos", hint: "por equipo" },
    ],
  },
];

export const subcategories: Subcategory[] = categories.flatMap((c) => c.subcategories);

const subMap = new Map(subcategories.map((s) => [s.id, s]));
const catMap = new Map(categories.map((c) => [c.id, c]));

export function getSubcategory(id: string): Subcategory {
  const s = subMap.get(id);
  if (!s) throw new Error(`Subcategoría desconocida: ${id}`);
  return s;
}

export function getCategory(id: string): Category {
  const c = catMap.get(id as Category["id"]);
  if (!c) throw new Error(`Categoría desconocida: ${id}`);
  return c;
}

export function categoryOfSub(subId: string): Category {
  return getCategory(getSubcategory(subId).categoryId);
}
