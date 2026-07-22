const CITIES_DATABASE = {
  "nacional": {
    name: "Nacional (Redes Padrão)",
    pharmacies: [
      { id: "drogasil", name: "Drogasil", address: "Rede Nacional - Lojas Principais", priceFactor: 1.0, deliveryFee: 4.90, deliveryTime: "30 - 60 min", distance: 1.2, isSimulated: true },
      { id: "drogaraia", name: "Droga Raia", address: "Rede Nacional - Lojas Principais", priceFactor: 1.02, deliveryFee: 5.90, deliveryTime: "20 - 40 min", distance: 0.8, isSimulated: true },
      { id: "drogariasaopaulo", name: "Drogaria São Paulo", address: "Rede Nacional - Lojas Principais", priceFactor: 0.97, deliveryFee: 3.50, deliveryTime: "45 - 90 min", distance: 2.1, isSimulated: false },
      { id: "pacheco", name: "Drogaria Pacheco", address: "Rede Nacional - Lojas Principais", priceFactor: 0.96, deliveryFee: 3.90, deliveryTime: "40 - 80 min", distance: 2.5, isSimulated: false },
      { id: "paguemenos", name: "Pague Menos", address: "Rede Nacional - Lojas Principais", priceFactor: 0.95, deliveryFee: 2.90, deliveryTime: "50 - 100 min", distance: 3.4, isSimulated: false },
      { id: "panvel", name: "Panvel", address: "Rede Nacional - Lojas Principais", priceFactor: 0.98, deliveryFee: 4.50, deliveryTime: "30 - 50 min", distance: 1.7, isSimulated: true }
    ]
  },
  "teresina": {
    name: "Teresina - PI",
    pharmacies: [
      { id: "drogasil", name: "Drogasil", address: "Av. Dom Severino, 1020 - Fátima, Teresina - PI", priceFactor: 1.0, deliveryFee: 3.90, deliveryTime: "25 - 45 min", distance: 1.1, isSimulated: true },
      { id: "paguemenos", name: "Pague Menos", address: "Av. Frei Serafim, 2100 - Centro, Teresina - PI", priceFactor: 0.95, deliveryFee: 2.50, deliveryTime: "20 - 35 min", distance: 0.6, isSimulated: false },
      { id: "drogariaglobo", name: "Drogaria Globo", address: "Av. Nossa Senhora de Fátima, 800 - Jóquei, Teresina - PI", priceFactor: 0.95, deliveryFee: 2.90, deliveryTime: "20 - 40 min", distance: 1.3, isSimulated: false, usesRealPriceOf: "paguemenos" },
      { id: "galeno", name: "Farmácia Galeno", address: "Rua Álvaro Mendes, 980 - Centro, Teresina - PI", priceFactor: 0.97, deliveryFee: 3.00, deliveryTime: "30 - 50 min", distance: 1.8, isSimulated: true, usesRealPriceOf: "paguemenos" }
    ]
  },
  "presdutra": {
    name: "Presidente Dutra - MA",
    pharmacies: [
      { id: "paguemenos", name: "Pague Menos", address: "Av. Pres. José Sarney, 450 - Centro, Pres. Dutra - MA", priceFactor: 0.95, deliveryFee: 1.90, deliveryTime: "15 - 25 min", distance: 0.3, isSimulated: false },
      { id: "drogariaglobo", name: "Drogaria Globo", address: "Praça São Sebastião, 88 - Centro, Pres. Dutra - MA", priceFactor: 0.95, deliveryFee: 2.00, deliveryTime: "15 - 30 min", distance: 0.5, isSimulated: false, usesRealPriceOf: "paguemenos" },
      { id: "saojose", name: "Farmácia São José", address: "Rua do Comércio, 120 - Centro, Pres. Dutra - MA", priceFactor: 0.93, deliveryFee: 0.00, deliveryTime: "10 - 20 min", distance: 0.2, isSimulated: true, usesRealPriceOf: "paguemenos" },
      { id: "trabalhador", name: "Farmácia do Trabalhador", address: "Av. Tancredo Neves, 15 - Centro, Pres. Dutra - MA", priceFactor: 0.94, deliveryFee: 2.50, deliveryTime: "15 - 35 min", distance: 0.8, isSimulated: true, usesRealPriceOf: "paguemenos" }
    ]
  },
  "codo": {
    name: "Codó - MA",
    pharmacies: [
      { id: "paguemenos", name: "Pague Menos", address: "Av. Augusto Teixeira, 1850 - Centro, Codó - MA", priceFactor: 0.95, deliveryFee: 1.90, deliveryTime: "15 - 30 min", distance: 0.4, isSimulated: false },
      { id: "drogariaglobo", name: "Drogaria Globo", address: "Rua Afonso Pena, 432 - Centro, Codó - MA", priceFactor: 0.96, deliveryFee: 2.00, deliveryTime: "20 - 35 min", distance: 0.7, isSimulated: false, usesRealPriceOf: "paguemenos" },
      { id: "saojose", name: "Farmácia São José", address: "Av. Santos Dumont, 87 - Centro, Codó - MA", priceFactor: 0.93, deliveryFee: 1.00, deliveryTime: "10 - 25 min", distance: 0.3, isSimulated: true, usesRealPriceOf: "paguemenos" },
      { id: "dopovo", name: "Farmácia do Povo", address: "Rua Renato Archer, 102 - Centro, Codó - MA", priceFactor: 0.94, deliveryFee: 2.50, deliveryTime: "20 - 40 min", distance: 0.9, isSimulated: true, usesRealPriceOf: "paguemenos" }
    ]
  }
};

// Unified Brand styles and SVG Logos
const PHARMACY_BRANDS = {
  drogasil: {
    brandColor: "#d32f2f",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#d32f2f"/>
      <path d="M50 20 V80 M20 50 H80" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="10" fill="#d32f2f"/>
    </svg>`
  },
  drogaraia: {
    brandColor: "#00875a",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#00875a"/>
      <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="#ffffff"/>
      <path d="M50 35 V65 M35 50 H65" stroke="#00875a" stroke-width="8" stroke-linecap="round"/>
    </svg>`
  },
  drogariasaopaulo: {
    brandColor: "#004b8d",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#004b8d"/>
      <path d="M30 30 H70 V45 H30 Z" fill="#e53935"/>
      <path d="M30 55 H70 V70 H30 Z" fill="#ffffff"/>
      <circle cx="50" cy="50" r="15" fill="#ffffff" stroke="#004b8d" stroke-width="4"/>
      <path d="M50 42 V58 M42 50 H58" stroke="#e53935" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  pacheco: {
    brandColor: "#e53935",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#e53935"/>
      <circle cx="50" cy="50" r="30" fill="#ffffff"/>
      <path d="M50 30 V70 M30 50 H70" stroke="#e53935" stroke-width="10" stroke-linecap="round"/>
      <path d="M50 40 V60 M40 50 H60" stroke="#0d47a1" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  paguemenos: {
    brandColor: "#0d47a1",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#0d47a1"/>
      <path d="M50 15 L85 35 V70 L50 90 L15 70 V35 Z" fill="#ffd54f"/>
      <path d="M50 25 L75 40 V65 L50 80 L25 65 V40 Z" fill="#0d47a1"/>
      <path d="M50 35 V70 M32 52 H68" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    </svg>`
  },
  panvel: {
    brandColor: "#002f6c",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#002f6c"/>
      <path d="M30 40 C30 25, 70 25, 70 40 C70 55, 30 55, 30 70 C30 85, 70 85, 70 70" fill="none" stroke="#ff7043" stroke-width="12" stroke-linecap="round"/>
      <path d="M50 25 V45 M40 35 H60" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  },
  drogariaglobo: {
    brandColor: "#00a896",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#00a896"/>
      <circle cx="50" cy="50" r="30" fill="#ffffff"/>
      <path d="M38 35 C38 35, 55 20, 65 32 C75 44, 45 65, 45 65 L38 52 Z" fill="none" stroke="#028090" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="53" cy="45" r="8" fill="#ffd54f"/>
    </svg>`
  },
  galeno: {
    brandColor: "#2a9d8f",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#2a9d8f"/>
      <path d="M35 70 C35 70, 30 40, 50 40 C70 40, 65 70, 65 70 Z" fill="#ffffff" stroke="#e76f51" stroke-width="4"/>
      <path d="M45 35 H55 V40 H45 Z" fill="#ffffff"/>
      <path d="M50 25 L50 35" stroke="#e76f51" stroke-width="6" stroke-linecap="round"/>
      <circle cx="50" cy="53" r="6" fill="#2a9d8f"/>
    </svg>`
  },
  saojose: {
    brandColor: "#9b2226",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#9b2226"/>
      <path d="M50 15 L80 40 V80 H20 V40 Z" fill="#ffffff"/>
      <path d="M50 42 V68 M37 55 H63" stroke="#9b2226" stroke-width="8" stroke-linecap="round"/>
    </svg>`
  },
  trabalhador: {
    brandColor: "#f4a261",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#f4a261"/>
      <circle cx="50" cy="50" r="28" fill="#ffffff"/>
      <path d="M38 58 L46 42 L54 58 M62 42 L62 58" stroke="#e76f51" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>`
  },
  dopovo: {
    brandColor: "#ae2012",
    logoSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect width="100" height="100" rx="20" fill="#ae2012"/>
      <path d="M35 50 C35 35, 65 35, 65 50 C65 65, 35 65, 35 80" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <circle cx="50" cy="30" r="10" fill="#ffffff"/>
    </svg>`
  }
};

// Legacy support: flat array generated from 'nacional'
const PHARMACIES = CITIES_DATABASE.nacional.pharmacies.map(p => {
  const brand = PHARMACY_BRANDS[p.id] || {};
  return {
    ...p,
    brandColor: brand.brandColor || "#000000",
    logoSvg: brand.logoSvg || ""
  };
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CITIES_DATABASE, PHARMACY_BRANDS, PHARMACIES };
}
