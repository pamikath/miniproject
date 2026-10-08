"use client";

import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingCart,
  ShieldCheck,
  Tag,
  Check,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function QuickCartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
    toggleSelectItem,
    selectAllItems,
    selectedItems,
    selectedCartCount,
    selectedCartTotal,
    isAllSelected,
  } = useShop();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                ตะกร้าสินค้าของคุณ
              </h2>
              <p className="text-[11px] text-slate-400">
                {cartCount} รายการในตะกร้า
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Selection Subheader */}
        {cart.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => selectAllItems()}
              className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 cursor-pointer select-none"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  isAllSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>เลือกทั้งหมด</span>
            </button>
            <span className="text-[11px] text-slate-400">
              เลือก {selectedCartCount} จาก {cart.length} รายการ
            </span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                ยังไม่มีสินค้าในตะกร้า
              </p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                เลือกซื้อสินค้าต่อ
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const isSelected = item.selected !== false;
              return (
                <div
                  key={item.product.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                    isSelected
                      ? "border-blue-200 bg-white shadow-2xs ring-1 ring-blue-500/10"
                      : "border-slate-200/70 bg-slate-50/60 opacity-80 hover:opacity-100"
                  }`}
                >
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelectItem(item.product.id)}
                    title={isSelected ? "ยกเลิกการเลือก" : "เลือกสินค้านี้"}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-2xs scale-105"
                        : "border-slate-300 hover:border-blue-400 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={item.product.coverImage}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-semibold text-blue-600 uppercase">
                        {item.product.category}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-800 line-clamp-1 leading-snug">
                        {item.product.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        ฿ {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
            {/* Promo hint */}
            <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-blue-50 text-blue-700">
              <div className="flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>ใช้โค้ด LEAF10 ลดเพิ่ม 10%</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">
                ยอดรวมสินค้าที่เลือก ({selectedCartCount} ชิ้น):
              </span>
              <span className="text-lg font-extrabold text-blue-600">
                ฿ {selectedCartTotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {selectedCartCount > 0 ? (
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>ชำระเงิน ({selectedCartCount} รายการ)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-2xl bg-slate-200 text-slate-400 font-semibold text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>กรุณาเลือกสินค้าที่จะซื้อ</span>
                </button>
              )}

              <Link
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer"
              >
                ดูตะกร้าสินค้าแบบเต็ม
              </Link>
            </div>

            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>ดาวน์โหลดไฟล์ดิจิทัลได้ทันทีหลังชำระเงิน</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
