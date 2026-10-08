"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Tag, ShieldCheck, Download, Check, CheckSquare, Square } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleSelectItem,
    selectAllItems,
    removeSelectedFromCart,
    selectedItems,
    selectedCartCount,
    selectedCartTotal,
    isAllSelected,
    showToast,
  } = useShop();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "LEAF10") {
      setDiscountPercent(10);
      setCouponApplied(true);
      showToast("ใช้โค้ด LEAF10 รับส่วนลด 10% สำเร็จแล้ว!");
    } else {
      showToast("โค้ดส่วนลดไม่ถูกต้อง ลองใช้โค้ด LEAF10");
    }
  };

  const discountAmount = Math.round((selectedCartTotal * discountPercent) / 100);
  const netTotal = Math.max(0, selectedCartTotal - discountAmount);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ตะกร้าสินค้าของคุณ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เลือกสินค้าดิจิทัลที่ต้องการสั่งซื้อก่อนดำเนินการชำระเงิน
          </p>
        </div>
        {cart.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedCartCount > 0 && (
              <button
                onClick={removeSelectedFromCart}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบที่เลือก ({selectedCartCount})</span>
              </button>
            )}
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-rose-500 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>ล้างตะกร้าทั้งหมด</span>
            </button>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center my-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">
            ไม่มีสินค้าในตะกร้า
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5">
            เลือกดูคลังสินค้าดิจิทัลของเรา เช่น E-Book, คอร์สเรียน, เทมเพลต และซอฟต์แวร์คุณภาพ
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/25"
          >
            <span>เลือกชมสินค้าเลย</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {/* Top Bar: Select All / Deselect All */}
            <div className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
              <button
                type="button"
                onClick={() => selectAllItems()}
                className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    isAllSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>
                  เลือกทั้งหมด ({selectedCartCount}/{cart.length} รายการ)
                </span>
              </button>

              <span className="text-xs text-slate-400">
                เลือกซื้อแล้ว {selectedCartCount} ชิ้น
              </span>
            </div>

            {/* Cart Items */}
            {cart.map((item) => {
              const isSelected = item.selected !== false;
              return (
                <div
                  key={item.product.id}
                  className={`bg-white rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs ${
                    isSelected
                      ? "border-blue-200 ring-2 ring-blue-500/10 shadow-xs"
                      : "border-slate-200/70 bg-slate-50/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={() => toggleSelectItem(item.product.id)}
                      title={isSelected ? "คลิกเพื่อยกเลิกการเลือก" : "คลิกเพื่อเลือกสินค้านี้"}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-2xs scale-105"
                          : "border-slate-300 hover:border-blue-400 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                      <Image
                        src={item.product.coverImage}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-blue-600 uppercase">
                          {item.product.category}
                        </span>
                        {isSelected ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                            ✓ เลือกซื้อ
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-400">
                            ยังไม่เลือก
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.product.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.product.fileType} • {item.product.fileSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold text-slate-900 block">
                        ฿ {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Order Summary Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                สรุปคำสั่งซื้อ
              </h2>

              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="โค้ดส่วนลด (ลองใส่ LEAF10)"
                    disabled={couponApplied}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponApplied || !couponCode}
                  className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {couponApplied ? "ใช้แล้ว" : "ใช้โค้ด"}
                </button>
              </form>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>ราคารวมสินค้าที่เลือก ({selectedCartCount} ชิ้น)</span>
                  <span>฿ {selectedCartTotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>ส่วนลดโปรโมชัน (10%)</span>
                    <span>- ฿ {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ค่าจัดส่งสินค้าดิจิทัล</span>
                  <span className="text-emerald-600 font-semibold">ฟรี (ดาวน์โหลดทันที)</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline font-bold">
                  <span className="text-slate-800 text-sm">ยอดชำระสุทธิ</span>
                  <span className="text-xl text-blue-600 font-extrabold">
                    ฿ {netTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              {selectedCartCount > 0 ? (
                <Link
                  href={`/checkout?discount=${discountAmount}`}
                  className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ดำเนินการชำระเงิน ({selectedCartCount} รายการ)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl bg-slate-200 text-slate-400 font-semibold text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>กรุณาเลือกสินค้าที่จะซื้อ</span>
                  </button>
                  <p className="text-[11px] text-amber-600 text-center font-medium">
                    ⚠️ ติ๊กเลือกสินค้าในตะกร้าที่คุณต้องการชำระเงิน
                  </p>
                </div>
              )}

              {/* Guarantees */}
              <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ชำระเงินปลอดภัยด้วย Stripe & PromptPay</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>รับสิทธิ์ดาวน์โหลดไฟล์ทันทีหลังชำระเงิน</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
