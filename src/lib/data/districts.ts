export const districts = [
  "Miraflores",
  "San Isidro",
  "Barranco",
  "Surco",
  "San Borja",
  "La Molina",
  "Surquillo",
  "Jesús María",
  "Lince",
  "Magdalena",
  "Pueblo Libre",
  "San Miguel",
  "Breña",
  "Cercado de Lima",
  "La Victoria",
  "Chorrillos",
  "San Juan de Miraflores",
  "Villa El Salvador",
  "Ate",
  "Santa Anita",
  "San Juan de Lurigancho",
  "Los Olivos",
  "San Martín de Porres",
  "Independencia",
  "Comas",
  "Callao",
  "Rímac",
] as const;

export type District = (typeof districts)[number];

/** Zonas aproximadas para armar coberturas plausibles */
export const zones: Record<string, District[]> = {
  centroSur: ["Miraflores", "San Isidro", "Barranco", "Surquillo", "Lince", "Jesús María", "Magdalena", "Pueblo Libre", "San Miguel"],
  este: ["Surco", "San Borja", "La Molina", "Ate", "Santa Anita"],
  sur: ["Chorrillos", "San Juan de Miraflores", "Villa El Salvador", "Barranco", "Surco"],
  norte: ["Los Olivos", "San Martín de Porres", "Independencia", "Comas", "Rímac"],
  centro: ["Cercado de Lima", "Breña", "La Victoria", "Rímac", "Jesús María", "Lince"],
  callao: ["Callao", "San Miguel", "San Martín de Porres"],
  sjl: ["San Juan de Lurigancho", "Rímac", "Cercado de Lima"],
};
