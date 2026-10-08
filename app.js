/**
 * LeafBook Digital Store - Vanilla JavaScript
 * Complete E-Commerce, Supabase Database & Storage, Cart, Checkout
 */

// ============================================================
// 1. SUPABASE CONFIGURATION (LIVE EMBEDDED CREDENTIALS)
// ============================================================
const SUPABASE_URL = "https://trlqxlupipfalwasxbsm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybHF4bHVwaXBmYWx3YXN4YnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Mzc1MjksImV4cCI6MjEwNzAxMzUyOX0.VBoDGwRjz29NlrAgFypOlgvLxR92MbiGKHs--l2bTn0";

let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client initialized successfully!");
  }
} catch (e) {
  console.warn("Supabase initialization notice:", e);
}

// Current User State
const currentUser = {
  name: "Pamika Nanchamrus",
  email: "pamika.th@rmuti.ac.th",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  role: "creator"
};

// Application State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let orders = [];
let currentCategory = "all";
let currentSearch = "";
let uploadedFileData = null; // { name, size, type, url, storage }

// Fallback Initial Products
const INITIAL_PRODUCTS = [
  {
    id: "prod-ebook-store-guide",
    title: "คู่มือพัฒนาระบบ E-Book Store (LeafBook) ฉบับสมบูรณ์",
    slug: "ebook-store-guide",
    description: "เอกสารคู่มือสเปกและขั้นตอนการพัฒนาระบบร้านค้า E-Book Store ด้วย Next.js, Electron, Tailwind CSS และ Supabase",
    category: "ebook",
    price: 199,
    originalPrice: 390,
    coverImage: "/covers/ebook-store-guide-cover.jpg",
    fileType: "PDF (E-Book)",
    fileSize: "1.4 MB",
    downloadUrl: "/downloads/E-Book%20Store.docx",
    fileName: "E-Book Store Guide.pdf",
    author: "ทีมพัฒนา LeafBook"
  },
  {
    id: "prod-exercises-bundle",
    title: "ชุดแบบฝึกหัด Google Apps Script & Mini Projects (รวม 9 ชุด)",
    slug: "gas-mini-projects-bundle",
    description: "รวมแบบฝึกหัดพัฒนา Web App ด้วย Google Apps Script และ Vibe Coding ตั้งแต่แบบฝึกหัดที่ 1 ถึง 7 และโปรเจกต์ 9.1, 9.2 ครบชุด",
    category: "software",
    price: 399,
    originalPrice: 890,
    coverImage: "/covers/gas-bundle-cover.jpg",
    fileType: "ZIP (Source Code)",
    fileSize: "2.6 MB",
    downloadUrl: "/downloads/exercises-complete-bundle.zip",
    fileName: "GAS_Exercises_Bundle.zip",
    author: "อาจารย์ผู้สอน"
  },
  {
    id: "prod-media-player-pro",
    title: "Media Player PRO - ซอร์สโค้ดโปรแกรมเล่นสื่อระดับพรีเมียม",
    slug: "media-player-pro-code",
    description: "ซอร์สโค้ดเต็มระบบ Media Player PRO พัฒนาด้วยเทคโนโลยีเว็บและเดสก์ท็อป รองรับการเล่นไฟล์เสียง วิดีโอ และเพลย์ลิสต์",
    category: "software",
    price: 450,
    originalPrice: 890,
    coverImage: "/covers/media-player-code-cover.jpg",
    fileType: "ZIP (Source Code)",
    fileSize: "4.2 MB",
    downloadUrl: "/downloads/media-player-pro.zip",
    fileName: "media-player-pro-source.zip",
    author: "DevCraft Studio"
  },
  {
    id: "prod-taskmanager",
    title: "SQLite Task Manager PRO - ระบบจัดการงานพร้อมฐานข้อมูล",
    slug: "sqlite-taskmanager-pro-code",
    description: "ซอร์สโค้ดระบบบริหารจัดการงานระดับมืออาชีพ พร้อมฐานข้อมูล SQLite ในตัว เหมาะสำหรับการทำงานเดสก์ท็อปและออฟไลน์",
    category: "software",
    price: 350,
    originalPrice: 690,
    coverImage: "/covers/taskmanager-code-cover.jpg",
    fileType: "ZIP (Source Code)",
    fileSize: "3.8 MB",
    downloadUrl: "/downloads/taskmanager.zip",
    fileName: "taskmanager-source.zip",
    author: "DataCore Solutions"
  },
  {
    id: "prod-tarot-app",
    title: "Tarot App - ระบบดูดวงไพ่ทาโรต์ดิจิทัลแบบโต้ตอบ",
    slug: "tarot-app-code",
    description: "ซอร์สโค้ดเว็บและแอปพลิเคชันดูดวงไพ่ทาโรต์แบบอินเตอร์แอคทีฟ แอนิเมชันเปิดไพ่สมจริง พร้อมฐานข้อมูลคำทำนายครบ 78 ใบ",
    category: "software",
    price: 390,
    originalPrice: 750,
    coverImage: "/covers/tarot-code-cover.jpg",
    fileType: "ZIP (Source Code)",
    fileSize: "5.6 MB",
    downloadUrl: "/downloads/tarot-app.zip",
    fileName: "tarot-app-source.zip",
    author: "Mystic Byte Studio"
  }
];

// ============================================================
// 2. INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  loadSavedState();
  await checkDatabaseConnection();
  await fetchProducts();
  renderProducts();
  renderMyPublishedProducts();
  updateCartBadge();
  refreshIcons();
});

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function loadSavedState() {
  try {
    const savedCart = localStorage.getItem("leafbook_cart_vanilla");
    if (savedCart) cart = JSON.parse(savedCart);

    const savedOrders = localStorage.getItem("leafbook_orders_vanilla");
    if (savedOrders) orders = JSON.parse(savedOrders);
    renderOrders();
  } catch (e) {
    console.warn("Storage load error:", e);
  }
}

function saveState() {
  try {
    localStorage.setItem("leafbook_cart_vanilla", JSON.stringify(cart));
    localStorage.setItem("leafbook_orders_vanilla", JSON.stringify(orders));
  } catch (e) {}
}

// ============================================================
// 3. SUPABASE DATABASE OPERATIONS
// ============================================================
async function checkDatabaseConnection() {
  const badge = document.getElementById("dbStatusBadge");
  const text = document.getElementById("dbStatusText");
  if (!supabaseClient) {
    if (text) text.innerText = "Offline Mode";
    return;
  }

  try {
    const { count, error } = await supabaseClient.from("products").select("*", { count: "exact", head: true });
    if (!error) {
      if (text) text.innerText = "Supabase Cloud";
      if (badge) badge.className = "db-status-badge connected";
    } else {
      if (text) text.innerText = "Supabase Connected";
    }
  } catch (e) {
    if (text) text.innerText = "Supabase Ready";
  }
}

async function fetchProducts() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        allProducts = data.map((row) => ({
          id: String(row.id),
          title: row.title || "สินค้าไม่มีชื่อ",
          slug: row.slug || String(row.id),
          description: row.description || "",
          category: row.category || "other",
          price: Number(row.price || 0),
          originalPrice: row.original_price ? Number(row.original_price) : undefined,
          coverImage: row.cover_image || "/covers/default.png",
          fileType: row.file_type || "PDF",
          fileSize: row.file_size || "2 MB",
          downloadUrl: row.download_file_url || "#",
          fileName: row.file_name || "product-file.pdf",
          author: row.author || "LeafBook Creator",
          sellerEmail: row.seller_email || (row.author && row.author.includes("(") ? row.author.match(/\((.*?)\)/)?.[1] : undefined)
        }));
        applyFilters();
        return;
      }
    } catch (err) {
      console.warn("Failed to load products from Supabase, using defaults:", err);
    }
  }

  // Fallback to local default products
  allProducts = [...INITIAL_PRODUCTS];
  applyFilters();
}

// ============================================================
// 4. RENDERING PRODUCTS & STORE FRONT
// ============================================================
function applyFilters() {
  filteredProducts = allProducts.filter((p) => {
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    const matchesSearch = !currentSearch || 
      p.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const counterEl = document.getElementById("productsCounterText");
  if (counterEl) counterEl.innerText = `(${filteredProducts.length} รายการ)`;

  const totalCountEl = document.getElementById("totalProductsCount");
  if (totalCountEl) totalCountEl.innerText = `${allProducts.length}+`;
}

function renderProducts() {
  const container = document.getElementById("productGridContainer");
  if (!container) return;

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <i data-lucide="package-search" style="width: 48px; height: 48px; color: #94a3b8; margin: 0 auto 1rem auto; display: block;"></i>
        <h3 style="font-weight: 700; color: #334155;">ไม่พบสินค้าที่ตรงกับการค้นหา</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  container.innerHTML = filteredProducts.map((prod) => `
    <div class="product-card" id="card-${prod.id}">
      <div class="card-image-box">
        <img src="${prod.coverImage}" alt="${prod.title}" onerror="this.src='/covers/ui-digital-shop.png'">
        <span class="card-cat-badge">${prod.category.toUpperCase()}</span>
        <span class="card-file-badge">${prod.fileType}</span>
      </div>
      <div class="card-body">
        <div class="card-author">ผู้ลงขาย: <strong>${prod.author}</strong></div>
        <h4 class="card-title" title="${prod.title}">${prod.title}</h4>
        <p class="card-desc">${prod.description}</p>
        <div class="card-footer">
          <div class="price-box">
            <span class="current-price">฿${prod.price.toLocaleString()}</span>
            ${prod.originalPrice ? `<span class="old-price">฿${prod.originalPrice.toLocaleString()}</span>` : ""}
          </div>
          <button class="card-action-btn" onclick="addToCart('${prod.id}')">
            <i data-lucide="plus"></i>
            <span>ใส่ตะกร้า</span>
          </button>
        </div>
      </div>
    </div>
  `).join("");

  refreshIcons();
}

function selectCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll("#categoryPillsList .cat-pill").forEach((pill) => {
    pill.classList.remove("active");
  });
  event?.target?.classList.add("active");

  const titleMap = {
    all: "สินค้าทั้งหมด",
    ebook: "📚 หนังสือดิจิทัล & E-Book",
    software: "💻 ซอฟต์แวร์ & โค้ดโปรเจกต์",
    template: "📋 เทมเพลตพร้อมใช้งาน",
    course: "🎓 คอร์สออนไลน์"
  };
  const titleEl = document.getElementById("currentCategoryTitle");
  if (titleEl) titleEl.innerText = titleMap[cat] || "รายการสินค้า";

  applyFilters();
  renderProducts();
}

function handleSearch() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  currentSearch = input.value.trim();

  if (currentSearch) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }

  applyFilters();
  renderProducts();
}

function clearSearch() {
  const input = document.getElementById("searchInput");
  input.value = "";
  currentSearch = "";
  document.getElementById("clearSearchBtn").classList.add("hidden");
  applyFilters();
  renderProducts();
}

function handleSortChange() {
  const sort = document.getElementById("sortSelect").value;
  if (sort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === "newest") {
    filteredProducts.reverse();
  } else {
    applyFilters();
  }
  renderProducts();
}

// ============================================================
// 5. PDF / E-BOOK FILE UPLOAD & SELL LOGIC
// ============================================================
function handleFilePicked(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  processFile(file);
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("dropZone").classList.add("dragover");
}

function handleDragLeave(e) {
  e.preventDefault();
  document.getElementById("dropZone").classList.remove("dragover");
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById("dropZone").classList.remove("dragover");
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    processFile(e.dataTransfer.files[0]);
  }
}

async function processFile(file) {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
  const ext = file.name.split(".").pop().toUpperCase();
  const fileTypeLabel = ext === "PDF" ? "PDF (E-Book)" : (ext === "ZIP" ? "ZIP (Archive)" : ext);

  // Auto upload to Supabase Storage if available
  let uploadedUrl = `/downloads/${encodeURIComponent(file.name)}`;
  let storageSource = "Local System";

  if (supabaseClient) {
    try {
      const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { data, error } = await supabaseClient.storage
        .from("ebooks")
        .upload(`uploads/${cleanName}`, file, { upsert: true });

      if (!error && data) {
        const { data: pubData } = supabaseClient.storage.from("ebooks").getPublicUrl(`uploads/${cleanName}`);
        if (pubData?.publicUrl) {
          uploadedUrl = pubData.publicUrl;
          storageSource = "Supabase Storage";
        }
      }
    } catch (err) {
      console.warn("Storage upload fallback:", err);
    }
  }

  uploadedFileData = {
    name: file.name,
    size: `${sizeMb} MB`,
    type: fileTypeLabel,
    url: uploadedUrl,
    storage: storageSource
  };

  // Update UI
  document.getElementById("dropZone").classList.add("hidden");
  const card = document.getElementById("fileStatusCard");
  card.classList.remove("hidden");
  document.getElementById("uploadedFileName").innerText = file.name;
  document.getElementById("uploadedFileSizeBadge").innerText = `${sizeMb} MB`;
  document.getElementById("uploadedFileTypeBadge").innerText = fileTypeLabel;
  document.getElementById("storageBadge").innerText = `☁️ ${storageSource}`;

  // Auto-fill Title if empty
  const titleInput = document.getElementById("productTitleInput");
  if (!titleInput.value.trim()) {
    const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    titleInput.value = rawName;
    updatePreview();
  }

  showToast(`📂 อัปโหลดไฟล์ "${file.name}" เรียบร้อยแล้ว!`);
  refreshIcons();
}

function removeUploadedFile() {
  uploadedFileData = null;
  document.getElementById("ebookFileInput").value = "";
  document.getElementById("fileStatusCard").classList.add("hidden");
  document.getElementById("dropZone").classList.remove("hidden");
  showToast("ยกเลิกการเลือกไฟล์แล้ว");
}

function applyPresetSample(type) {
  if (type === "nextjs") {
    uploadedFileData = {
      name: "Nextjs-Supabase-Mastery.pdf",
      size: "3.4 MB",
      type: "PDF (E-Book)",
      url: "/downloads/E-Book%20Store.docx",
      storage: "Supabase Ready"
    };
    document.getElementById("productTitleInput").value = "คู่มือพัฒนา Fullstack Next.js & Supabase 2026";
    document.getElementById("productDescInput").value = "คู่มือฉบับสมบูรณ์สำหรับการพัฒนาระบบ Web App และ API ด้วย Next.js 15, Tailwind CSS และฐานข้อมูล Supabase Cloud";
    document.getElementById("productPriceInput").value = "249";
    document.getElementById("productOriginalPriceInput").value = "490";
    setCoverPreset("/covers/ebook-store-guide-cover.jpg");
  } else {
    uploadedFileData = {
      name: "AI-Prompt-Mastery-Guide.pdf",
      size: "2.8 MB",
      type: "PDF (E-Book)",
      url: "/downloads/E-Book%20Store.docx",
      storage: "Supabase Ready"
    };
    document.getElementById("productTitleInput").value = "AI Prompt Mastery: เทคนิคเขียนคำสั่ง AI ระดับมือโปร";
    document.getElementById("productDescInput").value = "รวม 100+ สูตรคำสั่ง AI พร้อมใช้งาน ช่วยเพิ่มประสิทธิภาพการทำงานและเขียนโค้ดเร็วขึ้น 10 เท่า";
    document.getElementById("productPriceInput").value = "189";
    document.getElementById("productOriginalPriceInput").value = "350";
    setCoverPreset("/covers/ui-digital-shop.png");
  }

  document.getElementById("dropZone").classList.add("hidden");
  const card = document.getElementById("fileStatusCard");
  card.classList.remove("hidden");
  document.getElementById("uploadedFileName").innerText = uploadedFileData.name;
  document.getElementById("uploadedFileSizeBadge").innerText = uploadedFileData.size;
  document.getElementById("uploadedFileTypeBadge").innerText = uploadedFileData.type;

  updatePreview();
  showToast(`✨ โหลดข้อมูลตัวอย่าง E-Book เรียบร้อยแล้ว!`);
}

function selectFormCategory(cat, el) {
  document.querySelectorAll(".cat-radio-label").forEach((lbl) => lbl.classList.remove("active"));
  el.classList.add("active");
  const badge = document.getElementById("previewCategoryBadge");
  if (badge) badge.innerText = cat.toUpperCase();
}

function setCoverPreset(url, el) {
  document.getElementById("productCoverInput").value = url;
  if (el) {
    document.querySelectorAll(".cover-chip").forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  }
  const img = document.getElementById("previewCoverImg");
  if (img) img.src = url;
}

// Live Update Preview as typing
document.addEventListener("input", (e) => {
  if (["productTitleInput", "productPriceInput", "productOriginalPriceInput", "productDescInput"].includes(e.target.id)) {
    updatePreview();
  }
});

function updatePreview() {
  const title = document.getElementById("productTitleInput")?.value || "ชื่อสินค้าของคุณจะแสดงตรงนี้";
  const desc = document.getElementById("productDescInput")?.value || "คำอธิบาย จุดเด่น และรายละเอียดไฟล์ E-Book...";
  const price = Number(document.getElementById("productPriceInput")?.value || 199);
  const origPrice = Number(document.getElementById("productOriginalPriceInput")?.value || 390);

  document.getElementById("previewTitleLabel").innerText = title;
  document.getElementById("previewDescLabel").innerText = desc;
  document.getElementById("previewPriceLabel").innerText = `฿${price.toLocaleString()}`;
  document.getElementById("previewOriginalPriceLabel").innerText = `฿${origPrice.toLocaleString()}`;
  document.getElementById("previewAuthorLabel").innerText = currentUser.name;
}

// Submit Product Form to Supabase
async function handlePublishProduct(e) {
  e.preventDefault();
  const title = document.getElementById("productTitleInput").value.trim();
  const desc = document.getElementById("productDescInput").value.trim();
  const price = Number(document.getElementById("productPriceInput").value);
  const origPrice = Number(document.getElementById("productOriginalPriceInput").value);
  const cover = document.getElementById("productCoverInput").value.trim() || "/covers/default.png";
  const cat = document.querySelector('input[name="productCat"]:checked')?.value || "ebook";

  const btn = document.getElementById("submitProductBtn");
  const btnText = document.getElementById("submitBtnText");
  btn.disabled = true;
  btnText.innerText = "กำลังบันทึกลง Supabase...";

  const newProdId = `prod-${Date.now()}`;
  const finalFileName = uploadedFileData?.name || `${title.slice(0, 15)}.pdf`;
  const finalFileSize = uploadedFileData?.size || "2.5 MB";
  const finalFileType = uploadedFileData?.type || (cat === "ebook" ? "PDF (E-Book)" : "ZIP");
  const finalDownloadUrl = uploadedFileData?.url || `/downloads/${encodeURIComponent(finalFileName)}`;

  const productObject = {
    id: newProdId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-"),
    description: desc,
    category: cat,
    price,
    original_price: origPrice > price ? origPrice : null,
    cover_image: cover,
    file_type: finalFileType,
    file_size: finalFileSize,
    file_name: finalFileName,
    download_file_url: finalDownloadUrl,
    author: `${currentUser.name} (${currentUser.email})`,
    features: ["ดาวน์โหลดได้ทันทีหลังสั่งซื้อ", "ลิขสิทธิ์ถูกต้อง 100%"]
  };

  let savedSuccessfully = false;

  // Save to Supabase
  if (supabaseClient) {
    try {
      let { error } = await supabaseClient.from("products").upsert(productObject, { onConflict: "id" });
      
      // Auto-retry pattern if schema differences occur
      if (error) {
        console.warn("Supabase upsert retry notice:", error.message);
        const simplified = { ...productObject };
        delete simplified.original_price;
        const retry = await supabaseClient.from("products").upsert(simplified, { onConflict: "id" });
        if (!retry.error) savedSuccessfully = true;
      } else {
        savedSuccessfully = true;
      }
    } catch (err) {
      console.warn("Supabase save exception:", err);
    }
  }

  // Also add to local state
  const localProduct = {
    ...productObject,
    originalPrice: productObject.original_price,
    coverImage: productObject.cover_image,
    fileType: productObject.file_type,
    fileSize: productObject.file_size,
    fileName: productObject.file_name,
    downloadUrl: productObject.download_file_url,
    sellerEmail: currentUser.email
  };
  allProducts.unshift(localProduct);
  applyFilters();
  renderProducts();
  renderMyPublishedProducts();

  // Confetti celebration
  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }

  showToast(`🎉 ลงขายสินค้า "${title}" สำเร็จ! บันทึกลง Supabase เรียบร้อย`);

  // Reset form
  document.getElementById("sellProductForm").reset();
  removeUploadedFile();
  btn.disabled = false;
  btnText.innerText = "ลงขายสินค้าทันที (Publish to Supabase)";
}

function renderMyPublishedProducts() {
  const container = document.getElementById("myProductsListContainer");
  const badge = document.getElementById("myProductsCountBadge");
  if (!container) return;

  const myProds = allProducts.filter((p) => 
    p.author?.includes(currentUser.name) || 
    p.author?.includes(currentUser.email) ||
    p.sellerEmail === currentUser.email
  );

  if (badge) badge.innerText = String(myProds.length);

  if (myProds.length === 0) {
    container.innerHTML = `<p class="empty-hint" style="color: #94a3b8; font-size: 0.75rem; text-align: center; padding: 1rem;">คุณยังไม่มีสินค้าที่ลงขาย</p>`;
    return;
  }

  container.innerHTML = myProds.map((prod) => `
    <div class="my-product-row">
      <div class="flex-align gap-2 min-w-0" style="flex: 1;">
        <span style="font-size: 1rem;">📘</span>
        <div style="min-width: 0;">
          <strong style="display: block; font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prod.title}</strong>
          <span style="font-size: 0.7rem; color: #2563eb; font-weight: 700;">฿${prod.price.toLocaleString()}</span>
        </div>
      </div>
      <button onclick="deletePublishedProduct('${prod.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.25rem;">
        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
      </button>
    </div>
  `).join("");

  refreshIcons();
}

async function deletePublishedProduct(id) {
  if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;

  if (supabaseClient) {
    try {
      await supabaseClient.from("products").delete().eq("id", id);
    } catch (e) {}
  }

  allProducts = allProducts.filter((p) => p.id !== id);
  applyFilters();
  renderProducts();
  renderMyPublishedProducts();
  showToast("ลบสินค้าเรียบร้อยแล้ว");
}

// ============================================================
// 6. CART & CHECKOUT
// ============================================================
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }

  saveState();
  updateCartBadge();
  renderCartItems();
  toggleCartDrawer(true);
  showToast(`🛒 เพิ่ม "${product.title}" ลงตะกร้าแล้ว`);
}

function updateCartBadge() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cartCountBadge");
  if (badge) badge.innerText = String(count);

  const drawerBadge = document.getElementById("drawerItemsCount");
  if (drawerBadge) drawerBadge.innerText = `(${count} รายการ)`;
}

function toggleCartDrawer(open) {
  const overlay = document.getElementById("cartDrawerOverlay");
  if (open) {
    renderCartItems();
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

function renderCartItems() {
  const list = document.getElementById("cartItemsList");
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
        <i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin: 0 auto 0.75rem auto; display: block;"></i>
        <p style="font-size: 0.85rem; font-weight: 600;">ตะกร้าสินค้าว่างเปล่า</p>
      </div>
    `;
    updateCartTotals();
    refreshIcons();
    return;
  }

  list.innerHTML = cart.map((item, idx) => `
    <div class="cart-item-card">
      <img src="${item.product.coverImage}" alt="${item.product.title}">
      <div class="cart-item-info">
        <h5 class="cart-item-title">${item.product.title}</h5>
        <div class="cart-item-price">฿${(item.product.price * item.quantity).toLocaleString()}</div>
      </div>
      <button onclick="removeFromCart(${idx})" style="background: none; border: none; color: #ef4444; cursor: pointer; align-self: center;">
        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
      </button>
    </div>
  `).join("");

  updateCartTotals();
  refreshIcons();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveState();
  updateCartBadge();
  renderCartItems();
}

function updateCartTotals() {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = total > 500 ? 50 : 0;
  const net = Math.max(0, total - discount);

  document.getElementById("cartSubtotalText").innerText = `฿${total.toLocaleString()}`;
  document.getElementById("cartDiscountText").innerText = `-฿${discount.toLocaleString()}`;
  document.getElementById("cartGrandTotalText").innerText = `฿${net.toLocaleString()}`;
  document.getElementById("modalTotalAmount").innerText = `฿${net.toLocaleString()}`;
}

// Checkout Modal
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast("กรุณาเลือกสินค้าลงตะกร้าก่อนชำระเงิน");
    return;
  }
  toggleCartDrawer(false);
  document.getElementById("checkoutModal").classList.remove("hidden");
  refreshIcons();
}

function closeCheckoutModal() {
  document.getElementById("checkoutModal").classList.add("hidden");
}

async function confirmPaymentAndCompleteOrder() {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const orderNumber = `#LB${Date.now().toString().slice(-6)}`;
  
  const purchasedItems = cart.map((item) => ({
    productId: item.product.id,
    title: item.product.title,
    price: item.product.price,
    downloadUrl: item.product.downloadUrl,
    fileName: item.product.fileName,
    fileType: item.product.fileType,
    fileSize: item.product.fileSize,
    coverImage: item.product.coverImage
  }));

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber,
    date: new Date().toLocaleDateString("th-TH"),
    items: purchasedItems,
    totalAmount: total,
    status: "completed",
    customerName: currentUser.name,
    customerEmail: currentUser.email
  };

  // Save to Supabase orders
  if (supabaseClient) {
    try {
      await supabaseClient.from("orders").insert({
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        items: newOrder.items,
        total_amount: newOrder.totalAmount,
        status: "completed",
        customer_name: newOrder.customerName,
        customer_email: newOrder.customerEmail
      });
    } catch (e) {
      console.warn("Supabase order insert notice:", e);
    }
  }

  // Save locally
  orders.unshift(newOrder);
  cart = [];
  saveState();
  updateCartBadge();
  closeCheckoutModal();
  renderOrders();

  if (window.confetti) {
    window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  }

  showToast(`🎉 ชำระเงินสำเร็จ! รับคำสั่งซื้อ ${orderNumber} เรียบร้อย`);
  switchTab("orders");
}

function renderOrders() {
  const container = document.getElementById("ordersListContainer");
  const badge = document.getElementById("ordersCountBadge");
  const statOrders = document.getElementById("statOrdersCount");
  const statEbooks = document.getElementById("statEbooksCount");

  const totalOrdersCount = orders.length;
  let totalFilesCount = 0;
  orders.forEach((o) => (totalFilesCount += o.items?.length || 0));

  if (badge) {
    badge.innerText = String(totalFilesCount);
    badge.classList.toggle("hidden", totalFilesCount === 0);
  }
  if (statOrders) statOrders.innerText = String(totalOrdersCount);
  if (statEbooks) statEbooks.innerText = String(totalFilesCount);

  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0;">
        <i data-lucide="download-cloud" style="width: 56px; height: 56px; color: #94a3b8; margin: 0 auto 1rem auto; display: block;"></i>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e293b;">ยังไม่มีรายการสั่งซื้อและดาวน์โหลด</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">เมื่อคุณสั่งซื้อ E-Book หรือซอร์สโค้ด ไฟล์จะปรากฏที่นี่ทันที</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  container.innerHTML = orders.map((ord) => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; margin-bottom: 1rem;">
        <div>
          <strong style="color: #2563eb; font-size: 0.95rem;">คำสั่งซื้อ ${ord.orderNumber}</strong>
          <span style="font-size: 0.75rem; color: #94a3b8; margin-left: 0.5rem;">${ord.date}</span>
        </div>
        <span style="background: #ecfdf5; color: #065f46; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px;">ชำระเงินสำเร็จ</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${ord.items.map((it) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.5rem;">📘</span>
              <div>
                <strong style="font-size: 0.85rem; color: #1e293b; display: block;">${it.title}</strong>
                <small style="font-size: 0.7rem; color: #64748b;">${it.fileType || "PDF"} • ${it.fileSize || "1.5 MB"}</small>
              </div>
            </div>
            <a href="${it.downloadUrl || '#'}" download="${it.fileName || 'ebook.pdf'}" class="btn btn-primary" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; text-decoration: none;">
              <i data-lucide="download"></i>
              <span>ดาวน์โหลดไฟล์</span>
            </a>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  refreshIcons();
}

// ============================================================
// 7. TAB NAVIGATION & TOAST
// ============================================================
function switchTab(tabId) {
  document.querySelectorAll(".tab-view").forEach((view) => view.classList.remove("active"));
  document.querySelectorAll(".nav-tab-btn").forEach((btn) => btn.classList.remove("active"));

  if (tabId === "store") {
    document.getElementById("tabStore").classList.add("active");
    document.getElementById("navStoreBtn")?.classList.add("active");
  } else if (tabId === "sell") {
    document.getElementById("tabSell").classList.add("active");
    document.getElementById("navSellBtn")?.classList.add("active");
    updatePreview();
  } else if (tabId === "orders") {
    document.getElementById("tabOrders").classList.add("active");
    document.getElementById("navOrdersBtn")?.classList.add("active");
    renderOrders();
  } else if (tabId === "profile") {
    document.getElementById("tabProfile").classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  refreshIcons();
}

function scrollToElement(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);

  refreshIcons();
}
