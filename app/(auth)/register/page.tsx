"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Gift,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useShop } from "@/context/ShopContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoggedIn, isAuthLoading } = useShop();

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.replace("/");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("กรุณากรอกชื่อ-นามสกุลของคุณ");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("กรุณายอมรับข้อกำหนดการใช้งาน");
      return;
    }

    setLoading(true);

    // Call register to update shop context & localStorage immediately
    setTimeout(() => {
      register(fullName.trim(), email.trim());
      setLoading(false);
      setRegisteredSuccess(true);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      // Automatically redirect after celebration
      setTimeout(() => {
        router.push("/?registered=true");
      }, 2000);
    }, 600);
  };

  if (registeredSuccess) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-8 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ยินดีต้อนรับสมาชิกใหม่!</span>
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            สมัครสมาชิกสำเร็จแล้ว
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ยินดีต้อนรับคุณ <span className="font-semibold text-slate-800">{fullName}</span> สู่ครอบครัว LeafBook
          </p>
        </div>

        {/* Welcome Bonus Coupon Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">
                ของขวัญต้อนรับลูกค้าใหม่
              </span>
            </div>
            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
              ลด 10%
            </span>
          </div>
          <p className="text-xs text-slate-600">
            โค้ดส่วนลดของคุณคือ: <strong className="font-mono text-blue-600 text-sm">LEAF10</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            + คุณได้รับคะแนนสะสมฟรี 50 คะแนนในบัญชีทันที!
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25 active:scale-95"
        >
          <span>เริ่มเลือกชมสินค้าทันที</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-9 shadow-xl shadow-slate-200/40 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-1">
            <Gift className="w-3.5 h-3.5" />
            <span>สิทธิพิเศษสำหรับลูกค้าใหม่</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            สมัครสมาชิก LeafBook
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            เปิดบัญชีฟรีวันนี้ รับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก
          </p>
        </div>

        {/* Benefits bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-[11px]">
          <div>
            <span className="font-bold text-blue-600 block">ลด 10%</span>
            <span className="text-slate-400 text-[10px]">โค้ด LEAF10</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="font-bold text-amber-500 block">+50 คะแนน</span>
            <span className="text-slate-400 text-[10px]">คะแนนสะสมฟรี</span>
          </div>
          <div>
            <span className="font-bold text-emerald-600 block">ตลอดชีพ</span>
            <span className="text-slate-400 text-[10px]">ดาวน์โหลดไม่จำกัด</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600 text-center">
            {errorMessage}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อ - นามสกุล *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี หรือ Pamika Thamnamuang"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อีเมล *
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

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-400 font-mono"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ยืนยันรหัสผ่าน *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
            />
            <span className="text-xs text-slate-600 leading-snug">
              ฉันยอมรับ{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                ข้อกำหนดการใช้งาน
              </Link>{" "}
              และ{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                นโยบายความเป็นส่วนตัว
              </Link>{" "}
              ของ LeafBook
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิกและรับส่วนลด 10%"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-2">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 absolute">
            หรือสมัครด้วย
          </span>
        </div>

        {/* Quick Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleRegister({ preventDefault: () => {} } as any)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleRegister({ preventDefault: () => {} } as any)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Link to Login */}
        <p className="text-center text-xs text-slate-500 pt-2">
          มีบัญชีอยู่แล้วใช่ไหม?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  );
}
