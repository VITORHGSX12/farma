// Configuração do servidor backend (Altere para a URL da nuvem se for hospedado externamente, ex: https://farmacompare.onrender.com)
const BACKEND_URL = "https://farma-7llj.onrender.com";

// State variables
let currentProduct = null;
let currentSort = "price"; // "price" | "distance" | "delivery"
let currentCity = "teresina"; // Selected city
let displayedPrices = []; // List of prices currently displayed to calculate savings
let quantityMultiplier = 1;
let html5Qrcode = null;
let isScanning = false;
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
  
  // Start/Stop Camera
  document.getElementById("start-scan-btn").addEventListener("click", startScanning);
  document.getElementById("stop-scan-btn").addEventListener("click", stopScanning);
  
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
}

// Barcode Scanning Logic
function startScanning() {
  if (isScanning) return;
  
  const startBtn = document.getElementById("start-scan-btn");
  const stopBtn = document.getElementById("stop-scan-btn");
  const wrapper = document.getElementById("scanner-wrapper");
  const viewfinder = document.getElementById("viewfinder");
  
  startBtn.style.display = "none";
  stopBtn.style.display = "flex";
  wrapper.classList.add("scanning");
  viewfinder.classList.add("active");
  
  isScanning = true;
  
  // Initialize standard scanning settings
  html5Qrcode = new Html5Qrcode("camera-reader");
  
  const config = {
    fps: 15,
    qrbox: (width, height) => {
      // Return a horizontal rectangle optimized for barcode layout
      return {
        width: Math.floor(width * 0.85),
        height: Math.floor(height * 0.5)
      };
    },
    aspectRatio: 1.333333 // 4:3
  };

  html5Qrcode.start(
    { facingMode: "environment" }, // Prefer back camera
    config,
    (decodedText, decodedResult) => {
      // Scanned successfully!
      playBeep();
      stopScanning();
      handleProductSearch(decodedText);
    },
    (errorMessage) => {
      // Normal scanning logs (very frequent, suppress to avoid console bloat)
    }
  ).catch(err => {
    console.error("Erro ao iniciar a câmera:", err);
    alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
    stopScanning();
  });
}

function stopScanning() {
  if (!isScanning) return;
  
  const startBtn = document.getElementById("start-scan-btn");
  const stopBtn = document.getElementById("stop-scan-btn");
  const wrapper = document.getElementById("scanner-wrapper");
  const viewfinder = document.getElementById("viewfinder");
  
  startBtn.style.display = "flex";
  stopBtn.style.display = "none";
  wrapper.classList.remove("scanning");
  viewfinder.classList.remove("active");
  
  isScanning = false;
  
  if (html5Qrcode) {
    html5Qrcode.stop().then(() => {
      html5Qrcode.clear();
      html5Qrcode = null;
    }).catch(err => {
      console.error("Erro ao parar a câmera:", err);
    });
  }
}

// Product Search & Fetch handler (Dynamic local server fetch with mock fallback)
async function handleProductSearch(query) {
  // Sync input field value
  document.getElementById("search-input").value = query;
  
  const searchBtn = document.getElementById("search-btn");
  const originalBtnText = searchBtn.textContent;
  
  // Loading Feedback
  searchBtn.disabled = true;
  searchBtn.textContent = "Buscando Preços Reais...";

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
      return;
    }
  }

  // Restore button feedback
  searchBtn.disabled = false;
  searchBtn.textContent = originalBtnText;

  // Render details
  addRecentScan(currentProduct);
  renderProductDetails();
  renderComparisonList();
  updateCalculator();
  
  // Switch views
  document.getElementById("results-empty").style.display = "none";
  document.getElementById("results-display").style.display = "flex";
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

  if (currentCity === "nacional") {
    // Use raw backend prices mapped to local SVG logs
    sortedPrices = currentProduct.prices.map(p => {
      const brand = PHARMACY_BRANDS[p.pharmacyId] || {};
      return {
        ...p,
        logoSvg: brand.logoSvg || p.logoSvg || "",
        address: "Rede Nacional - Vendas Online"
      };
    });
  } else {
    const cityData = CITIES_DATABASE[currentCity];
    if (cityData) {
      // Helper to dynamically calculate a base price from real prices for simulated stores
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

      cityData.pharmacies.forEach(ph => {
        const brand = PHARMACY_BRANDS[ph.id] || PHARMACY_BRANDS.default || { brandColor: "#dc2626", logoSvg: "" };
        let currentPrice = 0;
        let originalPrice = 0;
        let hasDiscount = false;
        let discountPercent = 0;
        let stockStatus = "Disponível";

        // Try to get real price from backend
        const realPriceItem = !ph.isSimulated ? currentProduct.prices.find(p => p.pharmacyId === ph.id) : null;

        if (realPriceItem) {
          currentPrice = realPriceItem.currentPrice;
          originalPrice = realPriceItem.originalPrice;
          hasDiscount = realPriceItem.hasDiscount;
          discountPercent = realPriceItem.discountPercent;
          stockStatus = realPriceItem.stockStatus;
        } else {
          // Simulated/Local Price derived dynamically but deterministically based on EAN
          const base = getBasePriceForQuery(ph);
          const rand = seedRandom(currentProduct.barcode + ph.id);
          const factor = ph.priceFactor || 1.0;
          
          currentPrice = parseFloat((base * factor * (0.97 + rand() * 0.05)).toFixed(2));
          hasDiscount = rand() > 0.45;
          discountPercent = hasDiscount ? Math.floor(rand() * 20 + 5) : 0;
          originalPrice = hasDiscount ? parseFloat((currentPrice * (1 + (discountPercent/100))).toFixed(2)) : currentPrice;
          stockStatus = "Disponível";
        }

        sortedPrices.push({
          pharmacyId: ph.id,
          pharmacyName: ph.name,
          address: ph.address,
          brandColor: brand.brandColor,
          logoSvg: brand.logoSvg,
          currentPrice,
          originalPrice,
          hasDiscount,
          discountPercent,
          stockStatus,
          deliveryFee: ph.deliveryFee,
          deliveryTime: ph.deliveryTime,
          distance: ph.distance,
          buyUrl: `https://www.google.com/search?q=${encodeURIComponent(ph.name + ' ' + currentProduct.name)}`
        });
      });
    }
  }

  // Update calculator state
  displayedPrices = [...sortedPrices];
  
  // Identify the absolute cheapest price to flag as Best Deal
  // (Only count pharmacies that have stock)
  let availablePrices = sortedPrices.filter(p => p.stockStatus === "Disponível");
  let lowestPrice = Infinity;
  
  if (availablePrices.length > 0) {
    lowestPrice = Math.min(...availablePrices.map(p => p.currentPrice));
  }

  // Sort prices based on selected filter
  if (currentSort === "price") {
    // Sort ascending by price. Out of stock items pushed to end.
    sortedPrices.sort((a, b) => {
      if (a.stockStatus !== "Disponível" && b.stockStatus === "Disponível") return 1;
      if (a.stockStatus === "Disponível" && b.stockStatus !== "Disponível") return -1;
      return a.currentPrice - b.currentPrice;
    });
  } else if (currentSort === "distance") {
    // Sort ascending by distance
    sortedPrices.sort((a, b) => a.distance - b.distance);
  } else if (currentSort === "delivery") {
    // Sort by delivery time. E.g. "30 - 60 min". Take start duration
    const parseTime = (timeStr) => {
      const match = timeStr.match(/^(\d+)/);
      return match ? parseInt(match[1]) : 999;
    };
    sortedPrices.sort((a, b) => parseTime(a.deliveryTime) - parseTime(b.deliveryTime));
  }
  
  sortedPrices.forEach(item => {
    const isCheapest = item.stockStatus === "Disponível" && item.currentPrice === lowestPrice;
    
    const priceItem = document.createElement("div");
    priceItem.className = `price-item ${isCheapest ? "best-deal" : ""}`;
    
    const originalPriceHtml = item.hasDiscount 
      ? `<span class="original-price">R$ ${item.originalPrice.toFixed(2).replace(".", ",")}</span>` 
      : "";
      
    const discountBadgeHtml = item.hasDiscount 
      ? `<span class="discount-badge">-${item.discountPercent}%</span>` 
      : "";
      
    const bestDealBadgeHtml = isCheapest 
      ? `<div class="best-deal-badge">Melhor Preço</div>` 
      : "";

    priceItem.innerHTML = `
      ${bestDealBadgeHtml}
      <div class="pharmacy-logo" style="border-left: 4px solid ${item.brandColor}">
        ${item.logoSvg}
      </div>
      <div class="pharmacy-details">
        <span class="pharmacy-name">${item.pharmacyName}</span>
        <span class="pharmacy-address">${item.address}</span>
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
      </div>
      <div class="price-section">
        ${originalPriceHtml}
        <span class="current-price">R$ ${item.currentPrice.toFixed(2).replace(".", ",")}</span>
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
  
  const prices = availablePharmacies.map(p => p.currentPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const totalPrice = minPrice * quantityMultiplier;
  const potentialSavings = (maxPrice - minPrice) * quantityMultiplier;
  
  document.getElementById("calc-total-price").textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;
  document.getElementById("calc-savings").textContent = `R$ ${potentialSavings.toFixed(2).replace(".", ",")}`;
}

// Check server connectivity and update status badge on load
async function checkServerStatus() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/search?q=7891058017507`, {
      method: "GET",
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (response.ok) {
      updateStatusBadge(true);
    } else {
      updateStatusBadge(false);
    }
  } catch (e) {
    updateStatusBadge(false);
  }
}

// Update DOM elements for server connection status
function updateStatusBadge(isOnline) {
  const badge = document.getElementById("server-status");
  if (!badge) return;
  
  if (isOnline) {
    badge.textContent = "● Tempo Real";
    badge.className = "status-badge online";
    badge.title = "Conectado ao servidor de preços reais em tempo real.";
  } else {
    badge.textContent = "● Modo Simulado";
    badge.className = "status-badge offline";
    badge.title = "Servidor offline. Execute 'node server.js' para ativar preços reais.";
  }
}

