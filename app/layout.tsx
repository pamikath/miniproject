import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/context/ShopContext";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeafBook - ร้านขาย Digital Product คุณภาพ",
  description: "สินค้าออนไลน์คุณภาพ เพื่อการเรียนรู้และสร้างสรรค์ ดาวน์โหลด E-Book, คอร์สออนไลน์, เทมเพลต และซอฟต์แวร์ได้ทันที",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={promptFont.variable}>
      <body className={`${promptFont.className} bg-[#f8fafc] text-slate-800 antialiased min-h-screen flex flex-col`}>
        <ShopProvider>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
