"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Download,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useShop } from "@/context/ShopContext";
import { Order } from "@/lib/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const discountParam = Number(searchParams.get("discount") || 0);

  const {
    cart,
    cartTotal,
    selectedItems,
    selectedCartTotal,
    createOrder,
    downloadFile,
    isLoggedIn,
    isAuthLoading,
  } = useShop();

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "promptpay" | "credit_card">("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (isAuthLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">
          กำลังโหลดข้อมูลคำสั่งซื้อ...
        </p>
      </div>
    );
  }

  // Use selectedItems if available, otherwise fallback to cart
  const checkoutItems = selectedItems.length > 0 ? selectedItems : cart;
  const checkoutTotal = selectedItems.length > 0 ? selectedCartTotal : cartTotal;
  const netTotal = Math.max(0, checkoutTotal - discountParam);

  const handleProcessPayment = () => {
    if (checkoutItems.length === 0 && !completedOrder) {
      router.push("/cart");
      return;
    }

    setIsProcessing(true);

    // Simulate payment gateway response
    setTimeout(() => {
      const order = createOrder(paymentMethod, discountParam);
      setCompletedOrder(order);
      setIsProcessing(false);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }, 1200);
  };

  // If order is completed, show the Success / Instant Download Screen
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 text-center shadow-lg shadow-blue-500/5 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ชำระเงินสำเร็จ • สถานะ: เสร็จสิ้น (Completed)</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              ขอบคุณสำหรับการสั่งซื้อ!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              รหัสคำสั่งซื้อของคุณคือ{" "}
              <span className="font-bold text-blue-600">
                {completedOrder.orderNumber}
              </span>
            </p>
          </div>

          {/* Instant Downloads Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-left space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              สินค้าดิจิทัลพร้อมดาวน์โหลดทันที
            </h2>

            <div className="space-y-2">
              {completedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-2xs"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-blue-600 uppercase">
                      {item.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {item.fileType} • {item.fileSize}
                    </p>
                  </div>

                  <button
                    onClick={() => downloadFile(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-xs shadow-blue-600/30 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              ดูประวัติคำสั่งซื้อทั้งหมด
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          ชำระเงิน (Checkout)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          เลือกช่องทางการชำระเงินที่ต้องการเพื่อรับสินค้าดิจิทัลทันที
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payment Method Selection */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800">
              เลือกวิธีการชำระเงิน
            </h2>

            <div className="space-y-3">
              {/* Option 1: Stripe Credit Card */}
              <label
                onClick={() => setPaymentMethod("stripe")}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "stripe"
                    ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                      Stripe Gateway (บัตรเครดิต/เดบิต)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      รองรับ Visa, Mastercard, JCB, และ UnionPay (THB)
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "stripe"
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "stripe" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </label>

              {/* Option 2: PromptPay QR */}
              <label
                onClick={() => setPaymentMethod("promptpay")}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "promptpay"
                    ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                      สแกนจ่ายผ่าน Thai QR PromptPay
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      สแกนจ่ายได้ทุกแอปธนาคาร ตรวจสอบยอดและส่งไฟล์ทันที
                    </p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "promptpay"
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300"
                  }`}
                >
                  {paymentMethod === "promptpay" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </label>
            </div>

            {/* Simulated PromptPay QR preview when selected */}
            {paymentMethod === "promptpay" && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 animate-in fade-in duration-200">
                <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <QrCode className="w-32 h-32 mx-auto text-slate-800" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  ยอดชำระ: ฿{netTotal.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">
                  ระบบจะตรวจสอบการโอนอัตโนมัติทันทีที่กดยืนยันชำระเงิน
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary & Action */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              รายการที่จะซื้อ ({checkoutItems.length} รายการ)
            </h2>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-600 truncate max-w-[180px]">
                    {item.product.title} (x{item.quantity})
                  </span>
                  <span className="font-semibold text-slate-800">
                    ฿{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>ราคารวม ({checkoutItems.length} รายการ)</span>
                <span>฿{checkoutTotal.toLocaleString()}</span>
              </div>
              {discountParam > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>ส่วนลดโปรโมชัน</span>
                  <span>- ฿{discountParam.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-2 flex justify-between items-baseline font-bold">
                <span className="text-slate-800 text-sm">ยอดชำระสุทธิ</span>
                <span className="text-xl text-blue-600 font-extrabold">
                  ฿{netTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 active:scale-98 transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? "กำลังประมวลผลการชำระเงิน..."
                  : `ยืนยันและชำระเงิน ฿${netTotal.toLocaleString()}`}
              </span>
            </button>

            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>ความปลอดภัยมาตรฐาน 256-Bit SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          กำลังโหลดข้อมูลการชำระเงิน...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
