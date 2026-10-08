"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, CartItem, Order, OrderItem, UserProfile, ProductCategory, AddressInfo, OrderStatus } from "@/lib/types";
import { INITIAL_PRODUCTS, INITIAL_USER, INITIAL_ORDERS, INITIAL_CUSTOMERS } from "@/lib/data/initialData";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  getOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  getCustomersFromSupabase,
  saveProfileToSupabase,
  deleteCustomerFromSupabase,
  seedInitialDataToSupabase,
} from "@/lib/supabase/db";

interface ShopContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<{ success: boolean; error?: string; product?: Product }> | void;
  deleteProduct: (id: string) => void;
  importProducts: (newProducts: Product[], replace?: boolean) => void;
  customers: UserProfile[];
  addCustomer: (customer: UserProfile) => void;
  deleteCustomer: (email: string) => void;
  importCustomers: (newCustomers: UserProfile[], replace?: boolean) => void;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  createOrder: (paymentMethod: "stripe" | "promptpay" | "credit_card", discountAmount?: number) => Order;
  importOrders: (newOrders: Order[], replace?: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  buyNow: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSelectItem: (productId: string) => void;
  selectAllItems: (selected?: boolean) => void;
  removeSelectedFromCart: () => void;
  selectedItems: CartItem[];
  selectedCartCount: number;
  selectedCartTotal: number;
  isAllSelected: boolean;
  cartCount: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  user: UserProfile;
  isAdmin: boolean;
  switchRole: (role: "user" | "admin") => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  updateAddress: (address: AddressInfo) => void;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  login: (email: string, name?: string, role?: "user" | "admin") => void;
  logout: () => void;
  register: (name: string, email: string) => void;
  downloadFile: (item: OrderItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  darkSidebar: boolean;
  toggleDarkSidebar: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSupabaseReady: boolean;
  supabaseStatus: "connected" | "fallback" | "unconfigured";
  syncWithSupabase: () => Promise<{ success: boolean; message: string; count?: number }>;
}

const GUEST_USER: UserProfile = {
  id: "guest",
  name: "ผู้เยี่ยมชม",
  email: "",
  role: "user",
  phone: "",
  bio: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
  avatar: "https://i.pinimg.com/736x/2f/d2/1b/2fd21bd35fbe51140cb7d534b157ce2d.jpg",
  isVip: false,
  tier: "Member",
  stats: {
    favoritesCount: 0,
    ordersCount: 0,
    rewardPoints: 0,
  },
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile>(GUEST_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<UserProfile[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [darkSidebar, setDarkSidebar] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"connected" | "fallback" | "unconfigured">("unconfigured");

  const isHydrated = React.useRef(false);

  const toggleDarkSidebar = () => {
    setDarkSidebar((prev) => !prev);
  };

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      // ตรวจสอบสถานะการล็อกอิน
      const storedLoggedIn =
        localStorage.getItem("leafbook_logged_in") === "true" ||
        sessionStorage.getItem("leafbook_logged_in") === "true";
      const storedUser = localStorage.getItem("leafbook_user");

      if (storedLoggedIn && storedUser) {
        try {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);

          const savedCart = localStorage.getItem("leafbook_cart");
          if (savedCart) {
            const parsed: CartItem[] = JSON.parse(savedCart);
            setCart(parsed.map((item) => ({ ...item, selected: item.selected !== false })));
          }

          const savedWishlist = localStorage.getItem("leafbook_wishlist");
          if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
          } else if (parsedUser.email?.toLowerCase().includes("pamika")) {
            setWishlist(["prod-1", "prod-3", "prod-5", "prod-6", "prod-7"]);
          }
        } catch {
          setIsLoggedIn(false);
          setUser(GUEST_USER);
          setCart([]);
          setWishlist([]);
        }
      } else {
        // สถานะผู้เยี่ยมชมที่ยังไม่ได้เข้าสู่ระบบ: เริ่มต้นตะกร้าและรายการโปรดว่างเปล่า (0 รายการ)
        setIsLoggedIn(false);
        setUser(GUEST_USER);
        setCart([]);
        setWishlist([]);
      }

      const savedOrders = localStorage.getItem("leafbook_orders");
      if (savedOrders) {
        const parsedOrders: Order[] = JSON.parse(savedOrders);
        const missingOrders = INITIAL_ORDERS.filter(
          (io) => !parsedOrders.some((o) => o.id === io.id)
        );
        if (missingOrders.length > 0) {
          const mergedOrders = [...parsedOrders, ...missingOrders];
          setOrders(mergedOrders);
          try {
            localStorage.setItem("leafbook_orders", JSON.stringify(mergedOrders));
          } catch {}
        } else {
          setOrders(parsedOrders);
        }
      } else {
        setOrders(INITIAL_ORDERS);
      }

      const savedCustomers = localStorage.getItem("leafbook_customers");
      if (savedCustomers) {
        const parsedCust: UserProfile[] = JSON.parse(savedCustomers);
        const missingCust = INITIAL_CUSTOMERS.filter(
          (ic) => !parsedCust.some((c) => c.email.toLowerCase() === ic.email.toLowerCase())
        );
        if (missingCust.length > 0) {
          const mergedCust = [...parsedCust, ...missingCust];
          setCustomers(mergedCust);
          try {
            localStorage.setItem("leafbook_customers", JSON.stringify(mergedCust));
          } catch {}
        } else {
          setCustomers(parsedCust);
        }
      } else {
        setCustomers(INITIAL_CUSTOMERS);
      }

      const savedProducts = localStorage.getItem("leafbook_products");
      if (savedProducts) {
        const parsed: Product[] = JSON.parse(savedProducts);
        const coverOverrideMap: Record<string, string> = {
          "prod-media-player-pro": "/covers/media-player-code-cover.jpg",
          "prod-taskmanager": "/covers/taskmanager-code-cover.jpg",
          "prod-assignment-4": "/covers/assignment-4-ai-cover.jpg",
          "prod-doc-media-player-pro": "/covers/media-player-doc-cover.jpg",
          "prod-doc-taskmanager-pro": "/covers/taskmanager-doc-cover.jpg",
          "prod-tarot-app": "/covers/tarot-code-cover.jpg",
          "prod-doc-tarot-app": "/covers/tarot-doc-cover.jpg",
          "prod-ui-digital-shop": "/covers/ui-digital-shop.png",
          "prod-ebook-store-guide": "/covers/ebook-store-guide-cover.jpg",
          "prod-exercises-bundle": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-1": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-2": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-3": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-4": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-5": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-5a": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-5b": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-6": "/covers/gas-bundle-cover.jpg",
          "prod-exercise-7": "/covers/gas-bundle-cover.jpg",
          "prod-project-9-1": "/covers/expense-tracker-cover.jpg",
          "prod-project-9-2": "/covers/helpdesk-system-cover.jpg",
        };

        const cleaned = parsed.map((p) => {
          const updated = { ...p };
          if (updated.title && updated.title.includes("เอกสารสเปก & ")) {
            updated.title = updated.title.replace("เอกสารสเปก & ", "");
          }
          if (coverOverrideMap[updated.id]) {
            updated.coverImage = coverOverrideMap[updated.id];
          }
          return updated;
        });
        const missing = INITIAL_PRODUCTS.filter(
          (ip) => !cleaned.some((p) => p.id === ip.id)
        );
        const allItems = [...cleaned, ...missing];

        // Priority list of newly added exercises, documents and codebooks to ensure they appear first
        const priorityIds = [
          "prod-ebook-store-guide",
          "prod-exercises-bundle",
          "prod-exercise-1",
          "prod-exercise-2",
          "prod-exercise-3",
          "prod-exercise-4",
          "prod-exercise-5",
          "prod-exercise-5a",
          "prod-exercise-5b",
          "prod-exercise-6",
          "prod-exercise-7",
          "prod-project-9-1",
          "prod-project-9-2",
          "prod-assignment-4",
          "prod-doc-media-player-pro",
          "prod-doc-taskmanager-pro",
          "prod-doc-tarot-app",
          "prod-ui-digital-shop",
          "prod-media-player-pro",
          "prod-tarot-app",
          "prod-taskmanager",
        ];

        const priorityItems = allItems.filter((p) => priorityIds.includes(p.id));
        const otherItems = allItems.filter((p) => !priorityIds.includes(p.id));
        priorityItems.sort((a, b) => priorityIds.indexOf(a.id) - priorityIds.indexOf(b.id));

        const merged = [...priorityItems, ...otherItems];
        setProducts(merged);
        try {
          localStorage.setItem("leafbook_products", JSON.stringify(merged));
        } catch {}
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

    } catch (e) {
      console.error("Failed to load local storage", e);
    } finally {
      isHydrated.current = true;
      setIsAuthLoading(false);
    }
  }, []);

  // Sync / Load data from Supabase Database
  useEffect(() => {
    let isMounted = true;
    async function loadFromSupabase() {
      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setIsSupabaseReady(false);
          setSupabaseStatus("unconfigured");
        }
        return;
      }

      try {
        const prodRes = await getProductsFromSupabase();
        if (isMounted && prodRes.success && prodRes.products.length > 0) {
          setProducts(prodRes.products);
          if (prodRes.fromDatabase) {
            setIsSupabaseReady(true);
            setSupabaseStatus("connected");
          }
        }

        const ordRes = await getOrdersFromSupabase();
        if (isMounted && ordRes.success && ordRes.fromDatabase && ordRes.orders.length > 0) {
          setOrders(ordRes.orders);
        }

        const custRes = await getCustomersFromSupabase();
        if (isMounted && custRes.success && custRes.fromDatabase && custRes.customers.length > 0) {
          setCustomers(custRes.customers);
        }
      } catch (err) {
        console.warn("Supabase background load warning:", err);
        if (isMounted) {
          setSupabaseStatus("fallback");
        }
      }
    }

    loadFromSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  const isAdmin = Boolean(isLoggedIn && user?.role === "admin");

  const switchRole = (role: "user" | "admin") => {
    setUser((prev) => {
      const updated: UserProfile = { ...prev, role };
      try {
        localStorage.setItem("leafbook_user", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(
      role === "admin"
        ? "🛡️ สลับเป็นโหมดผู้ดูแลระบบ (Admin) แล้ว"
        : "👤 สลับเป็นโหมดลูกค้าทั่วไป (Customer) แล้ว"
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem("leafbook_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    // Persist to Supabase Database
    updateOrderStatusInSupabase(orderId, status).catch((err) =>
      console.warn("Supabase updateOrderStatus error:", err)
    );
    showToast(`อัปเดตสถานะคำสั่งซื้อเป็น "${status}" เรียบร้อยแล้ว`);
  };

  // Save to LocalStorage (only after hydration)
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("leafbook_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("leafbook_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("leafbook_orders", JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("leafbook_products", JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      localStorage.setItem("leafbook_user", JSON.stringify(user));
      sessionStorage.setItem("leafbook_logged_in", String(isLoggedIn));
    } catch {}
  }, [user, isLoggedIn]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const login = (
    email: string,
    name?: string,
    role?: "user" | "admin"
  ) => {
    setIsLoggedIn(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. ค้นหาข้อมูลผู้ใช้เดิมจาก customers หรือที่เคยบันทึกไว้ใน localStorage
    let existingCustomer = customers.find((c) => c.email.toLowerCase() === cleanEmail);
    if (!existingCustomer) {
      try {
        const savedCustomers = localStorage.getItem("leafbook_customers");
        if (savedCustomers) {
          const parsedCust: UserProfile[] = JSON.parse(savedCustomers);
          existingCustomer = parsedCust.find((c) => c.email.toLowerCase() === cleanEmail);
        }
      } catch {}
    }

    // 2. กำหนด Role ให้ถูกต้อง:
    // - ถ้าส่ง role มาเจาะจง ให้ใช้ค่านั้น
    // - ถ้ามีประวัติที่เคยสมัครไว้ในระบบ ให้ใช้ role เดิมที่บันทึกไว้ (บัญชีสมัครใหม่จะเป็น "user" เสมอ)
    // - ถ้าเป็นอีเมลผู้ดูแลระบบ เช่น admin@leafbook.app หรือ admin@example.com ให้เป็น "admin"
    // - นอกนั้นเป็น "user" (ลูกค้าทั่วไป) ทั้งหมด ห้ามเปลี่ยนเป็นแอดมินโดยอัตโนมัติ
    const determinedRole: "user" | "admin" = role
      ? role
      : existingCustomer?.role
      ? existingCustomer.role
      : cleanEmail === "admin@leafbook.app" || cleanEmail === "admin@example.com"
      ? "admin"
      : "user";

    const isPamika = cleanEmail.includes("pamika");
    const baseData = existingCustomer || (isPamika ? INITIAL_USER : GUEST_USER);

    const updatedUser: UserProfile = {
      ...baseData,
      id: existingCustomer?.id || `user-${Date.now()}`,
      name:
        existingCustomer?.name ||
        name ||
        (isPamika ? "Pamika Thamnamuang" : cleanEmail.split("@")[0]),
      email: cleanEmail,
      role: determinedRole,
      tier: existingCustomer?.tier || (determinedRole === "admin" ? "VIP" : "Member"),
      stats: existingCustomer?.stats || (isPamika
        ? INITIAL_USER.stats
        : {
            favoritesCount: 0,
            ordersCount: 0,
            rewardPoints: 50,
          }),
    };

    setUser(updatedUser);

    // บันทึกลง customers เพื่อให้ระบบจดจำสถานะบัญชี
    setCustomers((prev) => {
      const filtered = prev.filter((c) => c.email.toLowerCase() !== cleanEmail);
      const updated = [updatedUser, ...filtered];
      try {
        localStorage.setItem("leafbook_customers", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isPamika) {
      setWishlist(["prod-1", "prod-3", "prod-5", "prod-6", "prod-7"]);
    } else if (existingCustomer && existingCustomer.stats?.favoritesCount === 0) {
      setWishlist([]);
    }

    try {
      localStorage.setItem("leafbook_user", JSON.stringify(updatedUser));
      localStorage.setItem("leafbook_logged_in", "true");
      sessionStorage.setItem("leafbook_logged_in", "true");
    } catch {}

    // Sync user profile to Supabase Database
    saveProfileToSupabase(updatedUser).catch((err) =>
      console.warn("Supabase profile sync warning:", err)
    );

    showToast(
      `ยินดีต้อนรับกลับ, ${updatedUser.name.split(" ")[0]}! (${
        determinedRole === "admin" ? "🛡️ ผู้ดูแลระบบ" : "👤 ลูกค้า"
      })`
    );
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(GUEST_USER);
    setCart([]);
    setWishlist([]);
    try {
      sessionStorage.clear();
      localStorage.removeItem("leafbook_logged_in");
      localStorage.removeItem("leafbook_cart");
      localStorage.removeItem("leafbook_wishlist");
      localStorage.removeItem("leafbook_user");
    } catch {}
    showToast("ออกจากระบบเรียบร้อยแล้ว");
    window.location.replace("/login");
  };

  const register = (name: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: "user", // ลูกค้าใหม่ที่สมัครสมาชิกเริ่มต้นเป็นลูกค้า (user) เสมอ
      avatar: "https://i.pinimg.com/736x/2f/d2/1b/2fd21bd35fbe51140cb7d534b157ce2d.jpg",
      isVip: false,
      tier: "Member",
      stats: {
        favoritesCount: 0,
        ordersCount: 0,
        rewardPoints: 50, // 50 welcome bonus points!
      },
    };

    setIsLoggedIn(true);
    setUser(newUser);

    // บันทึกลง customers ทันที เพื่อให้จดจำว่าบัญชีนี้เป็นลูกค้า
    setCustomers((prev) => {
      const filtered = prev.filter((c) => c.email.toLowerCase() !== cleanEmail);
      const updated = [newUser, ...filtered];
      try {
        localStorage.setItem("leafbook_customers", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      localStorage.setItem("leafbook_user", JSON.stringify(newUser));
      localStorage.setItem("leafbook_logged_in", "true");
      sessionStorage.setItem("leafbook_logged_in", "true");
    } catch {}

    // Sync to Supabase Database
    saveProfileToSupabase(newUser).catch((err) =>
      console.warn("Supabase register profile warning:", err)
    );

    showToast(`ยินดีต้อนรับคุณ ${cleanName}! รับฟรี 50 คะแนนและส่วนลด 10%`);
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem("leafbook_user", JSON.stringify(updated));
      } catch {}
      saveProfileToSupabase(updated).catch((err) =>
        console.warn("Supabase updateUserProfile error:", err)
      );
      return updated;
    });
    showToast("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!");
  };

  const updateAddress = (newAddress: AddressInfo) => {
    setUser((prev) => {
      const updated = { ...prev, address: newAddress };
      try {
        localStorage.setItem("leafbook_user", JSON.stringify(updated));
      } catch {}
      saveProfileToSupabase(updated).catch((err) =>
        console.warn("Supabase updateAddress error:", err)
      );
      return updated;
    });
    showToast("บันทึกข้อมูลที่อยู่จัดส่ง / ใบกำกับภาษีเรียบร้อยแล้ว!");
  };

  const addToCart = (product: Product, quantity = 1, openDrawer = true) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, selected: true }
            : item
        );
      }
      return [...prev, { product, quantity, selected: true }];
    });
    showToast(`เพิ่ม "${product.title}" ลงในตะกร้าเรียบร้อย`);
    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }
  };

  const buyNow = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => ({
          ...item,
          selected: item.product.id === product.id,
        }));
      }
      return [
        ...prev.map((item) => ({ ...item, selected: false })),
        { product, quantity: 1, selected: true },
      ];
    });
    router.push("/checkout");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast("ลบสินค้าออกจากตะกร้าเรียบร้อย");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleSelectItem = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, selected: item.selected === false ? true : false }
          : item
      )
    );
  };

  const selectAllItems = (selected?: boolean) => {
    setCart((prev) => {
      const allSelectedNow =
        prev.length > 0 && prev.every((item) => item.selected !== false);
      const nextState = selected !== undefined ? selected : !allSelectedNow;
      return prev.map((item) => ({ ...item, selected: nextState }));
    });
  };

  const removeSelectedFromCart = () => {
    const selectedCount = cart.filter((item) => item.selected !== false).length;
    if (selectedCount === 0) return;
    setCart((prev) => prev.filter((item) => item.selected === false));
    showToast(`ลบสินค้าที่เลือก (${selectedCount} รายการ) ออกจากตะกร้าแล้ว`);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const selectedItems = cart.filter((item) => item.selected !== false);
  const selectedCartCount = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const selectedCartTotal = selectedItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const isAllSelected =
    cart.length > 0 && cart.every((item) => item.selected !== false);

  const toggleWishlist = (productId: string) => {
    if (!isLoggedIn) {
      showToast("⚠️ กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด");
      router.push("/login");
      return;
    }
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("ลบออกจากรายการโปรดแล้ว");
        const next = prev.filter((id) => id !== productId);
        setUser((u) => ({
          ...u,
          stats: { ...u.stats, favoritesCount: Math.max(0, u.stats.favoritesCount - 1) },
        }));
        return next;
      } else {
        showToast("บันทึกในรายการโปรดเรียบร้อย");
        setUser((u) => ({
          ...u,
          stats: { ...u.stats, favoritesCount: u.stats.favoritesCount + 1 },
        }));
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addProduct = async (
    newProd: Omit<Product, "id">
  ): Promise<{ success: boolean; error?: string; product?: Product }> => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [created, ...prev]);
    const res = await saveProductToSupabase(created);
    if (!res.success) {
      console.warn("Supabase addProduct background error:", res.error);
      showToast(`⚠️ สินค้าบันทึกลงระบบแล้ว แต่ Supabase แจ้งเตือน: ${res.error}`);
      return { success: false, error: res.error, product: created };
    }
    showToast(`✅ บันทึกสินค้า "${created.title}" ลงฐานข้อมูล Supabase สำเร็จ!`);
    return { success: true, product: created };
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFromSupabase(id).catch((err) =>
      console.warn("Supabase deleteProduct background error:", err)
    );
    showToast("ลบสินค้าออกจากระบบแล้ว");
  };

  const createOrder = (
    paymentMethod: "stripe" | "promptpay" | "credit_card",
    discountAmount = 0
  ): Order => {
    const today = new Date();
    const dateFormatted = `${today.getDate()} ${
      ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][
        today.getMonth()
      ]
    } ${today.getFullYear() + 543}`;

    const dateNumberStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `#LB${dateNumberStr}${randomSuffix}`;

    // ดำเนินการชำระเงินเฉพาะรายการสินค้าที่ผู้ใช้เลือกซื้อ
    const itemsToBuy = cart.filter((item) => item.selected !== false);
    const finalItems = itemsToBuy.length > 0 ? itemsToBuy : cart;

    const orderItems: OrderItem[] = finalItems.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      category: item.product.category.toUpperCase(),
      price: item.product.price,
      coverImage: item.product.coverImage,
      fileType: item.product.fileType,
      fileSize: item.product.fileSize,
      fileName: item.product.fileName,
      downloadUrl: item.product.downloadFileUrl,
    }));

    const total = finalItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const net = Math.max(0, total - discountAmount);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: dateFormatted,
      items: orderItems,
      totalAmount: total,
      discount: discountAmount,
      netAmount: net,
      status: "completed",
      paymentMethod,
      customerName: user.name,
      customerEmail: user.email,
      downloadCount: 0,
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem("leafbook_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist to Supabase Database
    saveOrderToSupabase(newOrder).catch((err) =>
      console.warn("Supabase saveOrder background error:", err)
    );

    setUser((u) => ({
      ...u,
      stats: {
        ...u.stats,
        ordersCount: u.stats.ordersCount + 1,
        rewardPoints: u.stats.rewardPoints + Math.floor(net / 10),
      },
    }));

    // ลบเฉพาะรายการที่ซื้อออกจากตะกร้า ส่วนรายการที่ไม่ได้เลือกยังคงอยู่ในตะกร้า
    setCart((prev) =>
      prev.filter((item) => !finalItems.some((b) => b.product.id === item.product.id))
    );
    return newOrder;
  };


  const addCustomer = (newCustomer: UserProfile) => {
    setCustomers((prev) => {
      const updated = [newCustomer, ...prev.filter((c) => c.email.toLowerCase() !== newCustomer.email.toLowerCase())];
      try {
        localStorage.setItem("leafbook_customers", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    saveProfileToSupabase(newCustomer).catch((err) =>
      console.warn("Supabase addCustomer background error:", err)
    );
    showToast(`เพิ่มผู้ใช้ "${newCustomer.name}" เรียบร้อยแล้ว`);
  };

  const deleteCustomer = (email: string) => {
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.email.toLowerCase() !== email.toLowerCase());
      try {
        localStorage.setItem("leafbook_customers", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    deleteCustomerFromSupabase(email).catch((err) =>
      console.warn("Supabase deleteCustomer background error:", err)
    );
    showToast("ลบผู้ใช้ออกจากระบบแล้ว");
  };

  const syncWithSupabase = async (): Promise<{
    success: boolean;
    message: string;
    count?: number;
  }> => {
    showToast("🔄 กำลังตรวจสอบและซิงค์ข้อมูลกับ Supabase...");
    const res = await seedInitialDataToSupabase();
    if (res.success) {
      setIsSupabaseReady(true);
      setSupabaseStatus("connected");
      const prodRes = await getProductsFromSupabase();
      if (prodRes.success && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }
      showToast(`✅ ${res.message}`);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
    return res;
  };

  const importProducts = (newProducts: Product[], replace = false) => {
    setProducts((prev) => {
      const updated = replace
        ? newProducts
        : [...newProducts, ...prev.filter((p) => !newProducts.some((np) => np.id === p.id))];
      try {
        localStorage.setItem("leafbook_products", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`นำเข้าสินค้า ${newProducts.length} รายการสำเร็จ!`);
  };

  const importCustomers = (newCustomers: UserProfile[], replace = false) => {
    setCustomers((prev) => {
      const updated = replace
        ? newCustomers
        : [...newCustomers, ...prev.filter((c) => !newCustomers.some((nc) => nc.email.toLowerCase() === c.email.toLowerCase()))];
      try {
        localStorage.setItem("leafbook_customers", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`นำเข้าข้อมูลลูกค้า ${newCustomers.length} รายการสำเร็จ!`);
  };

  const importOrders = (newOrders: Order[], replace = false) => {
    setOrders((prev) => {
      const updated = replace
        ? newOrders
        : [...newOrders, ...prev.filter((o) => !newOrders.some((no) => no.id === o.id))];
      try {
        localStorage.setItem("leafbook_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`นำเข้ายอดขาย ${newOrders.length} รายการสำเร็จ!`);
  };

  // Safe Instant Download Handler for Digital Files
  const downloadFile = (item: OrderItem) => {
    if (item.downloadUrl && item.downloadUrl.startsWith("/downloads/")) {
      const link = document.createElement("a");
      link.href = item.downloadUrl;
      link.download = item.fileName || item.downloadUrl.split("/").pop() || `${item.title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`เริ่มดาวน์โหลด "${item.fileName || item.title}" เรียบร้อยแล้ว!`);
      return;
    }

    const fileContent = `=======================================================
               LEAFBOOK DIGITAL STORE
        ขอบคุณสำหรับการสั่งซื้อสินค้าดิจิทัล!
=======================================================

สินค้า: ${item.title}
ประเภท: ${item.category}
รูปแบบไฟล์: ${item.fileType}
ขนาดไฟล์: ${item.fileSize}
รหัสลิขสิทธิ์ (License Key): LB-KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}

คำแนะนำการใช้งาน:
1. ไฟล์และซอร์สโค้ดนี้ได้รับการรับรองความถูกต้องจาก LeafBook Store
2. ลิขสิทธิ์การใช้งานนี้สำหรับผู้ซื้อ (${user.name}) เท่านั้น
3. สำหรับคอร์สออนไลน์ คุณสามารถเข้าถึงห้องเรียนและวิดีโอได้ทันทีผ่านลิงก์ของโปรเจกต์
4. หากต้องการความช่วยเหลือหรือสอบถาม สามารถติดต่อทีมงานได้ที่ support@leafbook.app

วันที่ดาวน์โหลด: ${new Date().toLocaleString("th-TH")}
ขอให้สนุกและประสบความสำเร็จในการเรียนรู้และสร้างสรรค์!
=======================================================
`;

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.fileName || `${item.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`เริ่มดาวน์โหลด "${item.title}" เรียบร้อยแล้ว!`);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        addProduct,
        deleteProduct,
        importProducts,
        customers,
        addCustomer,
        deleteCustomer,
        importCustomers,
        cart,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleSelectItem,
        selectAllItems,
        removeSelectedFromCart,
        selectedItems,
        selectedCartCount,
        selectedCartTotal,
        isAllSelected,
        cartCount,
        cartTotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        isAdmin,
        switchRole,
        updateUserProfile,
        updateAddress,
        isLoggedIn,
        isAuthLoading,
        login,
        logout,
        register,
        orders,
        updateOrderStatus,
        createOrder,
        importOrders,
        downloadFile,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        toastMessage,
        showToast,
        darkSidebar,
        toggleDarkSidebar,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        quickViewProduct,
        setQuickViewProduct,
        isSupabaseReady,
        supabaseStatus,
        syncWithSupabase,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
