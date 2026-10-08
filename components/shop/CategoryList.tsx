"use client";

import Link from "next/link";
import {
  BookOpen,
  Layout,
  GraduationCap,
  Camera,
  PenTool,
  Grid,
  ArrowRight,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { ProductCategory } from "@/lib/types";

interface CategoryItem {
  id: ProductCategory;
  title: string;
  subtitle: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "ebook",
    title: "E-Book",
    subtitle: "หนังสือดิจิทัล",
    icon: BookOpen,
    iconBg: "bg-[#e0f2fe]",
    iconColor: "text-[#0284c7]",
  },
  {
    id: "template",
    title: "Template",
    subtitle: "เทมเพลต & UI",
    icon: Layout,
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#7c3aed]",
  },
  {
    id: "course",
    title: "คอร์สออนไลน์",
    subtitle: "เรียนรู้ได้ทุกที่",
    icon: GraduationCap,
    iconBg: "bg-[#e0e7ff]",
    iconColor: "text-[#4f46e5]",
  },
  {
    id: "software",
    title: "ซอฟต์แวร์",
    subtitle: "โปรแกรม / เครื่องมือ",
    icon: Camera,
    iconBg: "bg-[#e0f2fe]",
    iconColor: "text-[#0284c7]",
  },
  {
    id: "graphics",
    title: "กราฟิก",
    subtitle: "แต่งภาพ & ออกแบบ",
    icon: PenTool,
    iconBg: "bg-[#ffe4e6]",
    iconColor: "text-[#e11d48]",
  },
  {
    id: "other",
    title: "อื่นๆ",
    subtitle: "สินค้าดิจิทัลอื่นๆ",
    icon: Grid,
    iconBg: "bg-[#f1f5f9]",
    iconColor: "text-[#64748b]",
  },
];

export default function CategoryList() {
  const { selectedCategory, setSelectedCategory } = useShop();

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          หมวดหมู่ยอดนิยม
        </h2>
        <button
          onClick={() => setSelectedCategory("all")}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
        >
          <span>ดูทั้งหมด</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(isSelected ? "all" : cat.id)
              }
              className={`p-3 sm:p-3.5 rounded-2xl border text-center flex flex-col items-center group transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105 ${cat.iconBg} ${cat.iconColor}`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-800 block truncate w-full">
                {cat.title}
              </span>
              <span className="text-[10px] text-slate-400 block truncate w-full mt-0.5 font-normal">
                {cat.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
