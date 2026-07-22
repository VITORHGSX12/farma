// Configuração do servidor backend (Altere para a URL da nuvem se for hospedado externamente, ex: https://farmacompare.onrender.com)
const BACKEND_URL = "https://farma-7llj.onrender.com";

// State variables
let currentProduct = null;
let currentSort = "price"; // "price" | "distance" | "delivery"
let currentCity = "teresina"; // Selected city
let purchaseMode = "online"; // "online" | "presencial"
let displayedPrices = []; // List of prices currently displayed to calculate savings
let quantityMultiplier = 1;
let recentScans = [];

// Category SVGs to render product icons
const CATEGORY_SVGS = {
  Medicamento: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6M9 12h6" />
  </svg>`,
  Generico: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 7h10M7 12h10M7 17h6" />
  </svg>`,
  Cosmetico: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v1.242c0 .289.139.56.378.71l2.433 1.52A1.25 1.25 0 0113.25 7.6v1.242m-6 3.75h12m-12 0a2.25 2.25 0 00-2.25 2.25v2.872c0 1 .737 1.85 1.732 1.946l7.74.743a2.25 2.25 0 002.518-2.238v-3.323a2.25 2.25 0 00-2.25-2.25H7.25z" />
  </svg>`,
  Saude: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>`
};

// Web Audio API Barcode Beep Synthesizer
function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // high pitched clean beep
    
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    // Beep duration: 0.12 seconds
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.13);
  } catch (error) {
    console.warn("AudioContext not supported or blocked by user gesture:", error);
  }
}

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLocalStorage();
  initEventListeners();
  renderRecentScans();
  checkServerStatus(); // Verify if live backend is online
});

// Theme Logic
function initTheme() {
  const savedTheme = localStorage.getItem("farma-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  
  if (savedTheme === "dark") {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("farma-theme", newTheme);
  
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  
  if (newTheme === "dark") {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  } else {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  }
}

// Local Storage for Recent Scans
function initLocalStorage() {
  const saved = localStorage.getItem("farma-recent-scans");
  if (saved) {
    try {
      recentScans = JSON.parse(saved);
    } catch (e) {
      recentScans = [];
    }
  }
}

function addRecentScan(product) {
  // Remove duplicate if exists
  recentScans = recentScans.filter(item => item.barcode !== product.barcode);
  // Add to beginning
  recentScans.unshift({
    barcode: product.barcode,
    name: product.name.split(" ")[0] // Short name for tags
  });
  // Keep only last 5 items
  if (recentScans.length > 5) {
    recentScans.pop();
  }
  localStorage.setItem("farma-recent-scans", JSON.stringify(recentScans));
  renderRecentScans();
}

function renderRecentScans() {
  const section = document.getElementById("recent-scans-section");
  const list = document.getElementById("recent-scans-list");
  
  if (recentScans.length === 0) {
    section.style.display = "none";
    return;
  }
  
  section.style.display = "block";
  list.innerHTML = "";
  
  recentScans.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "history-tag";
    btn.textContent = item.name;
    btn.setAttribute("data-query", item.barcode);
    btn.addEventListener("click", () => {
      handleProductSearch(item.barcode);
    });
    list.appendChild(btn);
  });
}

// Events Attachment
function initEventListeners() {
  // Theme Toggle
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  
  // Search Form
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value;
    if (query.trim()) {
      handleProductSearch(query);
    }
  });
  
  // Quick Sample tags
  document.querySelectorAll(".history-tag[data-query]").forEach(tag => {
    tag.addEventListener("click", (e) => {
      const query = e.currentTarget.getAttribute("data-query");
      handleProductSearch(query);
    });
  });

  // Filter Buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      currentSort = e.currentTarget.getAttribute("data-sort");
      if (currentProduct) {
        renderComparisonList();
      }
    });
  });

  // Quantity Multiplier Input
  const multiplierInput = document.getElementById("qty-multiplier");
  multiplierInput.addEventListener("input", (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val) || val < 1) {
      val = 1;
    }
    quantityMultiplier = val;
    updateCalculator();
  });

  // City Selector Input
  const citySelector = document.getElementById("city-selector");
  if (citySelector) {
    // Set initial value
    citySelector.value = currentCity;
    citySelector.addEventListener("change", (e) => {
      currentCity = e.target.value;
      if (currentProduct) {
        renderComparisonList();
        updateCalculator();
      }
    });
  }

  // Purchase Mode Toggle Buttons
  const modeOnlineBtn = document.getElementById("mode-online-btn");
  const modePresencialBtn = document.getElementById("mode-presencial-btn");
  
  const setPurchaseMode = (mode) => {
    purchaseMode = mode;
    if (mode === "online") {
      modeOnlineBtn.classList.add("active");
      modePresencialBtn.classList.remove("active");
    } else {
      modeOnlineBtn.classList.remove("active");
      modePresencialBtn.classList.add("active");
    }
    if (currentProduct) {
      renderComparisonList();
      updateCalculator();
    }
  };

  if (modeOnlineBtn && modePresencialBtn) {
    modeOnlineBtn.addEventListener("click", () => setPurchaseMode("online"));
    modePresencialBtn.addEventListener("click", () => setPurchaseMode("presencial"));
  }

  // Auto-focus search input on page load
  const searchInput = document.getElementById("search-input");
  const suggestionsDropdown = document.getElementById("search-suggestions");
  
  if (searchInput) {
    searchInput.focus();

    let debounceTimer = null;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);

      if (query.length < 3 || /^\d+$/.test(query)) {
        if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/suggest?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error("Suggestion failed");
          
          const suggestions = await response.json();
          renderSuggestions(suggestions);
        } catch (err) {
          console.warn("[Suggestions] Failed to load suggestions:", err.message);
          if (suggestionsDropdown) suggestionsDropdown.style.display = "none";
        }
      }, 250);
    });

    // Close suggestions on clicking outside
    document.addEventListener("click", (e) => {
      if (suggestionsDropdown && !searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
        suggestionsDropdown.style.display = "none";
      }
    });

    // Close suggestions on Escape key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && suggestionsDropdown) {
        suggestionsDropdown.style.display = "none";
      }
    });
  }

  function renderSuggestions(suggestions) {
    if (!suggestionsDropdown) return;
    
    if (!suggestions || suggestions.length === 0) {
      suggestionsDropdown.style.display = "none";
      return;
    }
    
    suggestionsDropdown.innerHTML = "";
    suggestionsDropdown.style.display = "flex";
    
    suggestions.forEach(item => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `
        <span class="suggestion-name">${item.name}</span>
        <span class="suggestion-brand-ean">
          <span>🏷️ ${item.brand || 'Sem Marca'}</span>
          <span>EAN: ${item.ean}</span>
        </span>
      `;
      div.addEventListener("click", () => {
        searchInput.value = item.name;
        suggestionsDropdown.style.display = "none";
        handleProductSearch(item.ean); // Directly search by the accurate EAN code
      });
      suggestionsDropdown.appendChild(div);
    });
  }

  // Global keydown capture to refocus scanner input
  document.addEventListener("keydown", (e) => {
    // Don't hijack keystrokes if operator is actively typing in a selector or multiplier input
    const activeEl = document.activeElement;
    const isInput = activeEl && (
      activeEl.tagName === "SELECT" || 
      activeEl.id === "qty-multiplier" ||
      activeEl.tagName === "TEXTAREA"
    );
    
    if (!isInput && searchInput && document.activeElement !== searchInput) {
      searchInput.focus();
    }
  });
}

// Product Search & Fetch handler (Dynamic local server fetch with mock fallback)
async function handleProductSearch(query) {
  if (!query) return;

  // Play audio confirmation beep
  playBeep();

  // Reset and refocus input so it's immediately ready for the next barcode bipe
  const searchInput = document.getElementById("search-input");
  const suggestionsDropdown = document.getElementById("search-suggestions");
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
  if (suggestionsDropdown) {
    suggestionsDropdown.style.display = "none";
  }
  
  const searchBtn = document.getElementById("search-btn");
  const originalBtnText = searchBtn.textContent;
  
  // Loading Feedback
  searchBtn.disabled = true;
  searchBtn.textContent = "Buscando Preços Reais...";

  // Prepare UI for loading
  const skeleton = document.getElementById("loading-skeleton");
  const listContainer = document.getElementById("price-comparison-list");
  
  // Show results panel immediately on first search to let the operator see the skeleton
  document.getElementById("results-empty").style.display = "none";
  document.getElementById("results-display").style.display = "flex";
  
  if (skeleton) skeleton.style.display = "flex";
  if (listContainer) listContainer.style.display = "none";

  try {
    // Try to query the local proxy server or cloud backend
    const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    currentProduct = await response.json();
    console.log("[FarmaCompare] Loaded live data from proxy server.");
    
    // Update server status badge and hide simulation warning
    updateStatusBadge(true);
    document.getElementById("simulation-warning").style.display = "none";
  } catch (error) {
    // Fallback to local mock database
    console.warn("[FarmaCompare] Backend offline or failed. Falling back to Mock DB. Error:", error.message);
    
    // Update server status badge and show simulation warning
    updateStatusBadge(false);
    document.getElementById("simulation-warning").style.display = "flex";

    if (typeof getOrCreateProduct === "function" && typeof PHARMACIES !== "undefined") {
      currentProduct = getOrCreateProduct(query, PHARMACIES);
    } else {
      alert("Erro crítico: Banco de dados local indisponível.");
      searchBtn.disabled = false;
      searchBtn.textContent = originalBtnText;
      if (skeleton) skeleton.style.display = "none";
      return;
    }
  } finally {
    // Hide skeleton and show actual comparison results
    if (skeleton) skeleton.style.display = "none";
    if (listContainer) listContainer.style.display = "flex";
  }

  // Restore button feedback
  searchBtn.disabled = false;
  searchBtn.textContent = originalBtnText;

  // Render details
  addRecentScan(currentProduct);
  renderProductDetails();
  renderComparisonList();
  updateCalculator();
}

// Render product general cards
function renderProductDetails() {
  const imgBox = document.getElementById("product-img-box");
  const catSpan = document.getElementById("product-category");
  const nameH2 = document.getElementById("product-name");
  const brandDiv = document.getElementById("product-brand");
  const barcodeStr = document.getElementById("product-barcode");
  const activeSpan = document.getElementById("product-active");
  
  // Set SVG Icon based on category
  const svg = CATEGORY_SVGS[currentProduct.category] || CATEGORY_SVGS[currentProduct.subCategory] || CATEGORY_SVGS.default;
  imgBox.innerHTML = svg;
  
  catSpan.textContent = currentProduct.category + " | " + (currentProduct.subCategory || "Geral");
  nameH2.textContent = currentProduct.name;
  brandDiv.textContent = currentProduct.brand;
  barcodeStr.textContent = currentProduct.barcode;
  activeSpan.textContent = currentProduct.activeIngredient;
}

// Render comparison table
function renderComparisonList() {
  const container = document.getElementById("price-comparison-list");
  container.innerHTML = "";
  
  if (!currentProduct || !currentProduct.prices) return;
  
  let sortedPrices = [];

  const getBasePriceForQuery = (phDef) => {
    if (phDef.usesRealPriceOf) {
      const match = currentProduct.prices.find(p => p.pharmacyId === phDef.usesRealPriceOf);
      if (match && match.stockStatus === "Disponível") return match.currentPrice;
    }
    const direct = currentProduct.prices.find(p => p.pharmacyId === phDef.id);
    if (direct && direct.stockStatus === "Disponível") return direct.currentPrice;
    
    // Generic chain fallback
    const pmMatch = currentProduct.prices.find(p => p.pharmacyId === "paguemenos");
    if (pmMatch && pmMatch.stockStatus === "Disponível") return pmMatch.currentPrice;
    const dspMatch = currentProduct.prices.find(p => p.pharmacyId === "drogariasaopaulo");
    if (dspMatch && dspMatch.stockStatus === "Disponível") return dspMatch.currentPrice;
    
    const firstAvailable = currentProduct.prices.find(p => p.stockStatus === "Disponível");
    if (firstAvailable) return firstAvailable.currentPrice;
    return currentProduct.basePrice || 25.00;
  };

  const getPricesForPharmacy = (ph, isNacional = false) => {
    let onlinePrice = 0;
    let originalPrice = 0;
    let hasDiscount = false;
    let discountPercent = 0;
    let stockStatus = "Disponível";

    const realPriceItem = !ph.isSimulated ? currentProduct.prices.find(p => p.pharmacyId === ph.id) : null;

    if (realPriceItem) {
      onlinePrice = realPriceItem.currentPrice;
      originalPrice = realPriceItem.originalPrice;
      hasDiscount = realPriceItem.hasDiscount;
      discountPercent = realPriceItem.discountPercent;
      stockStatus = realPriceItem.stockStatus;
    } else {
      const base = getBasePriceForQuery(ph);
      const rand = seedRandom(currentProduct.barcode + ph.id);
      const factor = ph.priceFactor || 1.0;
      
      onlinePrice = parseFloat((base * factor * (0.97 + rand() * 0.05)).toFixed(2));
      hasDiscount = rand() > 0.45;
      discountPercent = hasDiscount ? Math.floor(rand() * 20 + 5) : 0;
      originalPrice = hasDiscount ? parseFloat((onlinePrice * (1 + (discountPercent/100))).toFixed(2)) : onlinePrice;
      stockStatus = "Disponível";
    }

    // Calculate deterministic physical store price (usually 3% to 6% markup)
    const pRand = seedRandom(currentProduct.barcode + ph.id + "_presential");
    const physicalMarkup = 1.03 + (pRand() * 0.03); // Between 1.03 and 1.06
    const physicalPrice = parseFloat((onlinePrice * physicalMarkup).toFixed(2));

    // Choose effective price and delivery parameters based on purchaseMode
    const effectivePrice = purchaseMode === "online" ? onlinePrice : physicalPrice;
    const effectiveDeliveryFee = purchaseMode === "online" ? ph.deliveryFee : 0;

    return {
      onlinePrice,
      physicalPrice,
      effectivePrice,
      effectiveDeliveryFee,
      originalPrice,
      hasDiscount,
      discountPercent,
      stockStatus
    };
  };

  if (currentCity === "nacional") {
    CITIES_DATABASE.nacional.pharmacies.forEach(ph => {
      const brand = PHARMACY_BRANDS[ph.id] || {};
      const prices = getPricesForPharmacy(ph, true);
      sortedPrices.push({
        pharmacyId: ph.id,
        pharmacyName: ph.name,
        address: "Rede Nacional - Vendas Online",
        brandColor: brand.brandColor || "#dc2626",
        logoSvg: brand.logoSvg || "",
        distance: ph.distance,
        deliveryFee: ph.deliveryFee,
        deliveryTime: ph.deliveryTime,
        buyUrl: `https://www.google.com/search?q=${encodeURIComponent(ph.name + ' ' + currentProduct.name)}`,
        ...prices
      });
    });
  } else {
    const cityData = CITIES_DATABASE[currentCity];
    if (cityData) {
      cityData.pharmacies.forEach(ph => {
        const brand = PHARMACY_BRANDS[ph.id] || PHARMACY_BRANDS.default || { brandColor: "#dc2626", logoSvg: "" };
        const prices = getPricesForPharmacy(ph);
        sortedPrices.push({
          pharmacyId: ph.id,
          pharmacyName: ph.name,
          address: ph.address,
          brandColor: brand.brandColor,
          logoSvg: brand.logoSvg,
          distance: ph.distance,
          deliveryFee: ph.deliveryFee,
          deliveryTime: ph.deliveryTime,
          buyUrl: `https://www.google.com/search?q=${encodeURIComponent(ph.name + ' ' + currentProduct.name)}`,
          ...prices
        });
      });
    }
  }

  // Save active list to displayedPrices for calculator calculations
  displayedPrices = [...sortedPrices];

  // Identify lowest active price to display "Melhor Preço" badge
  let availablePrices = sortedPrices.filter(p => p.stockStatus === "Disponível");
  let lowestPrice = Infinity;
  
  if (availablePrices.length > 0) {
    // For online mode, compare effectivePrice + effectiveDeliveryFee. For physical, compare effectivePrice
    lowestPrice = Math.min(...availablePrices.map(p => p.effectivePrice + p.effectiveDeliveryFee));
  }

  // Sort prices based on selected filter
  if (currentSort === "price") {
    sortedPrices.sort((a, b) => {
      if (a.stockStatus !== "Disponível" && b.stockStatus === "Disponível") return 1;
      if (a.stockStatus === "Disponível" && b.stockStatus !== "Disponível") return -1;
      
      const priceA = a.effectivePrice + a.effectiveDeliveryFee;
      const priceB = b.effectivePrice + b.effectiveDeliveryFee;
      return priceA - priceB;
    });
  } else if (currentSort === "distance") {
    sortedPrices.sort((a, b) => a.distance - b.distance);
  } else if (currentSort === "delivery") {
    if (purchaseMode === "online") {
      const parseTime = (timeStr) => {
        const match = timeStr.match(/^(\d+)/);
        return match ? parseInt(match[1]) : 999;
      };
      sortedPrices.sort((a, b) => parseTime(a.deliveryTime) - parseTime(b.deliveryTime));
    } else {
      // In physical mode, closest distance acts as delivery time since pickup is immediate!
      sortedPrices.sort((a, b) => a.distance - b.distance);
    }
  }

  sortedPrices.forEach(item => {
    const totalEffective = item.effectivePrice + item.effectiveDeliveryFee;
    const isCheapest = item.stockStatus === "Disponível" && totalEffective === lowestPrice;

    const priceItem = document.createElement("div");
    priceItem.className = `price-item ${isCheapest ? "best-deal" : ""}`;

    const originalPriceHtml = item.hasDiscount && purchaseMode === "online"
      ? `<span class="original-price" style="display:block;">R$ ${item.originalPrice.toFixed(2).replace(".", ",")}</span>`
      : "";

    const discountBadgeHtml = item.hasDiscount && purchaseMode === "online"
      ? `<span class="discount-badge">-${item.discountPercent}%</span>`
      : "";

    const bestDealBadgeHtml = isCheapest 
      ? `<div class="best-deal-badge">Melhor Preço</div>` 
      : "";

    // Shipping info representation
    let shippingHtml = "";
    if (purchaseMode === "online") {
      shippingHtml = `
        <span class="pharmacy-shipping">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
          </svg>
          ${item.distance} km • Frete R$ ${item.deliveryFee.toFixed(2).replace(".", ",")}
        </span>
        <span class="pharmacy-shipping" style="margin-top: 4px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Entrega em ${item.deliveryTime}
        </span>
      `;
    } else {
      shippingHtml = `
        <span class="pharmacy-shipping" style="color: var(--success); font-weight: 600;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
          </svg>
          A ${item.distance} km de distância (Retirada Grátis)
        </span>
        <span class="pharmacy-shipping" style="margin-top: 4px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pronto para retirada em 15 min
        </span>
      `;
    }

    priceItem.innerHTML = `
      ${bestDealBadgeHtml}
      <div class="pharmacy-logo" style="border-left: 4px solid ${item.brandColor}">
        ${item.logoSvg}
      </div>
      <div class="pharmacy-details">
        <span class="pharmacy-name">${item.pharmacyName}</span>
        <span class="pharmacy-address">${item.address}</span>
        ${shippingHtml}
      </div>
      <div class="price-section">
        <div class="price-row ${purchaseMode === 'online' ? 'active-mode' : ''}" title="Preço pelo Site">
          <span class="price-label">🌐 Site</span>
          <span class="price-value">R$ ${item.onlinePrice.toFixed(2).replace(".", ",")}</span>
        </div>
        <div class="price-row ${purchaseMode === 'presencial' ? 'active-mode' : ''}" title="Preço de Balcão Físico">
          <span class="price-label">🚶 Loja</span>
          <span class="price-value">R$ ${item.physicalPrice.toFixed(2).replace(".", ",")}</span>
        </div>
        ${discountBadgeHtml}
      </div>
      <div class="action-section">
        <span class="stock-status ${item.stockStatus === "Disponível" ? "in-stock" : "out-of-stock"}">
          ${item.stockStatus}
        </span>
        <a href="${item.buyUrl}" target="_blank" class="buy-btn">
          Ir p/ Loja
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    `;

    container.appendChild(priceItem);
  });
}

// Update quantity calculator outputs
function updateCalculator() {
  if (displayedPrices.length === 0) {
    document.getElementById("calc-total-price").textContent = "N/A";
    document.getElementById("calc-savings").textContent = "R$ 0,00";
    return;
  }
  
  // Filter only in-stock pharmacies to calculate potential savings
  const availablePharmacies = displayedPrices.filter(p => p.stockStatus === "Disponível");
  
  if (availablePharmacies.length === 0) {
    document.getElementById("calc-total-price").textContent = "N/A";
    document.getElementById("calc-savings").textContent = "R$ 0,00";
    return;
  }
  
  const totals = availablePharmacies.map(p => p.effectivePrice + p.effectiveDeliveryFee);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);
  
  const totalPrice = minTotal * quantityMultiplier;
  const potentialSavings = (maxTotal - minTotal) * quantityMultiplier;
  
  document.getElementById("calc-total-price").textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;
  document.getElementById("calc-savings").textContent = `R$ ${potentialSavings.toFixed(2).replace(".", ",")}`;
}

// Check server connectivity and update status badge on load
async function checkServerStatus() {
  updateStatusBadge("waking");
  try {
    const response = await fetch(`${BACKEND_URL}/api/search?q=7891058017507`, {
      method: "GET",
      signal: AbortSignal.timeout(60000) // Allow up to 60 seconds for Render free tier to wake up
    });
    if (response.ok) {
      updateStatusBadge("online");
    } else {
      updateStatusBadge("offline");
    }
  } catch (e) {
    updateStatusBadge("offline");
  }
}

// Update DOM elements for server connection status
function updateStatusBadge(status) {
  const badge = document.getElementById("server-status");
  if (!badge) return;
  
  if (status === "online" || status === true) {
    badge.textContent = "● Tempo Real";
    badge.className = "status-badge online";
    badge.title = "Conectado ao servidor de preços reais em tempo real.";
  } else if (status === "waking") {
    badge.textContent = "● Acordando Nuvem...";
    badge.className = "status-badge waking";
    badge.title = "O servidor na nuvem está iniciando (plano grátis). Isso leva de 40 a 50 segundos na primeira consulta após inatividade.";
  } else {
    badge.textContent = "● Modo Simulado";
    badge.className = "status-badge offline";
    badge.title = "Servidor offline ou lento demais para responder. Preços gerados localmente.";
  }
}

