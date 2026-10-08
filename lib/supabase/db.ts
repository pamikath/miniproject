import { supabase, isSupabaseConfigured } from "./client";
import { Product, Order, UserProfile, OrderStatus } from "@/lib/types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS } from "@/lib/data/initialData";

// ==========================================
// DATA MAPPING HELPERS
// ==========================================

export function rowToProduct(row: any): Product {
  const parseArr = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  return {
    id: String(row.id || row.productId || `prod-${Date.now()}`),
    title: row.title || "สินค้าไม่มีชื่อ",
    slug: row.slug || String(row.id || "").toLowerCase(),
    description: row.description || "",
    category: row.category || "other",
    tags: parseArr(row.tags) as any,
    price: Number(row.price || 0),
    originalPrice:
      row.original_price !== undefined && row.original_price !== null
        ? Number(row.original_price)
        : row.originalPrice !== undefined && row.originalPrice !== null
        ? Number(row.originalPrice)
        : undefined,
    coverImage: row.cover_image || row.coverImage || "/covers/default.png",
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    fileType: row.file_type || row.fileType || "ZIP",
    fileSize: row.file_size || row.fileSize || "0 MB",
    downloadFileUrl: row.download_file_url || row.downloadFileUrl || "#",
    fileName: row.file_name || row.fileName || "digital-product.zip",
    features: parseArr(row.features),
    author: row.author || "LeafBook Team",
    sellerEmail:
      row.seller_email ||
      row.sellerEmail ||
      (row.author && row.author.includes("(") ? row.author.match(/\(([^)]+)\)/)?.[1] : undefined) ||
      undefined,
  };
}

export function productToRow(p: Product): Record<string, any> {
  const sellerEmail = p.sellerEmail;
  const authorName = p.author || "LeafBook Creator";
  const authorWithEmail =
    sellerEmail && !authorName.includes("(")
      ? `${authorName} (${sellerEmail})`
      : authorName;

  const row: Record<string, any> = {
    id: p.id,
    title: p.title,
    slug: p.slug || p.id.toLowerCase(),
    description: p.description,
    category: p.category,
    tags: p.tags,
    price: p.price,
    original_price: p.originalPrice ?? null,
    cover_image: p.coverImage,
    rating: p.rating,
    review_count: p.reviewCount,
    file_type: p.fileType,
    file_size: p.fileSize,
    download_file_url: p.downloadFileUrl,
    file_name: p.fileName,
    features: p.features || [],
    author: authorWithEmail,
    updated_at: new Date().toISOString(),
  };

  if (p.sellerEmail) {
    row.seller_email = p.sellerEmail;
  }
  return row;
}

export function rowToOrder(row: any): Order {
  let parsedItems: any[] = [];
  if (Array.isArray(row.items)) {
    parsedItems = row.items;
  } else if (typeof row.items === "string") {
    try {
      parsedItems = JSON.parse(row.items);
    } catch {}
  }

  return {
    id: String(row.id || `ord-${Date.now()}`),
    orderNumber: row.order_number || row.orderNumber || `#LB${Date.now()}`,
    date:
      row.date ||
      (row.created_at
        ? new Date(row.created_at).toLocaleDateString("th-TH")
        : "วันนี้"),
    items: parsedItems,
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    discount: Number(row.discount ?? 0),
    netAmount: Number(row.net_amount ?? row.netAmount ?? 0),
    status: (row.status || "completed") as OrderStatus,
    paymentMethod: row.payment_method || row.paymentMethod || "promptpay",
    customerName: row.customer_name || row.customerName || undefined,
    customerEmail: row.customer_email || row.customerEmail || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    downloadExpiry: row.download_expiry || row.downloadExpiry || undefined,
    downloadCount: Number(row.download_count ?? row.downloadCount ?? 0),
  };
}

export function orderToRow(o: Order): Record<string, any> {
  return {
    id: o.id,
    order_number: o.orderNumber,
    date: o.date,
    items: o.items,
    total_amount: o.totalAmount,
    discount: o.discount,
    net_amount: o.netAmount,
    status: o.status,
    payment_method: o.paymentMethod,
    customer_name: o.customerName || null,
    customer_email: o.customerEmail || null,
    download_expiry: o.downloadExpiry || null,
    download_count: o.downloadCount || 0,
    created_at: o.createdAt || new Date().toISOString(),
  };
}

export function rowToProfile(row: any): UserProfile {
  let parsedStats = { favoritesCount: 0, ordersCount: 0, rewardPoints: 50 };
  if (row.stats && typeof row.stats === "object") {
    parsedStats = { ...parsedStats, ...row.stats };
  } else if (typeof row.stats === "string") {
    try {
      parsedStats = { ...parsedStats, ...JSON.parse(row.stats) };
    } catch {}
  }

  let parsedAddress = undefined;
  if (row.address && typeof row.address === "object") {
    parsedAddress = row.address;
  } else if (typeof row.address === "string") {
    try {
      parsedAddress = JSON.parse(row.address);
    } catch {}
  }

  return {
    id: String(row.id),
    name: row.name || "ผู้ใช้งาน",
    email: row.email || "",
    role: row.role === "admin" ? "admin" : "user",
    phone: row.phone || "",
    bio: row.bio || "",
    avatar:
      row.avatar ||
      "https://i.pinimg.com/736x/2f/d2/1b/2fd21bd35fbe51140cb7d534b157ce2d.jpg",
    isVip: Boolean(row.is_vip ?? row.isVip),
    tier: (row.tier || "Member") as "Member" | "Pro" | "VIP",
    stats: parsedStats,
    address: parsedAddress,
    joinedDate: row.joined_date || row.joinedDate || row.created_at,
  };
}

export function profileToRow(u: UserProfile): Record<string, any> {
  return {
    id: u.id,
    name: u.name,
    email: u.email.toLowerCase().trim(),
    role: u.role || "user",
    phone: u.phone || null,
    bio: u.bio || null,
    avatar: u.avatar,
    is_vip: u.isVip,
    tier: u.tier,
    stats: u.stats,
    address: u.address || null,
    updated_at: new Date().toISOString(),
  };
}

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

/**
 * Fetch all products from Supabase database
 */
export async function getProductsFromSupabase(): Promise<{
  success: boolean;
  products: Product[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: true, products: INITIAL_PRODUCTS, fromDatabase: false };
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase products query warning:", error.message);
      return { success: false, products: INITIAL_PRODUCTS, fromDatabase: false, error: error.message };
    }

    if (data && data.length > 0) {
      const converted = data.map(rowToProduct);
      return { success: true, products: converted, fromDatabase: true };
    }

    return { success: true, products: INITIAL_PRODUCTS, fromDatabase: false };
  } catch (err: any) {
    console.warn("Failed to fetch products from Supabase:", err);
    return { success: false, products: INITIAL_PRODUCTS, fromDatabase: false, error: err.message };
  }
}

/**
 * Upsert / save a product to Supabase
 */
export async function saveProductToSupabase(
  product: Product
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured" };
  }

  try {
    const row = productToRow(product);
    let { error } = await supabase.from("products").upsert(row, { onConflict: "id" });

    // หากตาราง products ใน Supabase ยังไม่มีคอลัมน์ seller_email ให้ตัดคอลัมน์นี้ออกแล้วบันทึกซ้ำทันที
    if (error && (error.message.includes("seller_email") || error.code === "PGRST204")) {
      console.warn("Supabase schema retry: saving without seller_email column...");
      delete row.seller_email;
      const retry = await supabase.from("products").upsert(row, { onConflict: "id" });
      error = retry.error;
    }

    if (error) {
      console.error("Supabase product upsert error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("Supabase product upsert exception:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a product from Supabase
 */
export async function deleteProductFromSupabase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.warn("Supabase product delete error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch orders from Supabase (optional filter by customer email)
 */
export async function getOrdersFromSupabase(customerEmail?: string): Promise<{
  success: boolean;
  orders: Order[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: true, orders: INITIAL_ORDERS, fromDatabase: false };
  }

  try {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (customerEmail) {
      query = query.eq("customer_email", customerEmail.toLowerCase().trim());
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase orders query warning:", error.message);
      return { success: false, orders: INITIAL_ORDERS, fromDatabase: false, error: error.message };
    }

    if (data && data.length > 0) {
      const converted = data.map(rowToOrder);
      return { success: true, orders: converted, fromDatabase: true };
    }

    return { success: true, orders: INITIAL_ORDERS, fromDatabase: false };
  } catch (err: any) {
    return { success: false, orders: INITIAL_ORDERS, fromDatabase: false, error: err.message };
  }
}

/**
 * Save an order to Supabase
 */
export async function saveOrderToSupabase(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured" };
  }

  try {
    const row = orderToRow(order);
    const { error } = await supabase.from("orders").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase order upsert error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update order status in Supabase
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      console.warn("Supabase order status update error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch profiles / customers from Supabase
 */
export async function getCustomersFromSupabase(): Promise<{
  success: boolean;
  customers: UserProfile[];
  fromDatabase: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: true, customers: INITIAL_CUSTOMERS, fromDatabase: false };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase profiles query warning:", error.message);
      return { success: false, customers: INITIAL_CUSTOMERS, fromDatabase: false, error: error.message };
    }

    if (data && data.length > 0) {
      const converted = data.map(rowToProfile);
      return { success: true, customers: converted, fromDatabase: true };
    }

    return { success: true, customers: INITIAL_CUSTOMERS, fromDatabase: false };
  } catch (err: any) {
    return { success: false, customers: INITIAL_CUSTOMERS, fromDatabase: false, error: err.message };
  }
}

/**
 * Upsert user profile to Supabase
 */
export async function saveProfileToSupabase(
  profile: UserProfile
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const row = profileToRow(profile);
    const { error } = await supabase.from("profiles").upsert(row, { onConflict: "email" });
    if (error) {
      console.warn("Supabase profile upsert error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete customer / profile from Supabase
 */
export async function deleteCustomerFromSupabase(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false };

  try {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("email", email.toLowerCase().trim());

    if (error) {
      console.warn("Supabase profile delete error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sync initial data (Seed) to Supabase tables if they are empty
 */
export async function seedInitialDataToSupabase(): Promise<{
  success: boolean;
  message: string;
  count: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "ยังไม่ได้ระบุ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local",
      count: 0,
    };
  }

  try {
    // 1. Seed Products
    const rows = INITIAL_PRODUCTS.map(productToRow);
    const { error: prodError } = await supabase.from("products").upsert(rows, { onConflict: "id" });

    if (prodError) {
      return {
        success: false,
        message: `เกิดข้อผิดพลาดในการบันทึกสินค้าลง Supabase: ${prodError.message}`,
        count: 0,
      };
    }

    // 2. Seed Customers
    const custRows = INITIAL_CUSTOMERS.map(profileToRow);
    await supabase.from("profiles").upsert(custRows, { onConflict: "email" });

    // 3. Seed Orders
    const orderRows = INITIAL_ORDERS.map(orderToRow);
    await supabase.from("orders").upsert(orderRows, { onConflict: "id" });

    return {
      success: true,
      message: `ซิงค์ข้อมูลสำเร็จ! อัปโหลดสินค้า ${rows.length} รายการลง Supabase แล้ว`,
      count: rows.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `เกิดข้อผิดพลาด: ${err.message}`,
      count: 0,
    };
  }
}
