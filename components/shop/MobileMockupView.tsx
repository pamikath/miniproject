"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  ShoppingCart,
  Search,
  BookOpen,
  Layout,
  GraduationCap,
  Camera,
  Star,
  Heart,
  Home,
  Grid,
  User,
  ArrowRight,
  Wifi,
  Battery,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function MobileMockupView() {
  const { products, cartCount, addToCart, toggleWishlist, isWishlisted } = useShop();
  const prod1 = products[0];
  const isFav = prod1 ? isWishlisted(prod1.id) : false;

  return (
    <div className="py-6 flex flex-col items-center justify-center">
      {/* Mobile Device Frame (iPhone style) */}
      <div className="w-[360px] sm:w-[380px] bg-slate-900 rounded-[50px] p-3.5 shadow-2xl ring-12 ring-slate-800/60 border-4 border-slate-700 relative overflow-hidden">
        {/* Screen inside phone */}
        <div className="bg-[#f8fafc] rounded-[38px] overflow-hidden flex flex-col min-h-[720px] max-h-[780px] overflow-y-auto text-slate-800 relative shadow-inner">
          {/* Top Notch / Dynamic Island */}
          <div className="pt-3 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-900 sticky top-0 bg-[#f8fafc]/90 backdrop-blur-md z-30">
            <span>9:41</span>
            <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile Header matching mockup */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-white">
            <button className="p-1.5 text-slate-700">
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold text-xs text-slate-900 block leading-none">
                  LeafBook
                </span>
                <span className="text-[8px] text-slate-400 font-normal">
                  Digital Product Store
                </span>
              </div>
            </div>

            {/* Cart with badge */}
            <Link href="/cart" className="relative p-1.5 text-slate-700">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[9px] bg-red-500 text-white font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center absolute top-0.5 right-0.5">
                {cartCount || 2}
              </span>
            </Link>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า, หมวดหมู่ หรือคีย์เวิร์ด..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none placeholder-slate-400 shadow-2xs"
              />
            </div>

            {/* Mobile Hero Banner: "ไอเดียดีๆ เริ่มได้ที่นี่" matching Frame 1 */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#e0e7ff] via-[#ede9fe] to-[#fce7f3] border border-purple-100 relative overflow-hidden text-left shadow-xs">
              <div className="max-w-[65%] space-y-1">
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  ไอเดียดีๆ <br />
                  เริ่มได้ที่นี่
                </h2>
                <p className="text-[10px] text-slate-600 leading-relaxed font-normal">
                  คัดสรร Digital Product คุณภาพ เพื่อการเรียนรู้และพัฒนาตัวเอง
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold shadow-xs"
                >
                  <span>ช้อปเลย</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* 3D Laptop illustration representation */}
              <div className="absolute right-2 bottom-2 w-24 h-20 flex items-center justify-center">
                <div className="w-20 h-12 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg flex items-center justify-center p-1">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Categories (4 items) matching Frame 1 */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "E-Book", icon: BookOpen, bg: "bg-[#e0f2fe] text-[#0284c7]" },
                { label: "Template", icon: Layout, bg: "bg-[#ede9fe] text-[#7c3aed]" },
                { label: "คอร์สออนไลน์", icon: GraduationCap, bg: "bg-[#e0e7ff] text-[#4f46e5]" },
                { label: "ซอฟต์แวร์", icon: Camera, bg: "bg-[#e0f2fe] text-[#0284c7]" },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-white border border-slate-100 flex flex-col items-center text-center shadow-2xs"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${c.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-700 truncate w-full">
                      {c.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Popular Products Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-xs font-bold text-slate-900">
                สินค้ายอดนิยม
              </h3>
              <Link
                href="/products"
                className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            {/* Mobile Product Card matching Frame 1 */}
            {prod1 && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs flex gap-3 p-2.5 items-center">
                <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={prod1.coverImage}
                    alt={prod1.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded text-[8px] font-bold bg-blue-600 text-white">
                    แนะนำ
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">
                    {prod1.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 my-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-700">4.8</span>
                    <span className="text-[9px] text-slate-400">(124)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">
                      ฿ 299
                    </span>
                    <button
                      onClick={() => addToCart(prod1)}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-semibold"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => toggleWishlist(prod1.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation matching Frame 1 */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-2 flex items-center justify-around z-30">
            <div className="flex flex-col items-center gap-0.5 text-blue-600 font-semibold">
              <Home className="w-4 h-4" />
              <span className="text-[9px]">หน้าแรก</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-slate-400">
              <Grid className="w-4 h-4" />
              <span className="text-[9px]">หมวดหมู่</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-slate-400 relative">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-[8px] bg-red-500 text-white font-bold w-3 h-3 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                2
              </span>
              <span className="text-[9px]">ตะกร้า</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 text-slate-400">
              <User className="w-4 h-4" />
              <span className="text-[9px]">โปรไฟล์</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
