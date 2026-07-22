const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Helper to perform HTTP GET requests returning JSON, guaranteed to always resolve
function fetchJSON(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 6000
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode !== 200 && res.statusCode !== 206) {
        resolve({ success: false, error: `HTTP ${res.statusCode}` });
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ success: true, data: JSON.parse(data) });
        } catch (e) {
          resolve({ success: false, error: 'JSON Parse Error' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Function to extract active ingredient dynamically from VTEX custom properties
function extractActiveIngredient(product) {
  for (const key in product) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes("princ") || keyLower.includes("ativo") || keyLower.includes("substan")) {
      const val = product[key];
      if (Array.isArray(val) && val.length > 0) {
        return val[0];
      } else if (typeof val === "string" && val.trim()) {
        return val.trim();
      }
    }
  }
  return "Princípio Ativo Não Especificado";
}

// Score a product's title matching quality for query string
function scoreProduct(productName, query) {
  const nameLower = productName.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  
  if (nameLower === queryLower) return 1000;
  
  if (nameLower.includes(queryLower)) {
    return 500 - (nameLower.length - queryLower.length);
  }
  
  let wordsMatched = 0;
  queryWords.forEach(word => {
    if (nameLower.includes(word)) {
      wordsMatched++;
    }
  });
  
  if (wordsMatched === 0) return 0;
  
  // If not all words match, penalize heavily
  if (wordsMatched < queryWords.length) {
    return wordsMatched * 10;
  }
  
  return 100 + (wordsMatched * 20) - nameLower.length;
}

// Function to determine category from VTEX path or title
function determineCategory(product) {
  if (product.categories && product.categories.length > 0) {
    const path = product.categories[0].toLowerCase();
    if (path.includes("remedio") || path.includes("medicamento") || path.includes("generico")) {
      return "Medicamento";
    }
    if (path.includes("cosmetico") || path.includes("beleza") || path.includes("skincare") || path.includes("protetor")) {
      return "Cosmético";
    }
    if (path.includes("higiene") || path.includes("desodorante") || path.includes("sabonete")) {
      return "Higiene";
    }
  }
  return "Saúde";
}

// Main Search API handler
async function handleSearch(query, res) {
  const cleanQuery = query.trim();
  const isBarcode = /^\d{8,14}$/.test(cleanQuery); // Match standard barcodes (EAN-8, UPC, EAN-13)

  // Configure endpoints
  const endpoints = {
    drogariasaopaulo: isBarcode
      ? `https://www.drogariasaopaulo.com.br/api/catalog_system/pub/products/search?fq=alternateIds_Ean:${cleanQuery}`
      : `https://www.drogariasaopaulo.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(cleanQuery)}`,
    pacheco: isBarcode
      ? `https://www.drogariaspacheco.com.br/api/catalog_system/pub/products/search?fq=alternateIds_Ean:${cleanQuery}`
      : `https://www.drogariaspacheco.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(cleanQuery)}`,
    paguemenos: isBarcode
      ? `https://www.paguemenos.com.br/api/catalog_system/pub/products/search?fq=alternateIds_Ean:${cleanQuery}`
      : `https://www.paguemenos.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(cleanQuery)}`
  };

  console.log(`[Search] Query: "${cleanQuery}" | Type: ${isBarcode ? 'EAN' : 'Text'}`);

  // Execute VTEX searches in parallel
  const keys = Object.keys(endpoints);
  const promises = keys.map(key => fetchJSON(endpoints[key]));
  const results = await Promise.all(promises);

  let baseProduct = null;
  const realPrices = [];

  // Parse results
  const pharmacyPricesMap = {};

  keys.forEach((key, index) => {
    const res = results[index];
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      let product = res.data[0];
      
      // If it's a text search, score the items and choose the best match
      if (!isBarcode) {
        const scored = res.data.map(p => ({
          p,
          score: scoreProduct(p.productName, cleanQuery)
        })).sort((a, b) => b.score - a.score);
        
        if (scored[0] && scored[0].score >= 20) {
          product = scored[0].p;
        }
      }
      
      // Save the best successful product found as our base metadata template
      if (!baseProduct) {
        baseProduct = product;
      } else if (!isBarcode) {
        // If we already have a baseProduct, let's see if this chain's best product matches the query even better!
        const existingScore = scoreProduct(baseProduct.productName, cleanQuery);
        const currentScore = scoreProduct(product.productName, cleanQuery);
        if (currentScore > existingScore) {
          baseProduct = product; // Upgrade template to a better matches
        }
      }

      const sku = product.items && product.items[0];
      const seller = sku && sku.sellers && sku.sellers[0];
      const offer = seller && seller.commertialOffer;

      if (offer) {
        const currentPrice = offer.Price;
        const originalPrice = offer.ListPrice || currentPrice;
        const hasDiscount = originalPrice > currentPrice;
        const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
        const stock = offer.AvailableQuantity > 0 ? "Disponível" : "Sem Estoque";

        pharmacyPricesMap[key] = {
          currentPrice: parseFloat(currentPrice.toFixed(2)),
          originalPrice: parseFloat(originalPrice.toFixed(2)),
          hasDiscount,
          discountPercent,
          stockStatus: stock
        };

        if (stock === "Disponível") {
          realPrices.push(currentPrice);
        }
      }
    }
  });

  // If no pharmacy returned products, let frontend handle mock fallback
  if (!baseProduct) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ found: false, message: 'Product not found in live catalogs' }));
    return;
  }

  // Calculate stats
  const averagePrice = realPrices.length > 0
    ? realPrices.reduce((a, b) => a + b, 0) / realPrices.length
    : baseProduct.items[0].sellers[0].commertialOffer.Price || 25.0; // fallback if all out of stock

  // Format standard response
  const responseData = {
    found: true,
    barcode: baseProduct.items[0].ean || cleanQuery,
    name: baseProduct.productName,
    brand: baseProduct.brand,
    category: determineCategory(baseProduct),
    subCategory: "Tempo Real",
    activeIngredient: extractActiveIngredient(baseProduct),
    description: baseProduct.description || "Descrição em tempo real.",
    prices: []
  };

  // Define details for all 6 pharmacies (including simulated ones)
  const pharmacies = [
    { id: "drogasil", name: "Drogasil", brandColor: "#d32f2f", priceMult: 1.03, distance: 1.2, fee: 4.90, time: "30 - 60 min", isSimulated: true },
    { id: "drogaraia", name: "Droga Raia", brandColor: "#00875a", priceMult: 1.04, distance: 0.8, fee: 5.90, time: "20 - 40 min", isSimulated: true },
    { id: "drogariasaopaulo", name: "Drogaria São Paulo", brandColor: "#004b8d", distance: 2.1, fee: 3.50, time: "45 - 90 min", isSimulated: false },
    { id: "pacheco", name: "Drogaria Pacheco", brandColor: "#e53935", distance: 2.5, fee: 3.90, time: "40 - 80 min", isSimulated: false },
    { id: "paguemenos", name: "Pague Menos", brandColor: "#0d47a1", distance: 3.4, fee: 2.90, time: "50 - 100 min", isSimulated: false },
    { id: "panvel", name: "Panvel", brandColor: "#002f6c", priceMult: 1.01, distance: 1.7, fee: 4.50, time: "30 - 50 min", isSimulated: true }
  ];

  // Build price comparisons
  pharmacies.forEach(ph => {
    let priceData = pharmacyPricesMap[ph.id];

    if (ph.isSimulated || !priceData) {
      // Generate realistic price based on average real price
      const mult = ph.priceMult || 1.0;
      // Add slight jitter (-2% to +2%)
      const jitter = 0.98 + (Math.random() * 0.04);
      const computedPrice = averagePrice * mult * jitter;
      
      const hasDiscount = Math.random() > 0.4;
      const discountPercent = hasDiscount ? Math.floor(Math.random() * 20 + 5) : 0;
      const originalPrice = hasDiscount ? computedPrice * (1 + (discountPercent/100)) : computedPrice;

      priceData = {
        currentPrice: parseFloat(computedPrice.toFixed(2)),
        originalPrice: parseFloat(originalPrice.toFixed(2)),
        hasDiscount,
        discountPercent,
        stockStatus: "Disponível"
      };
    }

    responseData.prices.push({
      pharmacyId: ph.id,
      pharmacyName: ph.name,
      brandColor: ph.brandColor,
      originalPrice: priceData.originalPrice,
      currentPrice: priceData.currentPrice,
      discountPercent: priceData.discountPercent,
      hasDiscount: priceData.hasDiscount,
      stockStatus: priceData.stockStatus,
      deliveryFee: ph.fee,
      deliveryTime: ph.time,
      distance: ph.distance,
      buyUrl: `https://www.google.com/search?q=${encodeURIComponent(ph.name + ' ' + responseData.name)}`
    });
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responseData));
}

// HTTP Server definition
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/api/search') {
    const q = parsedUrl.query.q;
    if (!q) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
      return;
    }
    handleSearch(q, res);
  } else if (parsedUrl.pathname === '/api/suggest') {
    const q = parsedUrl.query.q || '';
    if (!q || q.trim().length < 3) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
      return;
    }
    const cleanQuery = q.trim();
    // Query Pague Menos search to get quick name and EAN suggestions
    const url = `https://www.paguemenos.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(cleanQuery)}`;
    fetchJSON(url).then(fetchRes => {
      if (fetchRes.success && Array.isArray(fetchRes.data)) {
        const suggestions = fetchRes.data.slice(0, 6).map(item => {
          const sku = item.items && item.items[0];
          return {
            name: item.productName,
            ean: sku ? sku.ean : null,
            brand: item.brand
          };
        }).filter(item => item.name && item.ean);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(suggestions));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      }
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
  } else if (parsedUrl.pathname === '/api/shutdown') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server shutting down' }));
    console.log('[FarmaCompare Backend] Shutdown requested. Exiting...');
    setTimeout(() => { process.exit(0); }, 500); // exit after short delay to finish response
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[FarmaCompare Backend] Running on http://localhost:${PORT}`);
});
