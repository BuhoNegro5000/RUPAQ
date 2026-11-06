export type HydrationCategory = 'fountain' | 'climate_refuge' | 'convenience';

export interface HydrationPoint {
  id: string;
  name: string;
  category: HydrationCategory;
  categoryLabel: string;
  district: string;
  address: string;
  lat: number;
  lon: number;
  description: string;
  isFree: boolean;
  hasPetsWater: boolean;
  hasAC: boolean;
  is24h: boolean;
  hasRestrooms: boolean;
  verifiedStatus: 'verified' | 'community' | 'user';
  osmUrl?: string;
  reportOkCount?: number;
}

export const INITIAL_HYDRATION_POINTS: HydrationPoint[] = [
  // Miraflores
  {
    id: 'mira-kennedy',
    name: 'Bebedero Parque Kennedy (Central)',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Miraflores',
    address: 'Parque Central de Miraflores, frente a Virgen Milagrosa',
    lat: -12.1219,
    lon: -77.0298,
    description: 'Bebedero de acero inoxidable con pulsador y caño inferior para mascotas. Operativo y con buena presión.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    osmUrl: 'https://www.openstreetmap.org/search?query=Parque%20Kennedy%20Miraflores',
    reportOkCount: 42
  },
  {
    id: 'mira-faro',
    name: 'Bebedero Faro de la Marina',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Miraflores',
    address: 'Malecón Cisneros / Parque Raimondi',
    lat: -12.1228,
    lon: -77.0384,
    description: 'Fuente de agua potable para deportistas y ciclistas en el malecón. Cuenta con caño de descarga directa.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    osmUrl: 'https://www.openstreetmap.org/search?query=Faro%20de%20la%20Marina%20Miraflores',
    reportOkCount: 38
  },
  {
    id: 'mira-amor',
    name: 'Bebedero Parque del Amor',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Miraflores',
    address: 'Malecón Balta, mirador sobre el acantilado',
    lat: -12.1257,
    lon: -77.0353,
    description: 'Bebedero público municipal en el recorrido peatonal del malecón con agua fresca.',
    isFree: true,
    hasPetsWater: false,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    osmUrl: 'https://www.openstreetmap.org/search?query=Parque%20del%20Amor%20Miraflores',
    reportOkCount: 29
  },
  {
    id: 'mira-larcomar',
    name: 'Larcomar - Refugio Climático',
    category: 'climate_refuge',
    categoryLabel: 'Refugio climatizado',
    district: 'Miraflores',
    address: 'Malecón de la Reserva 610',
    lat: -12.1317,
    lon: -77.0305,
    description: 'Centro comercial con aire acondicionado, áreas de descanso a la sombra, servicios higiénicos limpios y bebederos.',
    isFree: true,
    hasPetsWater: false,
    hasAC: true,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 65
  },
  {
    id: 'mira-reducto',
    name: 'Bebedero Parque Reducto N° 2',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Miraflores',
    address: 'Calle Ramón Ribeyro / Av. 15 de Enero',
    lat: -12.1285,
    lon: -77.0223,
    description: 'Parque arbolado con microclima fresco, bebedero municipal y abundante sombra natural.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 21
  },

  // San Isidro
  {
    id: 'si-olivar',
    name: 'Bosque El Olivar - Bebedero Central',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'San Isidro',
    address: 'Calle La República / Los Incas, cerca a la laguna',
    lat: -12.0995,
    lon: -77.0345,
    description: 'Bebedero público rodeado de cientos de olivos centenarios. Excelente sombra y temperatura hasta 2°C menor a la calle.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    osmUrl: 'https://www.openstreetmap.org/search?query=El%20Olivar%20San%20Isidro',
    reportOkCount: 51
  },
  {
    id: 'si-bicentenario',
    name: 'Parque Bicentenario San Isidro',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'San Isidro',
    address: 'Av. Godofredo García / Malecón de San Isidro',
    lat: -12.1062,
    lon: -77.0422,
    description: 'Bebedero de alta presión con pulsador metálico y vista a la bahía de Lima.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 33
  },
  {
    id: 'si-caceres',
    name: 'Parque Andrés Avelino Cáceres',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'San Isidro',
    address: 'Av. Andrés Reyes / Calle Las Begonias',
    lat: -12.0935,
    lon: -77.0255,
    description: 'En pleno centro financiero, punto de recarga de agua para trabajadores y transeúntes.',
    isFree: true,
    hasPetsWater: false,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 24
  },

  // Barranco
  {
    id: 'bar-parque',
    name: 'Bebedero Parque Municipal de Barranco',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Barranco',
    address: 'Av. Pedro de Osma / Av. Grau',
    lat: -12.1488,
    lon: -77.0211,
    description: 'Bebedero municipal operativo al costado de la pérgola central. Árboles altos y bancas bajo sombra.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 39
  },
  {
    id: 'bar-bajada',
    name: 'Malecón Paul Harris & Bajada de Baños',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Barranco',
    address: 'Malecón Paul Harris con Calle Sucre',
    lat: -12.1512,
    lon: -77.0232,
    description: 'Punto de hidratación para caminantes hacia la playa y el mirador del puente.',
    isFree: true,
    hasPetsWater: false,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 19
  },

  // San Borja
  {
    id: 'sb-pentagonito',
    name: 'Pentagonito - Parque de la Felicidad',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'San Borja',
    address: 'Av. San Borja Sur con Av. Boulevard',
    lat: -12.0978,
    lon: -76.9922,
    description: 'Puntos continuos de bebederos para deportistas a lo largo del circuito de trote de 4.1 km.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 77
  },
  {
    id: 'sb-aguas',
    name: 'Parque de las Aguas San Borja',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'San Borja',
    address: 'Calle Claudio Galeno con Joaquín Madrid',
    lat: -12.1035,
    lon: -76.998,
    description: 'Bebedero municipal con mantenimiento regular y caño especial para perros.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 28
  },

  // Santiago de Surco
  {
    id: 'surco-amistad',
    name: 'Parque de la Amistad',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Santiago de Surco',
    address: 'Av. Caminos del Inca cuadra 21',
    lat: -12.1402,
    lon: -76.9856,
    description: 'Espacio público con bebederos en zonas de pérgolas y servicios higiénicos accesibles.',
    isFree: true,
    hasPetsWater: false,
    hasAC: false,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 34
  },
  {
    id: 'surco-jockey',
    name: 'Jockey Plaza - Refugio Climático',
    category: 'climate_refuge',
    categoryLabel: 'Refugio climatizado',
    district: 'Santiago de Surco',
    address: 'Av. Javier Prado Este 4200',
    lat: -12.0864,
    lon: -76.9748,
    description: 'Gran complejo con múltiples zonas de aire acondicionado, dispensadores de agua en patio de comidas y baños públicos.',
    isFree: true,
    hasPetsWater: false,
    hasAC: true,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 88
  },

  // Lima Cercado / Centro Histórico
  {
    id: 'lim-centrocivico',
    name: 'Real Plaza Centro Cívico - Refugio Climático',
    category: 'climate_refuge',
    categoryLabel: 'Refugio climatizado',
    district: 'Lima',
    address: 'Av. Garcilaso de la Vega 1337',
    lat: -12.0573,
    lon: -77.0371,
    description: 'Refugio ideal en el centro de Lima con aire acondicionado, baños y supermercado para hidratación de bajo costo.',
    isFree: true,
    hasPetsWater: false,
    hasAC: true,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 92
  },
  {
    id: 'lim-exposicion',
    name: 'Parque de la Exposición (Fuentes y Caños)',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Lima',
    address: 'Av. 28 de Julio con Av. Garcilaso de la Vega',
    lat: -12.0621,
    lon: -77.036,
    description: 'Área verde extensa con puntos de agua y sombra densa para resguardarse del calor del asfalto del centro.',
    isFree: true,
    hasPetsWater: false,
    hasAC: false,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 46
  },

  // Jesús María
  {
    id: 'jm-marte',
    name: 'Campo de Marte - Circuito Atlético',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Jesús María',
    address: 'Av. De la Peruanidad s/n',
    lat: -12.0712,
    lon: -77.0415,
    description: 'Bebederos municipales ubicados cerca a la pista de trote y monumento central.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 54
  },
  {
    id: 'jm-salaverry',
    name: 'Real Plaza Salaverry - Refugio Climático',
    category: 'climate_refuge',
    categoryLabel: 'Refugio climatizado',
    district: 'Jesús María',
    address: 'Av. General Felipe Salaverry 2370',
    lat: -12.0898,
    lon: -77.0519,
    description: 'Espacio cerrado con climatización óptima, zonas de descanso y agua disponible en múltiples niveles.',
    isFree: true,
    hasPetsWater: false,
    hasAC: true,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 61
  },

  // San Miguel
  {
    id: 'sm-plazasanmiguel',
    name: 'Plaza San Miguel - Refugio Climático',
    category: 'climate_refuge',
    categoryLabel: 'Refugio climatizado',
    district: 'San Miguel',
    address: 'Av. La Marina 2000 con Av. Universitaria',
    lat: -12.0772,
    lon: -77.0805,
    description: 'Espacio climatizado de amplia escala para protegerse del sol, con baños y puntos de recarga.',
    isFree: true,
    hasPetsWater: false,
    hasAC: true,
    is24h: false,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 70
  },
  {
    id: 'sm-costanera',
    name: 'Bebedero Malecón Costanera San Miguel',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'San Miguel',
    address: 'Av. Costanera con Calle Diego Ferré',
    lat: -12.0886,
    lon: -77.0901,
    description: 'Punto de hidratación para deportistas del malecón con vista al mar y brisa constante.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 22
  },

  // Magdalena del Mar
  {
    id: 'mag-tupac',
    name: 'Plaza Túpac Amaru (Magdalena)',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Magdalena del Mar',
    address: 'Jr. Bolognesi con Jr. José Gálvez',
    lat: -12.0917,
    lon: -77.0703,
    description: 'Plaza central con bebedero municipal y árboles frondosos en el centro de Magdalena.',
    isFree: true,
    hasPetsWater: true,
    hasAC: false,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 27
  },

  // Chorrillos
  {
    id: 'cho-aguadulce',
    name: 'Bebedero y Caño Malecón Agua Dulce',
    category: 'fountain',
    categoryLabel: 'Bebedero público gratuito',
    district: 'Chorrillos',
    address: 'Paseo de la República / Playa Agua Dulce',
    lat: -12.1645,
    lon: -77.0268,
    description: 'Caños de agua potable y bebedero municipal a pasos de la zona de sombrillas.',
    isFree: true,
    hasPetsWater: false,
    hasAC: false,
    is24h: true,
    hasRestrooms: true,
    verifiedStatus: 'verified',
    reportOkCount: 35
  },

  // Tiendas de Conveniencia 24 Horas Estratégicas
  {
    id: 'conv-tambo-larco',
    name: 'Tambo+ 24h Miraflores Larco',
    category: 'convenience',
    categoryLabel: 'Tienda 24h',
    district: 'Miraflores',
    address: 'Av. José Larco 405',
    lat: -12.1235,
    lon: -77.0295,
    description: 'Atención 24 horas, botellas de agua fría económica, hielo y bebidas isotónicas con electrolitos.',
    isFree: false,
    hasPetsWater: false,
    hasAC: true,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 40
  },
  {
    id: 'conv-oxxo-conquistadores',
    name: 'OXXO 24h San Isidro Conquistadores',
    category: 'convenience',
    categoryLabel: 'Tienda 24h',
    district: 'San Isidro',
    address: 'Av. Conquistadores 600',
    lat: -12.1012,
    lon: -77.035,
    description: 'Recarga rápida de agua fría, bebidas hidratantes y snacks para reponer sales.',
    isFree: false,
    hasPetsWater: false,
    hasAC: true,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 31
  },
  {
    id: 'conv-tambo-grau',
    name: 'Tambo+ 24h Barranco Grau',
    category: 'convenience',
    categoryLabel: 'Tienda 24h',
    district: 'Barranco',
    address: 'Av. Almirante Miguel Grau 204',
    lat: -12.1465,
    lon: -77.0225,
    description: 'Abierto 24 horas para reabastecimiento de líquidos antes de bajar a los malecones.',
    isFree: false,
    hasPetsWater: false,
    hasAC: true,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 25
  },
  {
    id: 'conv-tambo-garcilaso',
    name: 'Tambo+ 24h Centro Cívico Garcilaso',
    category: 'convenience',
    categoryLabel: 'Tienda 24h',
    district: 'Lima',
    address: 'Av. Garcilaso de la Vega 1280',
    lat: -12.056,
    lon: -77.0365,
    description: 'Parada estratégica en el centro de Lima con agua purificada helada las 24 horas.',
    isFree: false,
    hasPetsWater: false,
    hasAC: true,
    is24h: true,
    hasRestrooms: false,
    verifiedStatus: 'verified',
    reportOkCount: 44
  }
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function getDirectionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
