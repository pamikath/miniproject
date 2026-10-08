"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Grid,
  ShoppingCart,
  FileText,
  User,
  UserPlus,
  LogIn,
  Settings,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

interface LeftSidebarProps {
  onCloseMobile?: () => void;
  darkVariant?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  isAdminBadge?: boolean;
}

export default function LeftSidebar({
  onCloseMobile,
  darkVariant = false,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const { cartCount, isAdmin, isLoggedIn } = useShop();

  const NAV_ITEMS: NavItem[] = [
    { name: "หน้าหลัก", href: "/", icon: Home },
    { name: "สินค้า", href: "/products", icon: Package },
    { name: "หมวดหมู่", href: "/categories", icon: Grid },
    { name: "ลงขายสินค้า", href: "/sell", icon: Store },
    { name: "ตะกร้าสินค้า", href: "/cart", icon: ShoppingCart, badge: cartCount },
    { name: "คำสั่งซื้อ", href: "/orders", icon: FileText },
    { name: "โปรไฟล์", href: "/profile", icon: User },
    ...(isLoggedIn
      ? [{ name: "ตั้งค่า", href: "/settings", icon: Settings }]
      : [
          { name: "เข้าสู่ระบบ", href: "/login", icon: LogIn },
          { name: "สมัครสมาชิกใหม่", href: "/register", icon: UserPlus },
        ]),
  ];

  // เฉพาะ Admin เท่านั้นที่จะมีเมนูนี้แสดงขึ้นมา (ถ้าเป็นลูกค้าทั่วไปจะไม่มีขึ้นโชว์)
  const navItemsToRender: NavItem[] = [
    ...NAV_ITEMS,
    ...(isAdmin
      ? [
          {
            name: "จัดการระบบ (Admin)",
            href: "/admin",
            icon: ShieldCheck,
            isAdminBadge: true,
          },
        ]
      : []),
  ];

  const isDark = darkVariant;

  return (
    <aside
      className={`w-60 h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0 z-30 select-none transition-colors duration-200 ${
        isDark
          ? "bg-[#0f172a] text-white border-r border-slate-800"
          : "bg-white text-slate-800 border-r border-slate-100"
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Logo Brand matching image */}
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-2 py-3 mb-5 group transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`font-bold text-[17px] tracking-tight block leading-tight ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                LeafBook
              </span>
              <span
                className={`text-[10px] font-normal block tracking-wide ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                Digital Product Store
              </span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItemsToRender.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? isDark
                        ? item.isAdminBadge
                          ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                          : "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                        : item.isAdminBadge
                        ? "bg-purple-50 text-purple-700 font-semibold border border-purple-200/50"
                        : "bg-blue-50 text-blue-600 font-semibold"
                      : isDark
                      ? item.isAdminBadge
                        ? "text-purple-300 hover:text-white hover:bg-purple-950/40"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      : item.isAdminBadge
                      ? "text-purple-700 hover:text-purple-900 hover:bg-purple-50/80 font-medium"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? isDark
                            ? "text-white"
                            : item.isAdminBadge
                            ? "text-purple-700"
                            : "text-blue-600"
                          : item.isAdminBadge
                          ? "text-purple-600"
                          : isDark
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.isAdminBadge && (
                    <span className="text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                      ADMIN
                    </span>
                  )}
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="text-[11px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Promo Card Bottom (Matching image mockup) */}
        <div
          className={`p-3.5 rounded-2xl text-center relative overflow-hidden border ${
            isDark
              ? "bg-slate-800/80 border-slate-700/60 text-white"
              : "bg-gradient-to-b from-[#f0f4ff] to-[#e4ebff] border-blue-100/80 text-slate-800"
          }`}
        >
          {/* 3D Laptop illustration representation */}
          <div className="relative w-20 h-14 mx-auto mb-2 flex items-center justify-center">
            <div className="w-16 h-10 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-md flex items-center justify-center text-white relative">
              <div className="w-12 h-7 bg-slate-900 rounded-sm flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 opacity-90" />
              </div>
              <div className="absolute -bottom-1.5 w-18 h-1.5 bg-slate-300 rounded-b-md shadow-xs" />
            </div>
            {/* Sparkles */}
            <div className="absolute top-0 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
          </div>

          <h4
            className={`font-bold text-xs mb-0.5 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            เริ่มต้นไอเดียของคุณวันนี้
          </h4>
          <p
            className={`text-[10px] mb-2.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Digital Product สำหรับธุรกิจคุณ
          </p>
          <Link
            href="/products"
            onClick={onCloseMobile}
            className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-sm shadow-blue-600/25 active:scale-95"
          >
            <span>ดูเพิ่มเติม</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
