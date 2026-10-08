"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  MapPin,
  FileText,
  Heart,
  LogOut,
  ChevronRight,
  Shield,
  Crown,
  Edit2,
  Mail,
  Award,
  Phone,
  Building,
  Save,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Camera,
  Check,
  Upload,
  Link as LinkIcon,
  Dices,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { AddressInfo } from "@/lib/types";

// หมวดการ์ตูนผู้หญิง 3 ลักษณะ: ผมยาว, สั้น, ถักเปีย
const CARTOON_WOMEN = [
  {
    id: "w-long",
    trait: "ผมยาว",
    label: "ผู้หญิงผมยาว",
    sublabel: "ผมยาวสลวย สไตล์การ์ตูนหวานละมุน",
    tagColor: "bg-pink-100 text-pink-700 border-pink-200",
    url: "https://i.pinimg.com/736x/2f/d2/1b/2fd21bd35fbe51140cb7d534b157ce2d.jpg",
  },
  {
    id: "w-short",
    trait: "ผมสั้น",
    label: "ผู้หญิงผมสั้น",
    sublabel: "ผมสั้น บ๊อบสดใส กระฉับกระเฉง",
    tagColor: "bg-sky-100 text-sky-700 border-sky-200",
    url: "https://i.pinimg.com/736x/35/aa/92/35aa929107a2415030ad541882dc7df5.jpg",
  },
  {
    id: "w-braids",
    trait: "ถักเปีย",
    label: "ผู้หญิงถักเปีย",
    sublabel: "ผมเปียน่ารัก สไตล์เรียบร้อย",
    tagColor: "bg-purple-100 text-purple-700 border-purple-200",
    url: "https://i.pinimg.com/736x/dc/8e/0e/dc8e0ea7a7e78877215668113f7c4917.jpg",
  },
];

// หมวดการ์ตูนผู้ชาย ลักษณะ: ผมสั้น, หยิก
const CARTOON_MEN = [
  {
    id: "m-short",
    trait: "ผมสั้น",
    label: "ผู้ชายผมสั้น",
    sublabel: "ผมสั้น เซ็ตทรง สุภาพเท่มั่นใจ",
    tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    url: "https://i.pinimg.com/1200x/0e/69/43/0e69431338396594e763cae1fadb27d9.jpg",
  },
  {
    id: "m-wave",
    trait: "ผมหยิก",
    label: "ผู้ชายผมหยิก",
    sublabel: "ผมหยิกลอน มีสไตล์ น่ารักสดใส",
    tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    url: "https://i.pinimg.com/736x/2f/07/d3/2f07d37342dab89ef953ff0b4073011b.jpg",
  },
];

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialTab = (searchParams.get("tab") as "overview" | "personal" | "address") || "overview";
  const { user, isAdmin, isLoggedIn, isAuthLoading, switchRole, updateUserProfile, updateAddress, logout, showToast } = useShop();

  const [activeTab, setActiveTab] = useState<"overview" | "personal" | "address">(initialTab);
  const [avatarCategory, setAvatarCategory] = useState<"women" | "men" | "all" | "custom">("women");
  const [customUrlInput, setCustomUrlInput] = useState("");

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const tabParam = searchParams.get("tab") as "overview" | "personal" | "address";
    if (tabParam && ["overview", "personal", "address"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Form State: Personal Information
  const [personalForm, setPersonalForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "089-123-4567",
    bio: user.bio || "Digital Creator & Next.js Enthusiast",
    avatar: user.avatar || CARTOON_WOMEN[0].url,
  });

  useEffect(() => {
    setPersonalForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "089-123-4567",
      bio: user.bio || "Digital Creator & Next.js Enthusiast",
      avatar: user.avatar || CARTOON_WOMEN[0].url,
    });
  }, [user]);

  // Form State: Address Information
  const [addressForm, setAddressForm] = useState<AddressInfo>({
    recipientName: user.address?.recipientName || user.name || "",
    phone: user.address?.phone || user.phone || "089-123-4567",
    addressLine: user.address?.addressLine || "123/45 คอนโดมิเนียมสุขุมวิท ซอยสุขุมวิท 21",
    subdistrict: user.address?.subdistrict || "คลองเตยเหนือ",
    district: user.address?.district || "วัฒนา",
    province: user.address?.province || "กรุงเทพมหานคร",
    postalCode: user.address?.postalCode || "10110",
    taxId: user.address?.taxId || "0105561234567",
    companyName: user.address?.companyName || "LeafBook Creative Co., Ltd.",
  });

  useEffect(() => {
    if (user.address) {
      setAddressForm(user.address);
    }
  }, [user.address]);

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Handle Uploading Image from Local Device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น (.jpg, .png, .webp, .svg)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("ขนาดรูปภาพต้องไม่เกิน 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPersonalForm((prev) => ({ ...prev, avatar: reader.result as string }));
        showToast("เพิ่มรูปโปรไฟล์ของคุณเรียบร้อย! อย่าลืมกดบันทึก");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Custom Image URL
  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      showToast("กรุณาระบุลิงก์ URL รูปภาพ");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      showToast("ลิงก์ URL ต้องขึ้นต้นด้วย https:// หรือ http://");
      return;
    }
    setPersonalForm((prev) => ({ ...prev, avatar: trimmed }));
    setCustomUrlInput("");
    showToast("เปลี่ยนรูปโปรไฟล์จาก URL สำเร็จ! อย่าลืมกดบันทึก");
  };

  // Randomize a fun cartoon avatar
  const handleRandomizeCartoon = () => {
    const styles = ["lorelei", "avataaars", "adventurer", "notionists", "open-peeps", "bottts"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const randomUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,ffd5dc,c0aede,ffdfbf,d1d4f9`;
    setPersonalForm((prev) => ({ ...prev, avatar: randomUrl }));
    showToast("สุ่มการ์ตูนลายใหม่สำเร็จ!");
  };

  // Handle Save Personal Info
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalForm.name.trim()) {
      showToast("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    if (!personalForm.email.trim()) {
      showToast("กรุณากรอกอีเมล");
      return;
    }

    setSavingPersonal(true);
    setTimeout(() => {
      updateUserProfile({
        name: personalForm.name.trim(),
        email: personalForm.email.trim(),
        phone: personalForm.phone.trim(),
        bio: personalForm.bio.trim(),
        avatar: personalForm.avatar,
      });
      setSavingPersonal(false);
      setActiveTab("overview");
    }, 400);
  };

  // Handle Save Address Info
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.recipientName.trim()) {
      showToast("กรุณากรอกชื่อผู้รับ");
      return;
    }
    if (!addressForm.addressLine.trim()) {
      showToast("กรุณากรอกที่อยู่");
      return;
    }

    setSavingAddress(true);
    setTimeout(() => {
      updateAddress(addressForm);
      setSavingAddress(false);
      setActiveTab("overview");
    }, 400);
  };

  const MENU_LINKS = [
    {
      title: "ลงขายสินค้าของคุณ (Creator Studio)",
      subtitle: "ลงขาย E-Book, ซอร์สโค้ด, เทมเพลต สร้างรายได้ด้วยตัวเอง",
      icon: Store,
      href: "/sell",
      badgeText: "CREATOR",
      highlight: true,
    },
    ...(isAdmin
      ? [
          {
            title: "แผงควบคุมระบบ (Admin Panel)",
            subtitle: "จัดการสินค้าดิจิทัล อัปโหลดไฟล์ ตรวจสอบคำสั่งซื้อ",
            icon: ShieldCheck,
            href: "/admin",
            badgeText: "ADMIN",
            highlight: false,
          },
        ]
      : []),
    {
      title: "ข้อมูลส่วนตัว",
      subtitle: `${user.name} • ${user.email}`,
      icon: User,
      onClick: () => setActiveTab("personal"),
    },
    {
      title: "ที่อยู่จัดส่ง / ข้อมูลใบกำกับภาษี",
      subtitle: user.address
        ? `${user.address.addressLine}, ${user.address.district}`
        : "ยังไม่ได้ระบุที่อยู่จัดส่ง",
      icon: MapPin,
      onClick: () => setActiveTab("address"),
    },
    {
      title: "ประวัติการสั่งซื้อ",
      subtitle: `มีประวัติทั้งหมด ${user.stats.ordersCount} รายการ`,
      icon: FileText,
      href: "/orders",
    },
    {
      title: "รายการโปรด",
      subtitle: `บันทึกไว้ ${user.stats.favoritesCount} รายการ`,
      icon: Heart,
      href: "/products?filter=wishlist",
    },
    {
      title: "ออกจากระบบ",
      subtitle: "สิ้นสุดเซสชันการใช้งาน",
      icon: LogOut,
      textColor: "text-rose-600",
      onClick: () => {
        logout();
      },
    },
  ];

  if (isAuthLoading || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium animate-pulse">
          กำลังไปที่หน้าเข้าสู่ระบบ...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Navigation Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === "overview"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
        >
          ภาพรวมโปรไฟล์
        </button>

        <button
          onClick={() => setActiveTab("personal")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "personal"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
        >
          <User className="w-4 h-4" />
          <span>ข้อมูลส่วนตัว</span>
        </button>

        <button
          onClick={() => setActiveTab("address")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "address"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
        >
          <MapPin className="w-4 h-4" />
          <span>ที่อยู่จัดส่ง / ใบเสร็จ</span>
        </button>
      </div>

      {/* VIEW 1: OVERVIEW (หน้าหลักตามภาพ Mockup) */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-blue-500/20 shadow-md bg-slate-100">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={96}
                  height={96}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setActiveTab("personal")}
                title="เปลี่ยนรูปโปรไฟล์"
                className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera className="w-6 h-6" />
              </button>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                <Crown className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                      {user.name}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                      {user.tier}
                    </span>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        🛡️ Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                    {user.phone && (
                      <>
                        <span className="mx-1">•</span>
                        <Phone className="w-3.5 h-3.5" />
                        <span>{user.phone}</span>
                      </>
                    )}
                  </p>
                  {user.bio && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      &ldquo;{user.bio}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab("personal")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50 transition-colors self-center sm:self-auto cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>แก้ไขข้อมูล</span>
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/products?filter=wishlist"
                  className="hover:opacity-80 transition-opacity"
                >
                  <span className="text-[10px] text-slate-400 block">รายการโปรด</span>
                  <span className="text-sm font-bold text-slate-800">
                    {user.stats.favoritesCount}
                  </span>
                </Link>
                <Link
                  href="/orders"
                  className="border-x border-slate-100 hover:opacity-80 transition-opacity"
                >
                  <span className="text-[10px] text-slate-400 block">คำสั่งซื้อ</span>
                  <span className="text-sm font-bold text-blue-600">
                    {user.stats.ordersCount}
                  </span>
                </Link>
                <div>
                  <span className="text-[10px] text-slate-400 block">คะแนนสะสม</span>
                  <span className="text-sm font-bold text-amber-500">
                    {user.stats.rewardPoints}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Banner (เฉพาะ Admin เท่านั้น ถ้าเป็นลูกค้าจะไม่แสดง) */}
          {isAdmin && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-bold text-sm">เข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin)</h3>
                    <span className="text-[10px] bg-white text-purple-700 font-extrabold px-2 py-0.5 rounded-full">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-purple-100">
                    คุณสามารถจัดการสินค้าดิจิทัล ตรวจสอบคำสั่งซื้อ และดูสถิติระบบได้ทั้งหมด
                  </p>
                </div>
              </div>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-white text-purple-700 font-bold text-xs hover:bg-purple-50 transition-all shadow-sm active:scale-95 shrink-0"
              >
                เปิดแผงควบคุม Admin &rarr;
              </Link>
            </div>
          )}

          {/* Quick Address Card Preview */}
          {user.address && (
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      ที่อยู่จัดส่ง & ออกใบเสร็จ
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                      บันทึกแล้ว
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {user.address.recipientName} ({user.address.phone})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {user.address.addressLine} {user.address.subdistrict}{" "}
                    {user.address.district} {user.address.province}{" "}
                    {user.address.postalCode}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("address")}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
              >
                แก้ไขที่อยู่
              </button>
            </div>
          )}

          {/* Menu Options List (as in mockup) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-2 shadow-xs divide-y divide-slate-100">
            {MENU_LINKS.map((item, idx) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors rounded-2xl group w-full cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3
                        className={`text-xs sm:text-sm font-semibold ${item.textColor || "text-slate-800 group-hover:text-blue-600"
                          } transition-colors`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              );

              return item.href ? (
                <Link key={idx} href={item.href}>
                  {content}
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ข้อมูลส่วนตัว (Personal Info - การ์ตูนหลากหลาย & เพิ่มรูปเองได้) */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("overview")}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  แก้ไขข้อมูลส่วนตัว
                </h2>
                <p className="text-xs text-slate-400">
                  เลือกรูปการ์ตูน อัปโหลดรูปภาพ หรือแก้ไขข้อมูลของคุณ
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
              สถานะ: {user.tier}
            </span>
          </div>

          <form onSubmit={handleSavePersonal} className="space-y-6">
            {/* AVATAR SELECTOR & UPLOADER */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                รูปโปรไฟล์ (Avatar)
              </label>

              {/* Current Avatar Preview Box */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500/30 bg-white shadow-md">
                    <Image
                      src={personalForm.avatar}
                      alt={personalForm.name}
                      width={96}
                      height={96}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="คลิกเพื่ออัปโหลดรูปจากเครื่อง"
                    className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] cursor-pointer"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>เปลี่ยนรูป</span>
                  </button>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      รูปโปรไฟล์ปัจจุบัน
                    </span>
                    <p className="text-[11px] text-slate-500">
                      คุณสามารถเลือกการ์ตูนสำเร็จรูปด้านล่าง หรือกดปุ่มอัปโหลดรูปจากเครื่องของคุณได้ทันที
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูปจากเครื่อง</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRandomizeCartoon}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Dices className="w-3.5 h-3.5 text-blue-600" />
                      <span>สุ่มการ์ตูนใหม่</span>
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Avatar Categories Tabs */}
              <div className="pt-2 space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setAvatarCategory("women")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${avatarCategory === "women"
                        ? "bg-pink-500 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <span>👩‍🦰 การ์ตูนผู้หญิง (3 ลักษณะ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarCategory("men")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${avatarCategory === "men"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <span>👨‍🦱 การ์ตูนผู้ชาย (2 ลักษณะ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarCategory("all")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${avatarCategory === "all"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <span>✨ รวมครบ {CARTOON_WOMEN.length + CARTOON_MEN.length} แบบ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarCategory("custom")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${avatarCategory === "custom"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <span>📁 อัปโหลดรูปเอง / URL</span>
                  </button>
                </div>

                {/* Sub-view: Women Cartoons (3 ลักษณะ: ผมยาว, ผมสั้น, ถักเปีย) */}
                {avatarCategory === "women" && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                      <span className="font-semibold text-pink-700">
                        👩‍🦰 มีให้เลือก 3 ลักษณะ: ผมยาว • ผมสั้น • ถักเปีย
                      </span>
                      <span className="text-[11px] text-pink-500">แตะที่การ์ดเพื่อเลือก</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {CARTOON_WOMEN.map((preset) => {
                        const isSelected = personalForm.avatar === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setPersonalForm((prev) => ({ ...prev, avatar: preset.url }));
                              showToast(`เลือกการ์ตูน "${preset.label}" เรียบร้อย`);
                            }}
                            className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all cursor-pointer text-center bg-white ${isSelected
                                ? "border-pink-500 bg-pink-50/40 ring-4 ring-pink-500/10 shadow-md scale-[1.01]"
                                : "border-slate-200 hover:border-pink-300 hover:bg-slate-50/50 hover:shadow-xs"
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 bg-pink-600 text-white shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>เลือกอยู่</span>
                              </div>
                            )}

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-2.5 ${preset.tagColor}`}
                            >
                              ลักษณะ: {preset.trait}
                            </span>

                            <div
                              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 mb-3 bg-white shadow-sm transition-transform group-hover:scale-105 ${isSelected ? "border-pink-400 ring-2 ring-pink-200" : "border-slate-200"
                                }`}
                            >
                              <Image
                                src={preset.url}
                                alt={preset.label}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>

                            <span className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                              {preset.label}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {preset.sublabel}
                            </p>

                            <div className="mt-3 w-full">
                              <span
                                className={`inline-block w-full py-1.5 rounded-xl text-[11px] font-semibold transition-all ${isSelected
                                    ? "bg-pink-600 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-pink-50 group-hover:text-pink-700"
                                  }`}
                              >
                                {isSelected ? "✓ เลือกรูปนี้แล้ว" : "เลือกรูปนี้"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-view: Men Cartoons (2 ลักษณะ: ผมสั้น, หยิก) */}
                {avatarCategory === "men" && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                      <span className="font-semibold text-blue-700">
                        👨‍🦱 มีให้เลือก 2 ลักษณะ: ผมสั้น • ผมหยิก
                      </span>
                      <span className="text-[11px] text-blue-500">แตะที่การ์ดเพื่อเลือก</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-3.5">
                      {CARTOON_MEN.map((preset) => {
                        const isSelected = personalForm.avatar === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setPersonalForm((prev) => ({ ...prev, avatar: preset.url }));
                              showToast(`เลือกการ์ตูน "${preset.label}" เรียบร้อย`);
                            }}
                            className={`group relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all cursor-pointer text-center bg-white ${isSelected
                                ? "border-blue-600 bg-blue-50/40 ring-4 ring-blue-600/10 shadow-md scale-[1.01]"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 hover:shadow-xs"
                              }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 bg-blue-600 text-white shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>เลือกอยู่</span>
                              </div>
                            )}

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-2.5 ${preset.tagColor}`}
                            >
                              ลักษณะ: {preset.trait}
                            </span>

                            <div
                              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 mb-3 bg-white shadow-sm transition-transform group-hover:scale-105 ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"
                                }`}
                            >
                              <Image
                                src={preset.url}
                                alt={preset.label}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>

                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {preset.label}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {preset.sublabel}
                            </p>

                            <div className="mt-3 w-full">
                              <span
                                className={`inline-block w-full py-1.5 rounded-xl text-[11px] font-semibold transition-all ${isSelected
                                    ? "bg-blue-600 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700"
                                  }`}
                              >
                                {isSelected ? "✓ เลือกรูปนี้แล้ว" : "เลือกรูปนี้"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-view: All 6 Avatars (Side-by-side) */}
                {avatarCategory === "all" && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    {/* Women Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
                          👩‍🦰 การ์ตูนผู้หญิง (ผมยาว, สั้น, ถักเปีย)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {CARTOON_WOMEN.map((preset) => {
                          const isSelected = personalForm.avatar === preset.url;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => {
                                setPersonalForm((prev) => ({ ...prev, avatar: preset.url }));
                                showToast(`เลือกการ์ตูน "${preset.label}" เรียบร้อย`);
                              }}
                              className={`group relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-white ${isSelected
                                  ? "border-pink-500 bg-pink-50/40 ring-2 ring-pink-500/20 shadow-xs"
                                  : "border-slate-200 hover:border-pink-300 hover:bg-slate-50/50"
                                }`}
                            >
                              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white">
                                <Image
                                  src={preset.url}
                                  alt={preset.label}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`inline-block px-2 py-0.2 rounded-md text-[10px] font-bold border mb-0.5 ${preset.tagColor}`}
                                >
                                  {preset.trait}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {preset.label}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {preset.sublabel}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-pink-600 stroke-[3] shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Men Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          👨‍🦱 การ์ตูนผู้ชาย (ผมสั้น, ผมหยิก)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-3">
                        {CARTOON_MEN.map((preset) => {
                          const isSelected = personalForm.avatar === preset.url;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => {
                                setPersonalForm((prev) => ({ ...prev, avatar: preset.url }));
                                showToast(`เลือกการ์ตูน "${preset.label}" เรียบร้อย`);
                              }}
                              className={`group relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-white ${isSelected
                                  ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs"
                                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/50"
                                }`}
                            >
                              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white">
                                <Image
                                  src={preset.url}
                                  alt={preset.label}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`inline-block px-2 py-0.2 rounded-md text-[10px] font-bold border mb-0.5 ${preset.tagColor}`}
                                >
                                  {preset.trait}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 truncate">
                                  {preset.label}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {preset.sublabel}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600 stroke-[3] shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-view: Custom Image & URL Upload */}
                {avatarCategory === "custom" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 animate-in fade-in duration-150">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">
                        1. อัปโหลดรูปภาพของคุณเองจากอุปกรณ์
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-2">
                        รองรับไฟล์ .jpg, .png, .webp, .svg ขนาดไม่เกิน 5 MB
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-800 mb-1">
                        2. ระบุลิงก์รูปภาพจากอินเทอร์เน็ต (Image URL)
                      </h4>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="url"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="https://example.com/my-photo.jpg"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyCustomUrl}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          นำไปใช้
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={personalForm.name}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, name: e.target.value })
                    }
                    placeholder="เช่น สมชาย สายโค้ด"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  อีเมล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={personalForm.email}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, email: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, phone: e.target.value })
                    }
                    placeholder="08X-XXX-XXXX"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  คำแนะนำตัว / อาชีพ (Bio)
                </label>
                <input
                  type="text"
                  value={personalForm.bio}
                  onChange={(e) =>
                    setPersonalForm({ ...personalForm, bio: e.target.value })
                  }
                  placeholder="เช่น Full-Stack Developer & Content Creator"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={savingPersonal}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPersonal ? "กำลังบันทึก..." : "บันทึกข้อมูลส่วนตัว"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: ที่อยู่จัดส่ง / ใบกำกับภาษี (Shipping & Billing Address - ดูและแก้ไขได้จริง) */}
      {activeTab === "address" && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("overview")}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  ที่อยู่จัดส่งและข้อมูลใบกำกับภาษี
                </h2>
                <p className="text-xs text-slate-400">
                  สำหรับออกใบเสร็จรับเงิน ใบกำกับภาษี และจัดส่งเอกสาร
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSaveAddress} className="space-y-5">
            {/* Contact Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อผู้รับ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.recipientName}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      recipientName: e.target.value,
                    })
                  }
                  placeholder="ชื่อ-นามสกุลผู้รับ"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone: e.target.value })
                  }
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Address Line */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ที่อยู่ (บ้านเลขที่, หมู่บ้าน, อาคาร, ซอย, ถนน){" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={addressForm.addressLine}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    addressLine: e.target.value,
                  })
                }
                placeholder="เช่น 123/45 อาคารสุขุมวิททาวเวอร์ ชั้น 12 ซอยสุขุมวิท 21"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 resize-none"
              />
            </div>

            {/* Subdistrict, District, Province, Postal Code */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ตำบล / แขวง
                </label>
                <input
                  type="text"
                  value={addressForm.subdistrict}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      subdistrict: e.target.value,
                    })
                  }
                  placeholder="คลองเตยเหนือ"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  อำเภอ / เขต
                </label>
                <input
                  type="text"
                  value={addressForm.district}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      district: e.target.value,
                    })
                  }
                  placeholder="วัฒนา"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  จังหวัด
                </label>
                <input
                  type="text"
                  value={addressForm.province}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      province: e.target.value,
                    })
                  }
                  placeholder="กรุงเทพมหานคร"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  value={addressForm.postalCode}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      postalCode: e.target.value,
                    })
                  }
                  placeholder="10110"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Optional Tax Invoice Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">
                  ข้อมูลสำหรับออกใบกำกับภาษี (ถ้ามี)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ชื่อบริษัท / นิติบุคคล
                  </label>
                  <input
                    type="text"
                    value={addressForm.companyName || ""}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="เช่น บริษัท ลีฟบุ๊ค คอร์ปอเรชั่น จำกัด"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    เลขประจำตัวผู้เสียภาษี (13 หลัก)
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={addressForm.taxId || ""}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        taxId: e.target.value,
                      })
                    }
                    placeholder="01055XXXXXXXX"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={savingAddress}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingAddress ? "กำลังบันทึก..." : "บันทึกที่อยู่จัดส่ง"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-12 text-center text-xs text-slate-400">
          กำลังโหลดข้อมูลโปรไฟล์...
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
