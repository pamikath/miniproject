"use client";

import { useShop } from "@/context/ShopContext";
import { CheckCircle2 } from "lucide-react";

export default function Toast() {
  const { toastMessage } = useShop();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-sm font-medium">{toastMessage}</span>
    </div>
  );
}
