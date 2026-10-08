"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart, Check, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { useShop } from "@/context/ShopContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    cart,
    setQuickViewProduct,
    setIsCartDrawerOpen,
  } = useShop();
  const wishlisted = isWishlisted(product.id);
  const isInCart = cart.some((c) => c.product.id === product.id);

  const getTagBadge = () => {
    if (product.tags.includes("recommended")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1d4ed8] text-white shadow-2xs">
          แนะนำ
        </span>
      );
    }
    if (product.tags.includes("bestseller")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f59e0b] text-white shadow-2xs">
          ขายดี
        </span>
      );
    }
    if (product.tags.includes("new")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9333ea] text-white shadow-2xs">
          ใหม่
        </span>
      );
    }
    return null;
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between">
      {/* Cover image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setQuickViewProduct(product)}>
        <Image
          src={product.coverImage}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-103 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          {getTagBadge()}
        </div>

        {/* Hover Quick View Button */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-[11px] font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs hover:bg-white transition-all transform scale-95 group-hover:scale-100">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>ดูด่วน</span>
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="บันทึกในรายการโปรด"
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-colors active:scale-90"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              wishlisted ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <Link
            href={`/products/${product.id}`}
            className="font-medium text-xs text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1 block"
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
            </div>
            <span className="font-semibold text-slate-700 text-[11px]">
              {product.rating}
            </span>
            <span>({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              ฿ {product.price.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1, true)}
            aria-label="เพิ่มลงตะกร้า"
            title="เพิ่มลงตะกร้าและเปิดดูรายการ"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
              isInCart
                ? "bg-emerald-500 text-white shadow-2xs"
                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
          >
            {isInCart ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
