"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingCart, User } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartDrawerOpen, isLoggedIn } = useShop();

  const NAV_ITEMS = [
    { name: "หน้าแรก", href: "/", icon: Home },
    { name: "หมวดหมู่", href: "/categories", icon: Grid },
    { name: "ตะกร้า", href: "/cart", icon: ShoppingCart, badge: cartCount },
    { name: isLoggedIn ? "โปรไฟล์" : "เข้าสู่ระบบ", href: isLoggedIn ? "/profile" : "/login", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-40 shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        if (item.href === "/cart") {
          return (
            <button
              key={item.href}
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative text-slate-500 hover:text-slate-800"
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px]">{item.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
              isActive ? "text-blue-600 font-semibold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px]">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
