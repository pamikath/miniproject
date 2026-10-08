"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/layout/LeftSidebar";
import TopHeader from "@/components/layout/TopHeader";
import RightSidebar from "@/components/layout/RightSidebar";
import MobileNav from "@/components/layout/MobileNav";
import Toast from "@/components/shop/Toast";
import QuickCartDrawer from "@/components/shop/QuickCartDrawer";
import QuickViewModal from "@/components/shop/QuickViewModal";
import { useShop } from "@/context/ShopContext";
import { X, Moon, Sun } from "lucide-react";

function ShopLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkSidebar, toggleDarkSidebar, isLoggedIn, isAuthLoading } = useShop();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">
            กำลังโหลดข้อมูลร้านค้า...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <div className="flex flex-1 relative">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block shrink-0">
          <LeftSidebar darkVariant={darkSidebar} />
        </div>

        {/* Mobile Left Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className={`relative w-64 max-w-[80%] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 ${
                darkSidebar ? "bg-[#0f172a]" : "bg-white"
              }`}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
              <LeftSidebar
                darkVariant={darkSidebar}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 xl:mr-80 pb-20 lg:pb-8">
          <TopHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-7 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Desktop Right Sidebar (User Widget ~320px) */}
        <div className="hidden xl:block fixed top-0 right-0 h-screen w-80 bg-white border-l border-slate-100 overflow-y-auto z-20">
          <RightSidebar />
        </div>
      </div>

      {/* Floating Theme Switcher button (Toggle between White Sidebar and Dark Sidebar) */}
      <button
        onClick={toggleDarkSidebar}
        title={darkSidebar ? "เปลี่ยนเป็นแถบข้างสีขาว" : "เปลี่ยนเป็นแถบข้างสีเข้ม (Dark Sidebar)"}
        className="fixed bottom-20 lg:bottom-6 left-6 z-40 p-2.5 rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-medium"
      >
        {darkSidebar ? (
          <>
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">โหมดแถบขาว</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">โหมดแถบเข้ม</span>
          </>
        )}
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Slide-out Quick Cart Drawer */}
      <QuickCartDrawer />

      {/* Quick View Product Modal */}
      <QuickViewModal />

      {/* Floating Toast Notification */}
      <Toast />
    </div>
  );
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShopLayoutContent>{children}</ShopLayoutContent>;
}
