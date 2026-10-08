"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isAuthLoading } = useShop();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.replace("/");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      login(email.trim());
      setLoading(false);
      router.push("/");
    }, 600);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-9 shadow-xl shadow-slate-200/40 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            เข้าสู่ระบบ LeafBook
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ยินดีต้อนรับกลับ! เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและไฟล์ของคุณ
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อีเมล
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                รหัสผ่าน
              </label>
              <Link
                href="#"
                className="text-[11px] text-blue-600 hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Register */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            สมัครสมาชิกใหม่ (รับส่วนลด 10%)
          </Link>
        </div>
      </div>
    </div>
  );
}
