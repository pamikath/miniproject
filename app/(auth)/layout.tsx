import Link from "next/link";
import { BookOpen, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
              LeafBook
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Digital Product Store
            </span>
          </div>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>ระบบร้านค้าดิจิทัล LeafBook</span>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="w-full flex-1 flex items-center justify-center py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>ระบบสมัครสมาชิกปลอดภัยด้วย 256-Bit SSL Encryption</span>
        </div>
        <p>© 2025 LeafBook Digital Product Store. สงวนลิขสิทธิ์ทั้งหมด</p>
      </footer>
    </div>
  );
}
