"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Crown,
  Heart,
  ShoppingBag,
  Award,
  ArrowRight,
  Zap,
  Layout,
  GraduationCap,
  Laptop,
  Mail,
  Download,
  LogIn,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function RightSidebar() {
  const { user, isAdmin, isLoggedIn, orders, wishlist, downloadFile, showToast } = useShop();

  const userOrders = isAdmin
    ? orders
    : orders.filter(
        (o) =>
          !o.customerEmail ||
          o.customerEmail.toLowerCase() === user.email.toLowerCase() ||
          o.customerName === user.name
      );

  const handleApplyPromo = () => {
    navigator.clipboard?.writeText("LEAF10");
    showToast("คัดลอกโค้ดส่วนลด LEAF10 สำเร็จ! ใช้รับส่วนลด 10% ในหน้าชำระเงิน");
  };

  return (
    <div className="p-5 flex flex-col justify-between h-full text-slate-800 select-none">
      <div className="space-y-5">
        {/* User Card vs Guest Card */}
        {isLoggedIn ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-100">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      สวัสดี, {user.name.split(" ")[0]}
                    </h3>
                    <span className="text-xs shrink-0">👑</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">{user.tier}</span>
                    {isAdmin && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] border border-purple-200 shrink-0 transition-colors"
                  title="เข้าสู่แผงควบคุม Admin"
                >
                  Admin &rarr;
                </Link>
              )}
            </div>

            {/* 3 Stats Boxes (แสดงเฉพาะเมื่อเข้าสู่ระบบแล้วเท่านั้น) */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50/90 p-2.5 rounded-2xl border border-slate-100">
              <Link
                href="/products?filter=wishlist"
                className="text-center group hover:opacity-85 transition-opacity"
              >
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>รายการโปรด</span>
                </div>
                <span className="font-bold text-sm text-slate-800">
                  {wishlist.length}
                </span>
              </Link>

              <Link
                href="/orders"
                className="text-center border-x border-slate-200/80 group hover:opacity-85 transition-opacity"
              >
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                  <ShoppingBag className="w-3 h-3 text-blue-500" />
                  <span>คำสั่งซื้อ</span>
                </div>
                <span className="font-bold text-sm text-slate-800">
                  {userOrders.length}
                </span>
              </Link>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] mb-0.5">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>คะแนนสะสม</span>
                </div>
                <span className="font-bold text-sm text-amber-600">
                  {user.stats?.rewardPoints ?? 0}
                </span>
              </div>
            </div>

            {/* Recent Orders List (แสดงเฉพาะเมื่อเข้าสู่ระบบแล้วเท่านั้น) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-bold text-xs text-slate-900">
                  ประวัติการซื้อ
                </h4>
                <Link
                  href="/orders"
                  className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium"
                >
                  <span>ดูทั้งหมด</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {userOrders.length > 0 ? (
                  userOrders.slice(0, 4).map((ord) => {
                    const firstItem = ord.items[0];
                    const isDone = ord.status === "completed";
                    return (
                      <div
                        key={ord.id}
                        className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-between gap-2.5 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs bg-blue-600 text-white">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[11px] font-medium text-slate-700 truncate">
                            {firstItem?.title || "สินค้าดิจิทัล LeafBook"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isDone && firstItem && (
                            <button
                              onClick={() => downloadFile(firstItem)}
                              title="ดาวน์โหลดไฟล์ดิจิทัลทันที"
                              className="p-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          )}
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                              isDone
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}
                          >
                            {isDone ? "เสร็จสิ้น" : "กำลังจัดส่ง"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-center space-y-1.5">
                    <ShoppingBag className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">
                      ยังไม่มีประวัติการซื้อ
                    </p>
                    <p className="text-[10px] text-slate-400">
                      เมื่อสั่งซื้อสำเร็จจะแสดงรายการที่นี่
                    </p>
                    <Link
                      href="/products"
                      className="inline-block text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                    >
                      เลือกซื้อสินค้าเลย &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* สถานะยังไม่ได้เข้าสู่ระบบ (หน้าแดชบอร์ดเข้าสู่ระบบ) */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-slate-50 border border-blue-100 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">เข้าสู่ระบบ LeafBook</h3>
                  <p className="text-[10px] text-slate-500">ยินดีต้อนรับสู่ร้านค้าดิจิทัล</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3.5">
                เข้าสู่ระบบเพื่อใช้งานตะกร้าสินค้า บันทึกรายการโปรด จัดการคำสั่งซื้อ สะสมคะแนน และเข้าถึงประวัติการซื้อของคุณ
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2 text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2 text-center rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all active:scale-95"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            </div>

            {/* Member Benefits Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>สิทธิประโยชน์เมื่อเข้าสู่ระบบ</span>
              </h4>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>บันทึก <strong>รายการโปรด</strong> และซิงค์ทุกอุปกรณ์</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>เพิ่มสินค้าลงตะกร้า & ตรวจสอบ <strong>คำสั่งซื้อ</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>คะแนนสะสม</strong> ทุกคำสั่งซื้อแลกรับส่วนลด</span>
                </div>
                <div className="flex items-start gap-2">
                  <Download className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>ดาวน์โหลดไฟล์ได้ทันทีใน <strong>ประวัติการซื้อ</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promo Banner Bottom matching image */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-[#e0e7ff] via-[#ede9fe] to-[#fce7f3] border border-purple-100 text-slate-800 relative overflow-hidden shadow-xs">
        {/* Floating 3D envelope illustration on right */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h5 className="font-bold text-xs text-slate-900 leading-snug">
              สมัครสมาชิกวันนี้ <br />
              รับส่วนลดพิเศษ 10%
            </h5>
            <Link
              href="/register"
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-all shadow-xs active:scale-95"
            >
              <span>สมัครเลย</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 3D Envelope illustration representation */}
          <div className="w-14 h-14 relative shrink-0 flex items-center justify-center">
            <div className="w-12 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md flex items-center justify-center text-white relative">
              <Mail className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
