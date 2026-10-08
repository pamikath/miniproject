"use client";

import Image from "next/image";
import Link from "next/link";
import {
  X,
  Star,
  Heart,
  ShoppingCart,
  Download,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    buyNow,
    toggleWishlist,
    isWishlisted,
  } = useShop();

  if (!quickViewProduct) return null;

  const isFav = isWishlisted(quickViewProduct.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Left Image */}
            <div className="space-y-3">
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <Image
                  src={quickViewProduct.coverImage}
                  alt={quickViewProduct.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <Download className="w-3.5 h-3.5 text-blue-600 mx-auto mb-1" />
                  <span>ดาวน์โหลดทันที</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                  <span>สิทธิ์ใช้งานเชิงพาณิชย์</span>
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase px-2 py-0.5 rounded bg-blue-50">
                  {quickViewProduct.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {quickViewProduct.title}
                </h3>

                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <span className="font-semibold text-slate-700">
                    {quickViewProduct.rating}
                  </span>
                  <span>({quickViewProduct.reviewCount} รีวิว)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-600">
                  ฿ {quickViewProduct.price.toLocaleString()}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ฿ {quickViewProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {quickViewProduct.description}
              </p>

              {/* Specs */}
              <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">รูปแบบไฟล์:</span>
                  <span className="font-semibold">{quickViewProduct.fileType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ขนาด:</span>
                  <span className="font-semibold">{quickViewProduct.fileSize}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    buyNow(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>ซื้อทันที ฿{quickViewProduct.price.toLocaleString()}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, 1, true);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>เพิ่มลงตะกร้า</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>
                </div>

                <Link
                  href={`/products/${quickViewProduct.id}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="block text-center text-[11px] text-slate-400 hover:text-blue-600 hover:underline pt-1"
                >
                  ดูหน้ารายละเอียดแบบเต็ม →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
