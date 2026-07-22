const MOCK_PRODUCTS = [
  {
    barcode: "7896094200424",
    name: "Dorflex 36 Comprimidos",
    brand: "Sanofi",
    category: "Medicamento",
    subCategory: "Analgesico",
    activeIngredient: "Dipirona Monoidratada + Citrato de Orfenadrina + Cafeína Anidra",
    basePrice: 19.90,
    image: "pill-dorflex",
    description: "Indicado no alívio da dor associada a contraturas musculares decorrentes de processos traumáticos ou inflamatórios."
  },
  {
    barcode: "7896094208888",
    name: "Neosaldina 30 Drágeas",
    brand: "Takeda",
    category: "Medicamento",
    subCategory: "Analgesico",
    activeIngredient: "Dipirona + Mucato de Isometepteno + Cafeína",
    basePrice: 28.50,
    image: "pill-neosaldina",
    description: "Medicamento com atividade analgésica e antiespasmódica, indicado para o tratamento de diversos tipos de dor de cabeça."
  },
  {
    barcode: "7891010708304",
    name: "Tylenol 750mg 20 Comprimidos",
    brand: "Kenvue",
    category: "Medicamento",
    subCategory: "Analgesico",
    activeIngredient: "Paracetamol",
    basePrice: 22.90,
    image: "pill-tylenol",
    description: "Indicado para a redução da febre e para o alívio temporário de dores leves a moderadas."
  },
  {
    barcode: "7896422401662",
    name: "Dipirona Monoidratada 500mg 10 Comprimidos Medley",
    brand: "Medley",
    category: "Medicamento",
    subCategory: "Generico",
    activeIngredient: "Dipirona Monoidratada",
    basePrice: 6.80,
    image: "pill-generic",
    description: "Medicamento genérico indicado para dor e febre."
  },
  {
    barcode: "7896026300765",
    name: "Buscopan Duplo 20 Comprimidos Revestidos",
    brand: "Boehringer Ingelheim",
    category: "Medicamento",
    subCategory: "Antiespasmodico",
    activeIngredient: "Butilbrometo de Escopolamina + Paracetamol",
    basePrice: 24.30,
    image: "pill-buscopan",
    description: "Indicado para o tratamento dos sintomas de cólicas, dores e desconforto na região do abdômen."
  },
  {
    barcode: "7891010574107",
    name: "Vick Vaporub Pomada 50g",
    brand: "Procter & Gamble",
    category: "Saude",
    subCategory: "Descongestionante",
    activeIngredient: "Levomentol + Cânfora + Óleo de Eucalipto",
    basePrice: 34.90,
    image: "cream-vick",
    description: "Alivia a tosse, a congestão nasal e o mal-estar muscular característicos dos resfriados."
  },
  {
    barcode: "7899706179455",
    name: "Protetor Solar Anthelios UVMune 400 FPS60 50ml",
    brand: "La Roche-Posay",
    category: "Cosmetico",
    subCategory: "Protecao Solar",
    activeIngredient: "Filtros Solares de Alta Proteção",
    basePrice: 94.90,
    image: "sunscreen-laroche",
    description: "Oferece proteção muito alta contra os raios UVA, UVB e ultra-longos, prevenindo o envelhecimento precoce."
  },
  {
    barcode: "7899706157149",
    name: "Creme Hidratante CeraVe 454g",
    brand: "CeraVe",
    category: "Cosmetico",
    subCategory: "Hidratante",
    activeIngredient: "3 Ceramidas Essenciais + Ácido Hialurônico",
    basePrice: 119.90,
    image: "cream-cerave",
    description: "Ajuda a restaurar a barreira protetora da pele do corpo e do rosto, proporcionando hidratação por 24 horas."
  },
  {
    barcode: "7891150031850",
    name: "Desodorante Antitranspirante Rexona Clinical Men 48g",
    brand: "Unilever",
    category: "Higiene",
    subCategory: "Desodorante",
    activeIngredient: "Tetraclorohidrex de Alumínio e Zircônio GLY",
    basePrice: 29.90,
    image: "deodorant-rexona",
    description: "Garante proteção máxima contra a transpiração excessiva e o odor por até 96 horas."
  }
];

// Helper to generate deterministic pseudo-random values based on a string seed
function seedRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Generate prices for a product across all pharmacies in a consistent way
function generatePrices(product, pharmacies) {
  const seed = product.barcode || product.name;
  const rand = seedRandom(seed);
  
  return pharmacies.map(pharmacy => {
    // Generate a variation percentage between -12% and +8%
    const variation = (rand() * 0.20) - 0.12; 
    const factor = pharmacy.priceFactor * (1 + variation);
    let originalPrice = product.basePrice * factor;
    
    // Sometimes there is a discount
    const hasDiscount = rand() > 0.4;
    const discountPercent = hasDiscount ? Math.round((rand() * 0.25 + 0.05) * 100) / 100 : 0;
    const currentPrice = originalPrice * (1 - discountPercent);

    // Stock availability
    const stockStatus = rand() > 0.15 ? "Disponível" : "Sem Estoque";

    return {
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      brandColor: pharmacy.brandColor,
      logoSvg: pharmacy.logoSvg,
      originalPrice: parseFloat(originalPrice.toFixed(2)),
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      discountPercent: Math.round(discountPercent * 100),
      hasDiscount: hasDiscount && discountPercent > 0,
      stockStatus: stockStatus,
      deliveryFee: pharmacy.deliveryFee,
      deliveryTime: pharmacy.deliveryTime,
      distance: parseFloat((pharmacy.distance * (0.8 + rand() * 0.4)).toFixed(1)), // random distance variation
      buyUrl: pharmacy.urlTemplate.replace("{query}", encodeURIComponent(product.name))
    };
  });
}

// Dynamically generate a product if searched by a barcode not in our list
function getOrCreateProduct(query, pharmacies) {
  const trimmed = query.trim();
  const isBarcode = /^\d+$/.test(trimmed);
  
  let product = MOCK_PRODUCTS.find(p => p.barcode === trimmed);
  
  if (!product && !isBarcode) {
    // Try substring matching on name
    product = MOCK_PRODUCTS.find(p => p.name.toLowerCase().includes(trimmed.toLowerCase()) || 
                                     p.activeIngredient.toLowerCase().includes(trimmed.toLowerCase()));
  }
  
  if (!product) {
    const rand = seedRandom(trimmed);
    // Create a dynamic product
    if (isBarcode) {
      // Barcode lookup fallback
      const catRand = rand();
      let category = "Medicamento";
      let brand = "Genérico";
      let name = `Medicamento Cód. ${trimmed}`;
      let basePrice = 15.00 + (rand() * 85.00); // 15 to 100 reais
      let activeIngredient = "Princípio Ativo Simulado";
      let image = "pill-generic";
      
      if (catRand > 0.7) {
        category = "Cosmético";
        brand = "SkinCare Labs";
        name = `Produto de Cuidado da Pele EAN-${trimmed.substring(trimmed.length - 4)}`;
        basePrice = 45.00 + (rand() * 150.00);
        activeIngredient = "Fórmula Antioxidante e Hidratante";
        image = "cream-generic";
      } else if (catRand > 0.5) {
        category = "Saúde";
        brand = "Wellness Co.";
        name = `Suplemento Vitamínico EAN-${trimmed.substring(trimmed.length - 4)}`;
        basePrice = 30.00 + (rand() * 60.00);
        activeIngredient = "Complexo de Vitaminas & Minerais";
        image = "pill-vitamins";
      }
      
      product = {
        barcode: trimmed,
        name: name,
        brand: brand,
        category: category,
        subCategory: "Genérico",
        activeIngredient: activeIngredient,
        basePrice: parseFloat(basePrice.toFixed(2)),
        image: image,
        description: `Produto gerado automaticamente a partir do código de barras ${trimmed} para demonstração comparativa.`
      };
    } else {
      // Text search fallback
      product = {
        barcode: "789" + Math.floor(1000000000 + rand() * 9000000000),
        name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        brand: "Laboratório Virtual",
        category: "Medicamento",
        subCategory: "Pesquisa",
        activeIngredient: "Princípio Ativo Não Encontrado",
        basePrice: parseFloat((10.00 + rand() * 90.00).toFixed(2)),
        image: "pill-generic",
        description: `Resultado para busca: "${trimmed}". Preços simulados para fins de demonstração.`
      };
    }
  }

  // Generate prices across pharmacies
  const prices = generatePrices(product, pharmacies);
  
  return {
    ...product,
    prices: prices
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MOCK_PRODUCTS, getOrCreateProduct };
}
