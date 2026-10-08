"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingCart,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  ArrowLeft,
  Share2,
  Zap,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { products, addToCart, buyNow, toggleWishlist, isWishlisted, showToast } = useShop();

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-800">ไม่พบสินค้านี้ในระบบ</h1>
        <p className="text-xs text-slate-500">สินค้านี้อาจถูกลบหรือย้ายหมวดหมู่</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปยังหน้ารวมสินค้า</span>
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleBuyNow = () => {
    buyNow(product);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("คัดลอกลิงก์สินค้านี้เรียบร้อยแล้ว!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-blue-600">
          หน้าหลัก
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">
          สินค้า
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-xs">
          {product.title}
        </span>
      </div>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm group">
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="บันทึกในรายการโปรด"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-white shadow-sm transition-colors active:scale-90"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
              <Download className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 block">
                ดาวน์โหลดทันที
              </span>
              <span className="text-[10px] text-slate-400">เข้าถึงได้ตลอดชีพ</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 block">
                รับรองลิขสิทธิ์
              </span>
              <span className="text-[10px] text-slate-400">ใช้ในงานพาณิชย์ได้</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-center">
              <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-slate-700 block">
                อัปเดตฟรี
              </span>
              <span className="text-[10px] text-slate-400">เวอร์ชันใหม่ฟรี</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 uppercase border border-blue-100">
                {product.category}
              </span>
              {product.tags.includes("bestseller") && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                  ขายดี
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <div className="flex items-center text-amber-500 gap-1 font-semibold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span>•</span>
              <span>{product.reviewCount} รีวิวจากผู้ใช้จริง</span>
              {product.author && (
                <>
                  <span>•</span>
                  <span>โดย {product.author}</span>
                </>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                ฿ {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleShare}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>แชร์</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              รายละเอียดสินค้า
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Features Checklist */}
          {product.features && (
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
                จุดเด่นที่คุณจะได้รับ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specs */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">รูปแบบไฟล์:</span>
              <span className="font-semibold text-slate-700">{product.fileType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ขนาดไฟล์:</span>
              <span className="font-semibold text-slate-700">{product.fileSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ชื่อไฟล์ที่จะได้รับ:</span>
              <span className="font-semibold text-blue-600 font-mono text-[11px]">
                {product.fileName}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => addToCart(product, 1, true)}
              className="flex-1 py-3 rounded-2xl border-2 border-blue-600 text-blue-600 font-semibold text-xs sm:text-sm hover:bg-blue-50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>เพิ่มลงตะกร้า</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              <span>ซื้อทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
