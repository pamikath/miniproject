"use client";

import Link from "next/link";
import { ArrowRight, PackageSearch, RefreshCw } from "lucide-react";
import ProductCard from "./ProductCard";
import { useShop } from "@/context/ShopContext";

export default function ProductGrid() {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useShop();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            สินค้ายอดนิยม
          </h2>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-0.5">
              ผลการค้นหาสำหรับ &ldquo;<span className="text-blue-600 font-semibold">{searchQuery}</span>&rdquo;
            </p>
          )}
        </div>
        <Link
          href="/products"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center my-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-xs mb-1">
            ไม่พบสินค้าที่คุณค้นหา
          </h3>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors mt-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>ล้างการค้นหา</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
