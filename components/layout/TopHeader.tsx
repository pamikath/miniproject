"use client";

import { useState } from "react";
import { Search, Bell, ShoppingCart, Menu, X, CheckCircle, Gift, Sparkles, User, LogOut, FileText, ShieldCheck, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";

interface TopHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function TopHeader({ onToggleMobileMenu }: TopHeaderProps) {
  const {
    searchQuery,
    setSearchQuery,
    cartCount,
    user,
    isAdmin,
    isLoggedIn,
    logout,
    setIsCartDrawerOpen,
    showToast,
  } = useShop();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  return (
    <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Toggle Button */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onToggleMobileMenu}
          aria-label="เปิดเมนู"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-base text-blue-600">LeafBook</span>
      </div>

      {/* แถบค้นหาตรงกลาง (Rounded Full ตามภาพ Mockup) */}
      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-2 md:mx-auto">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาสินค้า, หมวดหมู่ หรือคีย์เวิร์ด..."
          className="w-full pl-11 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/70 rounded-full focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-700 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ด้านขวา: ปุ่มลงขาย, กระดิ่ง, ตะกร้า, โปรไฟล์ */}
      <div className="flex items-center gap-2.5 sm:gap-4 md:gap-5 shrink-0">
        {/* ปุ่มลงขายสินค้าสำหรับผู้ใช้ */}
        <Link
          href="/sell"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
          title="ลงขายสินค้าดิจิทัลของคุณ"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">ลงขายสินค้า</span>
        </Link>
        {/* กระดิ่งแจ้งเตือน */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            aria-label="การแจ้งเตือน"
            className="text-slate-600 hover:text-slate-900 transition-colors relative p-1 active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1 right-1 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-76 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 px-1 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">
                  การแจ้งเตือน
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  อ่านแล้วทั้งหมด
                </span>
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex gap-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      คำสั่งซื้อ #LB20240615 เสร็จสิ้น
                    </p>
                    <p className="text-[10px] text-slate-400">
                      ดาวน์โหลด E-Book Next.js ได้ทันที
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ตะกร้าสินค้า: คลิกเพื่อเปิด Quick Drawer ทันที */}
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          aria-label="ตะกร้าสินค้า"
          className="text-slate-600 hover:text-slate-900 transition-colors relative p-1 active:scale-95 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="text-[10px] bg-red-500 text-white font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-1 -right-1 shadow-xs animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </button>

        {/* ผู้ใช้: ถ้าล็อกอินแล้วแสดง avatar & เมนู ถ้ายังไม่ล็อกอินแสดงปุ่มเข้าสู่ระบบ */}
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 group hover:opacity-90 transition-opacity pl-1 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 ring-2 ring-slate-100 shrink-0">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-700 hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
                {isAdmin && (
                  <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-md border border-purple-200 hidden sm:inline">
                    ADMIN
                  </span>
                )}
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-54 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    {isAdmin && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-md border border-purple-200 shrink-0">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>

                <div className="space-y-1 pt-1.5">
                  {/* เฉพาะ Admin เท่านั้นที่จะเห็นลิงก์นี้ ถ้าเป็นลูกค้าจะไม่แสดง */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>แผงควบคุม Admin</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>โปรไฟล์ของฉัน</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>คำสั่งซื้อของฉัน</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              สมัครสมาชิก
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
