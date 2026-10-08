"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  PlusCircle,
  Package,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Eye,
  RefreshCw,
  Clock,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileCheck,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ProductCategory, ProductTag, OrderStatus, Product, UserProfile, Order } from "@/lib/types";
import SalesLineChart from "@/components/admin/SalesLineChart";
import { exportToCSV, exportToExcel, exportToJSON, parseCSV } from "@/lib/utils/exportImport";

export default function AdminPage() {
  const {
    products,
    addProduct,
    deleteProduct,
    importProducts,
    customers,
    deleteCustomer,
    importCustomers,
    orders,
    updateOrderStatus,
    importOrders,
    showToast,
    isAdmin,
    supabaseStatus,
    syncWithSupabase,
  } = useShop();

  const [activeAdminTab, setActiveAdminTab] = useState<"products" | "orders" | "customers" | "import-export">("products");

  // Form State: Add Product
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("ebook");
  const [tags, setTags] = useState<ProductTag[]>(["new"]);
  const [price, setPrice] = useState(299);
  const [originalPrice, setOriginalPrice] = useState(490);
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
  );
  const [fileType, setFileType] = useState("PDF + ZIP");
  const [fileSize, setFileSize] = useState("32.5 MB");
  const [fileName, setFileName] = useState("leafbook-digital-asset.zip");
  const [author, setAuthor] = useState("LeafBook Creator");

  // Import State Management
  const [importType, setImportType] = useState<"products" | "customers" | "orders">("products");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [parsedPreview, setParsedPreview] = useState<{
    type: "products" | "customers" | "orders";
    items: any[];
    filename: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ถ้าไม่ใช่แอดมิน (เป็นลูกค้าทั่วไป) -> แสดงหน้าจำกัดสิทธิ์ ไม่อนุญาตให้ดู
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
            Access Restricted
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-2">
            จำกัดการเข้าถึงเฉพาะแอดมิน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            หน้านี้สงวนไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น บัญชีลูกค้าทั่วไปไม่มีสิทธิ์เข้าถึงส่วนนี้
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-98"
          >
            กลับสู่หน้าหลักของร้านค้า
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all active:scale-98"
          >
            เข้าสู่ระบบด้วยบัญชีอื่น
          </Link>
        </div>
      </div>
    );
  }

  // คำนวณสถิติภาพรวม
  const totalRevenue = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const totalCustomersCount = customers.length;

  const handleToggleTag = (tag: ProductTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast("กรุณากรอกข้อมูลสินค้าให้ครบถ้วน");
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/g, "-")
      .replace(/^-|-$/g, "");

    addProduct({
      title,
      slug,
      description,
      category,
      tags,
      price: Number(price),
      originalPrice: Number(originalPrice) || undefined,
      coverImage,
      rating: 5.0,
      reviewCount: 1,
      fileType,
      fileSize,
      fileName,
      downloadFileUrl: `/downloads/${fileName}`,
      author,
      features: [
        "ดาวน์โหลดได้ทันที",
        "ลิขสิทธิ์ถูกต้อง 100%",
        "อัปเดตเวอร์ชันใหม่ฟรี",
      ],
    });

    // Reset Form
    setTitle("");
    setDescription("");
    showToast("เพิ่มสินค้าดิจิทัลใหม่สำเร็จแล้ว!");
  };

  // EXPORT HANDLERS
  const handleExport = (type: "products" | "customers" | "orders", format: "csv" | "excel" | "json") => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      let data: any[] = [];
      let baseFilename = "";

      if (type === "products") {
        data = products.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice || "",
          fileType: p.fileType,
          fileSize: p.fileSize,
          fileName: p.fileName,
          author: p.author,
          rating: p.rating,
          reviewCount: p.reviewCount,
          description: p.description,
        }));
        baseFilename = `leafbook_products_${timestamp}`;
      } else if (type === "customers") {
        data = customers.map((c) => ({
          name: c.name,
          email: c.email,
          role: c.role,
          phone: c.phone || "",
          address: c.address ? `${c.address.addressLine}, ${c.address.subdistrict}, ${c.address.district}, ${c.address.province} ${c.address.postalCode}` : "",
          ordersCount: c.stats?.ordersCount || 0,
          rewardPoints: c.stats?.rewardPoints || 0,
          joinedDate: c.joinedDate || "",
        }));
        baseFilename = `leafbook_customers_${timestamp}`;
      } else if (type === "orders") {
        data = orders.map((o) => ({
          orderNumber: o.orderNumber,
          date: o.date,
          customerName: o.customerName || "ลูกค้าทั่วไป",
          customerEmail: o.customerEmail || "-",
          totalAmount: o.totalAmount,
          discount: o.discount || 0,
          netAmount: o.netAmount,
          status: o.status,
          paymentMethod: o.paymentMethod,
          itemsCount: o.items.length,
          itemsSummary: o.items.map((i) => i.title).join(" | "),
        }));
        baseFilename = `leafbook_sales_${timestamp}`;
      }

      if (format === "csv") {
        exportToCSV(data, `${baseFilename}.csv`);
        showToast(`ส่งออกข้อมูล ${type} เป็นไฟล์ CSV สำเร็จ!`);
      } else if (format === "excel") {
        exportToExcel(data, `${baseFilename}.csv`);
        showToast(`ส่งออกข้อมูล ${type} สำหรับ Excel สำเร็จ! (พร้อมรองรับภาษาไทย)`);
      } else if (format === "json") {
        exportToJSON(data, `${baseFilename}.json`);
        showToast(`ส่งออกข้อมูล ${type} เป็นไฟล์ JSON สำเร็จ!`);
      }
    } catch (err: any) {
      showToast(err.message || "เกิดข้อผิดพลาดในการส่งออกไฟล์");
    }
  };

  // DOWNLOAD TEMPLATES
  const handleDownloadTemplate = (type: "products" | "customers" | "orders", format: "csv" | "json") => {
    const timestamp = "template";
    if (type === "products") {
      const sample = [
        {
          id: "prod-sample-1",
          title: "ตัวอย่าง: E-Book เขียนโปรแกรม 2025",
          slug: "sample-ebook-2025",
          category: "ebook",
          price: 290,
          originalPrice: 490,
          description: "เนื้อหาคู่มือตัวอย่างสำหรับการนำเข้า",
          fileType: "PDF + ZIP",
          fileSize: "15.0 MB",
          fileName: "sample-book.zip",
          author: "LeafBook Team",
        },
      ];
      if (format === "csv") exportToCSV(sample, `template_products.csv`);
      else exportToJSON(sample, `template_products.json`);
    } else if (type === "customers") {
      const sample = [
        {
          name: "สมเกียรติ พัฒนาการ",
          email: "somkiat@example.com",
          role: "user",
          phone: "089-123-4567",
          bio: "นักพัฒนาเว็บ & นักอ่าน",
          joinedDate: "1 ต.ค. 2567",
        },
      ];
      if (format === "csv") exportToCSV(sample, `template_customers.csv`);
      else exportToJSON(sample, `template_customers.json`);
    } else if (type === "orders") {
      const sample = [
        {
          id: "ord-sample-1",
          orderNumber: "#LB20241099",
          date: "10 ต.ค. 2567",
          customerName: "สมเกียรติ พัฒนาการ",
          customerEmail: "somkiat@example.com",
          totalAmount: 590,
          discount: 0,
          netAmount: 590,
          status: "completed",
          paymentMethod: "promptpay",
          createdAt: new Date().toISOString(),
          items: [
            {
              productId: "prod-1",
              title: "คู่มือ Full-Stack Next.js 15 Pro",
              category: "E-BOOK",
              price: 590,
              fileType: "PDF + ZIP",
              fileSize: "45.8 MB",
              fileName: "Nextjs15-Pro-Guide.zip",
              downloadUrl: "/downloads/nextjs-guide.zip",
            },
          ],
        },
      ];
      if (format === "csv") exportToCSV(sample, `template_orders.csv`);
      else exportToJSON(sample, `template_orders.json`);
    }
    showToast(`ดาวน์โหลดแม่แบบ ${type} (${format.toUpperCase()}) เรียบร้อย`);
  };

  // FILE IMPORT PARSER
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, targetType: "products" | "customers" | "orders") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let items: any[] = [];

        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          items = Array.isArray(parsed) ? parsed : [parsed];
        } else if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
          items = parseCSV(text);
        } else {
          showToast("รองรับเฉพาะไฟล์นามสกุล .csv หรือ .json เท่านั้น");
          return;
        }

        if (items.length === 0) {
          showToast("ไม่พบข้อมูลที่ถูกต้องในไฟล์");
          return;
        }

        setImportType(targetType);
        setParsedPreview({
          type: targetType,
          items,
          filename: file.name,
        });
        showToast(`อ่านไฟล์สำเร็จ! พบข้อมูล ${items.length} รายการ (พร้อมกดยืนยันนำเข้า)`);
      } catch (err: any) {
        showToast(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message}`);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  // CONFIRM IMPORT
  const handleExecuteImport = () => {
    if (!parsedPreview) return;
    setIsImporting(true);

    try {
      const isReplace = importMode === "replace";
      const { type, items } = parsedPreview;

      if (type === "products") {
        const mappedProducts: Product[] = items.map((item, idx) => ({
          id: item.id || `prod-imported-${Date.now()}-${idx}`,
          title: item.title || `สินค้าไม่ระบุชื่อ ${idx + 1}`,
          slug: item.slug || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-") : `product-${Date.now()}`),
          description: item.description || "รายละเอียดสินค้าดิจิทัลนำเข้า",
          category: (item.category as ProductCategory) || "ebook",
          tags: item.tags ? (Array.isArray(item.tags) ? item.tags : [item.tags]) : ["new"],
          price: Number(item.price) || 0,
          originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
          coverImage: item.coverImage || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
          rating: Number(item.rating) || 5.0,
          reviewCount: Number(item.reviewCount) || 1,
          fileType: item.fileType || "ZIP",
          fileSize: item.fileSize || "10.0 MB",
          fileName: item.fileName || "digital-asset.zip",
          downloadFileUrl: item.downloadFileUrl || `/downloads/${item.fileName || "digital-asset.zip"}`,
          author: item.author || "LeafBook Team",
          features: item.features ? (Array.isArray(item.features) ? item.features : [item.features]) : ["ดาวน์โหลดได้ทันที", "ลิขสิทธิ์ถูกต้อง"],
        }));

        importProducts(mappedProducts, isReplace);
      } else if (type === "customers") {
        const mappedCustomers: UserProfile[] = items.map((item, idx) => ({
          id: item.id || `user-imported-${Date.now()}-${idx}`,
          name: item.name || `ผู้ใช้ ${idx + 1}`,
          email: item.email || `user${Date.now()}${idx}@example.com`,
          avatar: item.avatar || "https://i.pinimg.com/736x/2f/d2/1b/2fd21bd35fbe51140cb7d534b157ce2d.jpg",
          role: item.role === "admin" ? "admin" : "user",
          phone: item.phone || "",
          bio: item.bio || "สมาชิกร้านค้า LeafBook",
          isVip: Boolean(item.isVip),
          tier: (item.tier === "VIP" || item.tier === "Pro" ? item.tier : "Member") as "Member" | "Pro" | "VIP",
          joinedDate: item.joinedDate || new Date().toLocaleDateString("th-TH"),
          stats: {
            ordersCount: Number(item.ordersCount) || 0,
            favoritesCount: Number(item.favoritesCount) || 0,
            reviewsCount: Number(item.reviewsCount) || 0,
            rewardPoints: Number(item.rewardPoints) || 0,
          },
        }));

        importCustomers(mappedCustomers, isReplace);
      } else if (type === "orders") {
        const mappedOrders: Order[] = items.map((item, idx) => ({
          id: item.id || `ord-imported-${Date.now()}-${idx}`,
          orderNumber: item.orderNumber || `#LB${Date.now()}${idx}`,
          date: item.date || new Date().toLocaleDateString("th-TH"),
          customerName: item.customerName || "ลูกค้าทั่วไป",
          customerEmail: item.customerEmail || "customer@example.com",
          createdAt: item.createdAt || new Date().toISOString(),
          items: Array.isArray(item.items)
            ? item.items
            : [
                {
                  productId: "imported-item",
                  title: item.itemsSummary || "รายการสั่งซื้อนำเข้า",
                  category: "DIGITAL",
                  price: Number(item.netAmount || item.totalAmount || 0),
                  fileType: "ZIP",
                  fileSize: "10 MB",
                  fileName: "order-file.zip",
                  downloadUrl: "/downloads/file.zip",
                },
              ],
          totalAmount: Number(item.totalAmount) || 0,
          discount: Number(item.discount) || 0,
          netAmount: Number(item.netAmount || item.totalAmount) || 0,
          status: (item.status as OrderStatus) || "completed",
          paymentMethod: item.paymentMethod || "promptpay",
          downloadCount: Number(item.downloadCount) || 0,
        }));

        importOrders(mappedOrders, isReplace);
      }

      setParsedPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      showToast(`นำเข้าข้อมูลไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                แผงควบคุมระบบ (Admin Panel)
              </h1>
              <span className="text-[10px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              วิเคราะห์กราฟยอดขายรายเดือน จัดการสินค้า คำสั่งซื้อ ข้อมูลลูกค้า และนำเข้า/ส่งออก (CSV / Excel / JSON)
            </p>
          </div>
        </div>

        {/* Supabase Status & Sync Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-xl border ${
            supabaseStatus === "connected"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : supabaseStatus === "unconfigured"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${supabaseStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>Supabase DB: {supabaseStatus === "connected" ? "ออนไลน์ (URL+Anon)" : "โหมดสำรอง (Standby)"}</span>
          </div>
          <button
            type="button"
            onClick={() => syncWithSupabase()}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
            title="ซิงค์และบันทึกสินค้าเริ่มต้นลงฐานข้อมูล Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ซิงค์ข้อมูล Supabase</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">ยอดขายสะสมทั้งหมด</span>
            <h3 className="text-xl font-bold text-slate-900">
              ฿{totalRevenue.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">คำสั่งซื้อทั้งหมด</span>
            <h3 className="text-xl font-bold text-slate-900">
              {totalOrdersCount} รายการ
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">สินค้าดิจิทัลในระบบ</span>
            <h3 className="text-xl font-bold text-slate-900">
              {totalProductsCount} ชิ้น
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">ลูกค้า & ผู้ใช้ในระบบ</span>
            <h3 className="text-xl font-bold text-slate-900">
              {totalCustomersCount} บัญชี
            </h3>
          </div>
        </div>
      </div>

      {/* MONTHLY SALES LINE CHART COMPONENT */}
      <SalesLineChart orders={orders} />

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveAdminTab("products")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === "products"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>จัดการสินค้าดิจิทัล ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === "orders"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>ยอดขาย & คำสั่งซื้อ ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("customers")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === "customers"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>รายชื่อผู้ใช้ & ลูกค้า ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab("import-export")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === "import-export"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>นำเข้า / ส่งออกข้อมูล (CSV / Excel / JSON)</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeAdminTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
          {/* Left: Add Product Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <PlusCircle className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-800">
                เพิ่มสินค้าดิจิทัลใหม่เข้าร้านค้า
              </h2>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อสินค้าดิจิทัล *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น คู่มือ Mastering TypeScript 2025"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="ebook">E-Book (หนังสือดิจิทัล)</option>
                    <option value="template">Template (เทมเพลต & UI)</option>
                    <option value="course">คอร์สออนไลน์</option>
                    <option value="software">ซอฟต์แวร์ / โค้ด</option>
                    <option value="graphics">กราฟิก & ภาพ</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้สร้าง / ผู้แต่ง
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ราคาจำหน่าย (฿ THB) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ราคาเต็มเดิม (฿ THB)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Tags selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ป้ายกำกับโปรโมชัน (Tags)
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "recommended", label: "แนะนำ (Recommended)" },
                    { id: "bestseller", label: "ขายดี (Bestseller)" },
                    { id: "new", label: "ใหม่ (New)" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleToggleTag(item.id as ProductTag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        tags.includes(item.id as ProductTag)
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทไฟล์
                  </label>
                  <input
                    type="text"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    placeholder="PDF + ZIP"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ขนาดไฟล์
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="45 MB"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อไฟล์ดาวน์โหลด
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="my-ebook.zip"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL รูปภาพปกสินค้า
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดสินค้า *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายเนื้อหา สิ่งที่จะได้รับ และวิธีใช้งาน..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 text-white font-semibold text-xs sm:text-sm hover:bg-purple-700 active:scale-98 transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>บันทึกและเผยแพร่สินค้าใหม่</span>
              </button>
            </form>
          </div>

          {/* Right: Existing Products List with Delete */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">
                สินค้าดิจิทัลในระบบ ({products.length})
              </h2>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 relative shrink-0">
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 truncate">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 capitalize">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700">
                        ฿{p.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบสินค้า "${p.title}" ใช่หรือไม่?`)) {
                        deleteProduct(p.id);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="ลบสินค้านี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeAdminTab === "orders" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                รายการคำสั่งซื้อทั้งหมด ({orders.length})
              </h2>
              <p className="text-xs text-slate-500">
                ตรวจสอบรายการสั่งซื้อ ปรับสถานะคำสั่งซื้อ และดูรายละเอียดลูกค้า
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport("orders", "excel")}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ส่งออก Excel</span>
              </button>
              <button
                onClick={() => handleExport("orders", "json")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>ส่งออก JSON</span>
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              ยังไม่มีคำสั่งซื้อในระบบ
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">• {order.date}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : order.status === "processing"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {order.status === "completed"
                          ? "ชำระเงินสำเร็จ"
                          : order.status === "processing"
                          ? "กำลังประมวลผล"
                          : order.status}
                      </span>

                      {order.customerName && (
                        <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-medium border border-purple-100">
                          ลูกค้า: {order.customerName}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600">
                      {order.items.map((i) => i.title).join(", ")}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ชำระผ่าน: {order.paymentMethod.toUpperCase()} | ยอดสุทธิ:{" "}
                      <strong className="text-slate-800 font-bold">
                        ฿{order.netAmount.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">ปรับสถานะ:</span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                    >
                      <option value="completed">Completed (สำเร็จ)</option>
                      <option value="processing">Processing (กำลังดำเนินการ)</option>
                      <option value="cancelled">Cancelled (ยกเลิก)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMERS MANAGEMENT */}
      {activeAdminTab === "customers" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                รายชื่อผู้ใช้งานและลูกค้า ({customers.length})
              </h2>
              <p className="text-xs text-slate-500">
                ข้อมูลสมาชิก บัญชีลูกค้าที่ลงทะเบียน และสถิติการสั่งซื้อ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport("customers", "excel")}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>ส่งออก Excel</span>
              </button>
              <button
                onClick={() => handleExport("customers", "json")}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>ส่งออก JSON</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div
                key={c.email}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 shrink-0 relative border-2 border-white shadow-xs">
                    <Image
                      src={c.avatar}
                      alt={c.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {c.name}
                      </h4>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          c.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {c.role === "admin" ? "ADMIN" : "CUSTOMER"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{c.email}</p>
                    {c.phone && <p className="text-[11px] text-slate-400">{c.phone}</p>}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    คำสั่งซื้อ: <strong>{c.stats?.ordersCount || 0}</strong>
                  </span>
                  <span>
                    คะแนน: <strong>{c.stats?.rewardPoints || 0} pts</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (c.role === "admin") {
                        showToast("ไม่สามารถลบบัญชีแอดมินได้");
                        return;
                      }
                      if (confirm(`คุณต้องการลบผู้ใช้ "${c.name}" ใช่หรือไม่?`)) {
                        deleteCustomer(c.email);
                      }
                    }}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบผู้ใช้นี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IMPORT & EXPORT CENTER */}
      {activeAdminTab === "import-export" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header intro */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-600/10">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                Data Management & Migration
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">
                ศูนย์นำเข้าและส่งออกข้อมูล (Import & Export Center)
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
                ส่งออกและนำเข้าข้อมูลได้ 3 ประเภท: <strong>สินค้าดิจิทัล</strong>, <strong>ข้อมูลลูกค้า/ผู้ใช้</strong>, และ <strong>ยอดขาย/คำสั่งซื้อ</strong> รองรับรูปแบบไฟล์ยอดนิยม <strong>CSV (รองรับภาษาไทยใน Microsoft Excel)</strong>, <strong>Excel (.csv format)</strong> และ <strong>JSON</strong>
              </p>
            </div>
          </div>

          {/* Import Execution Preview Modal / Banner if file chosen */}
          {parsedPreview && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-purple-950">
                      ตรวจพบไฟล์นำเข้า: {parsedPreview.filename}
                    </h3>
                    <p className="text-xs text-purple-700">
                      ประเภทข้อมูล: <strong>{parsedPreview.type.toUpperCase()}</strong> | จำนวนข้อมูล: <strong>{parsedPreview.items.length} รายการ</strong>
                    </p>
                  </div>
                </div>

                {/* Import Mode: Append vs Replace */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200 text-xs">
                  <span className="text-slate-600 font-medium">โหมดนำเข้า:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="text-purple-600"
                    />
                    <span>เพิ่มต่อท้าย (Append)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="text-rose-600"
                    />
                    <span className="text-rose-700 font-semibold">แทนที่ทั้งหมด (Replace)</span>
                  </label>
                </div>
              </div>

              {/* Sample preview items */}
              <div className="bg-white rounded-2xl border border-purple-100 p-4 max-h-48 overflow-y-auto text-xs font-mono space-y-1">
                <div className="text-[11px] text-slate-400 font-sans pb-1 border-b border-slate-100">
                  ตัวอย่างข้อมูลรายการแรก:
                </div>
                <pre className="text-slate-700 whitespace-pre-wrap text-[11px]">
                  {JSON.stringify(parsedPreview.items[0], null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setParsedPreview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={isImporting}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isImporting ? "กำลังนำเข้า..." : `ยืนยันนำเข้า ${parsedPreview.items.length} รายการ`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 3 Main Import/Export Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CARD 1: PRODUCTS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">1. สินค้า (Products)</h3>
                      <p className="text-[11px] text-slate-400">{products.length} รายการในระบบ</p>
                    </div>
                  </div>
                </div>

                {/* Export Section */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    ส่งออกข้อมูล (Export)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport("products", "csv")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>CSV (UTF-8)</span>
                    </button>
                    <button
                      onClick={() => handleExport("products", "excel")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("products", "json")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    นำเข้าข้อมูล (Import)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl bg-slate-50 hover:bg-purple-50/20 transition-all cursor-pointer group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-purple-600 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">
                      เลือกไฟล์สินค้า (.csv หรือ .json)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์
                    </span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "products")}
                    />
                  </label>
                </div>
              </div>

              {/* Template download link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">แม่แบบตัวอย่าง:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadTemplate("products", "csv")}
                    className="text-purple-600 hover:underline font-semibold cursor-pointer"
                  >
                    CSV Template
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDownloadTemplate("products", "json")}
                    className="text-purple-600 hover:underline font-semibold cursor-pointer"
                  >
                    JSON Template
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: CUSTOMERS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">2. ผู้ใช้ / ลูกค้า (Customers)</h3>
                      <p className="text-[11px] text-slate-400">{customers.length} บัญชีในระบบ</p>
                    </div>
                  </div>
                </div>

                {/* Export Section */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    ส่งออกข้อมูล (Export)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport("customers", "csv")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>CSV (UTF-8)</span>
                    </button>
                    <button
                      onClick={() => handleExport("customers", "excel")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("customers", "json")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    นำเข้าข้อมูล (Import)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl bg-slate-50 hover:bg-blue-50/20 transition-all cursor-pointer group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                      เลือกไฟล์ผู้ใช้ (.csv หรือ .json)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์
                    </span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "customers")}
                    />
                  </label>
                </div>
              </div>

              {/* Template download link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">แม่แบบตัวอย่าง:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadTemplate("customers", "csv")}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    CSV Template
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDownloadTemplate("customers", "json")}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    JSON Template
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 3: SALES / ORDERS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">3. ยอดขาย & คำสั่งซื้อ (Sales)</h3>
                      <p className="text-[11px] text-slate-400">{orders.length} คำสั่งซื้อในระบบ</p>
                    </div>
                  </div>
                </div>

                {/* Export Section */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    ส่งออกข้อมูล (Export)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleExport("orders", "csv")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>CSV (UTF-8)</span>
                    </button>
                    <button
                      onClick={() => handleExport("orders", "excel")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport("orders", "json")}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    นำเข้าข้อมูล (Import)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl bg-slate-50 hover:bg-emerald-50/20 transition-all cursor-pointer group">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">
                      เลือกไฟล์คำสั่งซื้อ (.csv หรือ .json)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์
                    </span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "orders")}
                    />
                  </label>
                </div>
              </div>

              {/* Template download link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">แม่แบบตัวอย่าง:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadTemplate("orders", "csv")}
                    className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    CSV Template
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() => handleDownloadTemplate("orders", "json")}
                    className="text-emerald-600 hover:underline font-semibold cursor-pointer"
                  >
                    JSON Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
