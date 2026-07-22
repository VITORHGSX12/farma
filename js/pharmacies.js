const PHARMACIES = [
  {
    id: "drogasil",
    name: "Drogasil",
    brandColor: "#d32f2f",
    textColor: "#ffffff",
    priceFactor: 1.0, // Base factor for calculations
    deliveryFee: 4.90,
    deliveryTime: "30 - 60 min",
    distance: 1.2, // in km
    urlTemplate: "https://www.drogasil.com.br/search?w={query}",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#d32f2f"/>
      <path d="M50 20 V80 M20 50 H80" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="10" fill="#d32f2f"/>
    </svg>`
  },
  {
    id: "drogaraia",
    name: "Droga Raia",
    brandColor: "#00875a",
    textColor: "#ffffff",
    priceFactor: 1.02,
    deliveryFee: 5.90,
    deliveryTime: "20 - 40 min",
    distance: 0.8,
    urlTemplate: "https://www.drogaraia.com.br/search?w={query}",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#00875a"/>
      <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="#ffffff"/>
      <path d="M50 35 V65 M35 50 H65" stroke="#00875a" stroke-width="8" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "drogariasaopaulo",
    name: "Drogaria São Paulo",
    brandColor: "#004b8d",
    textColor: "#ffffff",
    priceFactor: 0.97,
    deliveryFee: 3.50,
    deliveryTime: "45 - 90 min",
    distance: 2.1,
    urlTemplate: "https://www.drogariasaopaulo.com.br/busca?termo={query}",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#004b8d"/>
      <path d="M30 30 H70 V45 H30 Z" fill="#e53935"/>
      <path d="M30 55 H70 V70 H30 Z" fill="#ffffff"/>
      <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="#004b8d" stroke-width="4"/>
      <path d="M50 42 V58 M42 50 H58" stroke="#e53935" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "pacheco",
    name: "Drogaria Pacheco",
    brandColor: "#e53935",
    textColor: "#ffffff",
    priceFactor: 0.96,
    deliveryFee: 3.90,
    deliveryTime: "40 - 80 min",
    distance: 2.5,
    urlTemplate: "https://www.drogariaspacheco.com.br/busca?termo={query}",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#e53935"/>
      <circle cx="50" cy="50" r="30" fill="#ffffff"/>
      <path d="M50 30 V70 M30 50 H70" stroke="#e53935" stroke-width="10" stroke-linecap="round"/>
      <path d="M50 40 V60 M40 50 H60" stroke="#0d47a1" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "paguemenos",
    name: "Pague Menos",
    brandColor: "#0d47a1",
    textColor: "#ffffff",
    priceFactor: 0.95,
    deliveryFee: 2.90,
    deliveryTime: "50 - 100 min",
    distance: 3.4,
    urlTemplate: "https://www.paguemenos.com.br/busca?q={query}",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#0d47a1"/>
      <path d="M50 15 L85 35 V70 L50 90 L15 70 V35 Z" fill="#ffd54f"/>
      <path d="M50 25 L75 40 V65 L50 80 L25 65 V40 Z" fill="#0d47a1"/>
      <path d="M50 35 V70 M32 52 H68" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "panvel",
    name: "Panvel",
    brandColor: "#002f6c",
    textColor: "#ffffff",
    priceFactor: 0.98,
    deliveryFee: 4.50,
    deliveryTime: "30 - 50 min",
    distance: 1.7,
    urlTemplate: "https://www.panvel.com/panvel/busca.do?termo={query}",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#002f6c"/>
      <path d="M30 40 C30 25, 70 25, 70 40 C70 55, 30 55, 30 70 C30 85, 70 85, 70 70" fill="none" stroke="#ff7043" stroke-width="12" stroke-linecap="round"/>
      <path d="M50 25 V45 M40 35 H60" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PHARMACIES;
}
