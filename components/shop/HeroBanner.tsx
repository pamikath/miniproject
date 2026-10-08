"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#dbeafe]/85 via-[#eff6ff] to-[#f8fafc] border border-blue-100/80 p-6 sm:p-8 lg:p-10 mb-8 shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left text column */}
        <div className="max-w-md xl:max-w-lg text-left">
          {/* Badge */}
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold mb-3">
            Digital Product
          </div>

          {/* Heading matching image */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2.5">
            สินค้าออนไลน์คุณภาพ <br />
            เพื่อการเรียนรู้และสร้างสรรค์
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
            E-Book • Template • คอร์สออนไลน์ • ซอฟต์แวร์ และอื่นๆ อีกมากมาย
          </p>

          {/* CTA Button matching image */}
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#1e40af] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-blue-900/10 active:scale-95"
          >
            <span>เลือกชมสินค้า</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right Illustration Laptop Mockup matching image */}
        <div className="w-full lg:w-1/2 flex justify-center items-center relative">
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-900 group">
            <Image
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
              alt="Better ideas Bigger Dreams"
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-500"
              priority
            />
            {/* Screen UI Overlay */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-brightness-95 flex items-end p-4">
              <div className="w-full bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Better ideas, Bigger Dreams
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Next-Gen Digital Assets & Education
                  </p>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-md">
                  PRO
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
