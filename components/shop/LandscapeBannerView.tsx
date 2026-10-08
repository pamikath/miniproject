"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import CategoryList from "./CategoryList";
import ProductGrid from "./ProductGrid";

export default function LandscapeBannerView() {
  return (
    <div className="space-y-6">
      {/* Landscape Sunrise Mountain Hero Banner (Matching Frame 3 in reference mockup) */}
      <div className="relative overflow-hidden rounded-3xl min-h-[220px] sm:min-h-[260px] p-6 sm:p-8 flex items-center justify-between text-white shadow-md border border-slate-700/20">
        {/* Background Image: Mountain Lake Landscape */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Landscape mountain lake sunrise"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
        </div>

        {/* Content on left */}
        <div className="relative z-10 max-w-lg space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Digital Product Special</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            เรียนรู้ได้ทุกที่ ทุกเวลา <br />
            กับ Digital Product
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm font-normal">
            E-Book • Template • คอร์สออนไลน์ • ซอฟต์แวร์
          </p>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-900/30 active:scale-95"
          >
            <span>ช้อปเลย</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desk with laptop mockup on right */}
        <div className="hidden md:flex relative z-10 w-72 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40">
          <Image
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"
            alt="Coding desk"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Categories & Products */}
      <CategoryList />
      <ProductGrid />
    </div>
  );
}
