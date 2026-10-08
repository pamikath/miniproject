"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ShoppingBag, CheckCircle2, Clock, XCircle, FileText, User, MapPin, Heart, LogOut, ArrowRight } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { OrderStatus } from "@/lib/types";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, downloadFile, user, isAdmin, isLoggedIn, isAuthLoading, logout, showToast } = useShop();
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const userOrders = isAdmin
    ? orders
    : orders.filter(
        (o) =>
          !o.customerEmail ||
          o.customerEmail.toLowerCase() === user.email.toLowerCase() ||
          o.customerName === user.name
      );

  const filteredOrders = userOrders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return {
          text: "เสร็จสิ้น",
          className: "bg-emerald-50 text-emerald-600 border-emerald-200",
        };
      case "processing":
        return {
          text: "กำลังจัดส่ง",
          className: "bg-amber-50 text-amber-600 border-amber-200",
        };
      case "pending_payment":
        return {
          text: "รอชำระเงิน",
          className: "bg-slate-100 text-slate-500 border-slate-200",
        };
      case "cancelled":
        return {
          text: "ยกเลิก",
          className: "bg-rose-50 text-rose-500 border-rose-200",
        };
      default:
        return {
          text: status,
          className: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  if (isAuthLoading || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium animate-pulse">
          กำลังไปที่หน้าเข้าสู่ระบบ...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Orders List matching bottom-middle mockup */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              คำสั่งซื้อของฉัน
            </h1>
          </div>

          {/* Status Filter Tabs (ตาม UI Mockup) */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "processing", label: "กำลังจัดส่ง" },
              { id: "completed", label: "สำเร็จแล้ว" },
              { id: "cancelled", label: "ยกเลิก" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders List matching image */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">ยังไม่มีรายการคำสั่งซื้อ</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {activeTab === "all" ? "คุณยังไม่มีประวัติการซื้อในระบบ" : "ไม่มีคำสั่งซื้อในสถานะนี้"}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <span>เลือกดูสินค้าดิจิทัล</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const firstItem = order.items[0];

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 relative shrink-0">
                        {firstItem && (
                          <Image
                            src={firstItem.coverImage}
                            alt={firstItem.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block font-mono">
                          {order.orderNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
                          {firstItem?.title || "คำสั่งซื้อสินค้าดิจิทัล"}
                        </h4>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          ฿ {order.netAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        {order.date}
                      </span>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${badge.className}`}
                      >
                        {badge.text}
                      </span>

                      {order.status === "completed" && firstItem && (
                        <button
                          onClick={() => downloadFile(firstItem)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ดาวน์โหลด</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Profile Widget matching bottom-right mockup */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 ring-2 ring-slate-100">
              <Image
                src={user.avatar}
                alt={user.name}
                width={64}
                height={64}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
            <p className="text-[11px] text-slate-400">{user.email}</p>
            <Link
              href="/profile?tab=personal"
              className="mt-2 inline-block px-3 py-1 rounded-lg border border-blue-200 text-blue-600 text-[11px] font-semibold hover:bg-blue-50 transition-colors"
            >
              แก้ไขข้อมูล
            </Link>
          </div>

          <div className="space-y-1 text-xs">
            <Link
              href="/profile?tab=personal"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>ข้อมูลส่วนตัว</span>
            </Link>
            <Link
              href="/profile?tab=address"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>ที่อยู่จัดส่ง</span>
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50/60 text-blue-600 font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>ประวัติการสั่งซื้อ</span>
            </Link>
            <Link
              href="/products?filter=wishlist"
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <Heart className="w-4 h-4 text-slate-400" />
              <span>รายการโปรด</span>
            </Link>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
