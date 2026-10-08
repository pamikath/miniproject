"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpDown, PlusCircle } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { useShop } from "@/context/ShopContext";
import { ProductCategory } from "@/lib/types";

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterWishlistOnly = searchParams.get("filter") === "wishlist";

  const { products, selectedCategory, setSelectedCategory, searchQuery, isWishlisted, isLoggedIn, isAuthLoading } = useShop();

  useEffect(() => {
    if (filterWishlistOnly && !isAuthLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [filterWishlistOnly, isAuthLoading, isLoggedIn, router]);

  const [activeTag, setActiveTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const CATEGORY_TABS: { id: ProductCategory; label: string }[] = [
    { id: "all", label: "ทั้งหมด" },
    { id: "ebook", label: "E-Book" },
    { id: "template", label: "Template" },
    { id: "course", label: "คอร์สออนไลน์" },
    { id: "software", label: "ซอฟต์แวร์" },
    { id: "graphics", label: "กราฟิก" },
  ];

  let filtered = products.filter((p) => {
    if (filterWishlistOnly && !isWishlisted(p.id)) return false;
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (activeTag !== "all" && !p.tags.includes(activeTag as any)) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {filterWishlistOnly ? "รายการโปรดของคุณ" : "สินค้าดิจิทัลทั้งหมด"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            พบสินค้าทั้งหมด {filtered.length} รายการ
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* ปุ่มลงขายสินค้าสำหรับผู้ใช้ */}
          <Link
            href="/sell"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>ลงขายสินค้า</span>
          </Link>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="featured">เรียงตาม: แนะนำ</option>
              <option value="rating">เรียงตาม: คะแนนรีวิวสูงสุด</option>
              <option value="price-asc">เรียงตาม: ราคา ต่ำ - สูง</option>
              <option value="price-desc">เรียงตาม: ราคา สูง - ต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: "all", label: "แท็กทั้งหมด" },
            { id: "recommended", label: "แนะนำ" },
            { id: "bestseller", label: "ขายดี" },
            { id: "new", label: "ใหม่" },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                activeTag === tag.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center my-6">
          <h3 className="font-bold text-slate-800 text-sm mb-1">
            ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            ลองปรับเปลี่ยนหมวดหมู่หรือล้างตัวกรอง
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setActiveTag("all");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          กำลังโหลดรายการสินค้า...
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
