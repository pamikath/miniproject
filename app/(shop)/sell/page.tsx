"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  PlusCircle,
  Package,
  FileCode,
  Sparkles,
  CheckCircle2,
  Trash2,
  Eye,
  Store,
  Layers,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  BookOpen,
  CloudUpload,
  FileCheck,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useShop } from "@/context/ShopContext";
import { ProductCategory, ProductTag, Product } from "@/lib/types";

const CATEGORIES: { id: ProductCategory; label: string; icon: string; desc: string }[] = [
  { id: "ebook", label: "E-Book", icon: "📚", desc: "หนังสือดิจิทัล คู่มือ เอกสารการเรียนรู้ (PDF, EPUB)" },
  { id: "software", label: "ซอฟต์แวร์ & โค้ด", icon: "💻", desc: "Source code, แอปพลิเคชัน, สคริปต์" },
  { id: "template", label: "เทมเพลต", icon: "📋", desc: "UI kit, แบบฟอร์ม, Sheet สำเร็จรูป" },
  { id: "course", label: "คอร์สออนไลน์", icon: "🎓", desc: "บทเรียน วิดีโอสอน เวิร์กช็อป" },
  { id: "graphics", label: "กราฟิก & 3D", icon: "🎨", desc: "ไอคอน ภาพประกอบ โมเดล 3D" },
  { id: "other", label: "อื่นๆ", icon: "📦", desc: "ไฟล์ดิจิทัลประเภทอื่นๆ" },
];

const PRESET_COVERS = [
  { label: "E-Book & Guide", url: "/covers/ebook-store-guide-cover.jpg" },
  { label: "Code & Software", url: "/covers/taskmanager-code-cover.jpg" },
  { label: "Media Player", url: "/covers/media-player-code-cover.jpg" },
  { label: "Bundle & Project", url: "/covers/gas-bundle-cover.jpg" },
  { label: "Design & Creative", url: "/covers/ui-digital-shop.png" },
];

const AVAILABLE_TAGS: { id: ProductTag; label: string }[] = [
  { id: "new", label: "สินค้าใหม่" },
  { id: "recommended", label: "แนะนำ" },
  { id: "bestseller", label: "ขายดี" },
];

const PRESET_SAMPLE_EBOOKS = [
  {
    title: "คู่มือพัฒนา Fullstack Next.js & Supabase 2026",
    fileName: "Nextjs-Supabase-Mastery.pdf",
    fileSize: "3.4 MB",
    fileType: "PDF (E-Book)",
    downloadUrl: "/downloads/E-Book%20Store.docx",
    category: "ebook" as ProductCategory,
    cover: "/covers/ebook-store-guide-cover.jpg",
    price: 249,
    originalPrice: 490,
    desc: "คู่มือฉบับสมบูรณ์สำหรับการพัฒนาระบบ Web App และ API ด้วย Next.js 15, Tailwind CSS และฐานข้อมูล Supabase Cloud",
  },
  {
    title: "AI Prompt Mastery: เทคนิคเขียนคำสั่ง AI ระดับมือโปร",
    fileName: "AI-Prompt-Mastery-Guide.pdf",
    fileSize: "2.8 MB",
    fileType: "PDF (E-Book)",
    downloadUrl: "/downloads/E-Book%20Store.docx",
    category: "ebook" as ProductCategory,
    cover: "/covers/ui-digital-shop.png",
    price: 189,
    originalPrice: 350,
    desc: "รวม 100+ สูตรคำสั่ง AI พร้อมใช้งาน ช่วยเพิ่มประสิทธิภาพการทำงานและเขียนโค้ดเร็วขึ้น 10 เท่า",
  },
];

export default function SellPage() {
  const router = useRouter();
  const { user, isLoggedIn, addProduct, deleteProduct, products, showToast } = useShop();

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStorageType, setUploadStorageType] = useState<"supabase" | "local" | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("ebook");
  const [tags, setTags] = useState<ProductTag[]>(["new"]);
  const [price, setPrice] = useState<number>(199);
  const [originalPrice, setOriginalPrice] = useState<number>(390);
  const [coverImage, setCoverImage] = useState<string>("/covers/ebook-store-guide-cover.jpg");
  const [fileType, setFileType] = useState("PDF (E-Book)");
  const [fileSize, setFileSize] = useState("0 MB");
  const [fileName, setFileName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([
    "ดาวน์โหลดไฟล์ E-Book (PDF) ได้ทันทีหลังสั่งซื้อ",
    "สามารถเปิดอ่านได้ทุกอุปกรณ์ (มือถือ แท็บเล็ต คอมพิวเตอร์)",
    "ลิขสิทธิ์ถูกต้อง อัปเดตเนื้อหาฟรีตลอดชีพ",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Filter products published by the current user
  const myProducts = products.filter(
    (p) =>
      (user?.email && (p.sellerEmail === user.email || (p.author && p.author.includes(user.email)))) ||
      (user?.name && p.author && p.author.includes(user.name))
  );

  const handleToggleTag = (tag: ProductTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload handler calling /api/upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      showToast("⚠️ ขนาดไฟล์ใหญ่เกินกำหนด (จำกัดไม่เกิน 80 MB)");
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      }

      // Update form values with uploaded file info
      setFileName(data.fileName);
      setFileSize(data.fileSize);
      setDownloadUrl(data.url);
      setUploadStorageType(data.storage);

      const ext = (file.name.split(".").pop() || "").toUpperCase();
      if (ext === "PDF") {
        setFileType("PDF (E-Book)");
        setCategory("ebook");
      } else if (["EPUB", "MOBI"].includes(ext)) {
        setFileType(`${ext} (E-Book)`);
        setCategory("ebook");
      } else if (["ZIP", "RAR", "7Z"].includes(ext)) {
        setFileType("ZIP (Archive)");
      } else if (["DOCX", "DOC"].includes(ext)) {
        setFileType("DOCX (Document)");
      } else {
        setFileType(ext);
      }

      // Auto-populate title if empty
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }

      showToast(`📂 อัปโหลดไฟล์ "${data.fileName}" สำเร็จ! (${data.storage === "supabase" ? "Supabase Storage" : "Local Server"})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด";
      console.error("Upload error:", err);
      setUploadError(msg);
      showToast(`❌ เกิดข้อผิดพลาดในการอัปโหลด: ${msg}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyPresetEbook = (preset: typeof PRESET_SAMPLE_EBOOKS[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setFileName(preset.fileName);
    setFileSize(preset.fileSize);
    setFileType(preset.fileType);
    setDownloadUrl(preset.downloadUrl);
    setCategory(preset.category);
    setCoverImage(preset.cover);
    setPrice(preset.price);
    setOriginalPrice(preset.originalPrice);
    setUploadStorageType("local");
    setUploadError(null);
    showToast(`✨ โหลดข้อมูลตัวอย่าง "${preset.title}" เรียบร้อยแล้ว`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      showToast("กรุณาเข้าสู่ระบบก่อนลงขายสินค้า");
      router.push("/login");
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast("กรุณากรอกชื่อสินค้าและคำอธิบายให้ครบถ้วน");
      return;
    }

    if (price <= 0) {
      showToast("กรุณาระบุราคาสินค้าที่มากกว่า 0 บาท");
      return;
    }

    // Default download fallback if user didn't upload
    const finalFileName = fileName.trim() || `${title.trim().slice(0, 20)}.pdf`;
    const finalDownloadUrl = downloadUrl.trim() || `/downloads/${finalFileName}`;
    const finalFileSize = fileSize.trim() && fileSize !== "0 MB" ? fileSize.trim() : "2.5 MB";

    setIsSubmitting(true);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙]+/g, "-")
      .replace(/^-|-$/g, "");

    const newProduct: Omit<Product, "id"> = {
      title: title.trim(),
      slug: slug || `product-${Date.now()}`,
      description: description.trim(),
      category,
      tags,
      price: Number(price),
      originalPrice: originalPrice > price ? Number(originalPrice) : undefined,
      coverImage: coverImage.trim() || "/covers/default.png",
      rating: 5.0,
      reviewCount: 0,
      fileType: fileType.trim() || "PDF",
      fileSize: finalFileSize,
      fileName: finalFileName,
      downloadFileUrl: finalDownloadUrl,
      author: user?.name || "LeafBook Creator",
      sellerEmail: user?.email || undefined,
      features: features.length > 0 ? features : ["ดาวน์โหลดได้ทันที", "ลิขสิทธิ์ถูกต้อง"],
    };

    try {
      // Save product to shop context and Supabase database
      const res = await addProduct(newProduct);

      if (res && !res.success) {
        showToast(`❌ เกิดข้อผิดพลาดในการบันทึก: ${res.error || "ไม่สามารถบันทึกลง Supabase ได้"}`);
        setIsSubmitting(false);
        return;
      }

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      setSubmittedSuccess(true);
      showToast(`🎉 ลงขายสินค้า "${title}" สำเร็จแล้ว! บันทึกลง Supabase เรียบร้อย`);

      // Reset form
      setTitle("");
      setDescription("");
      setPrice(199);
      setOriginalPrice(390);
      setFileName("");
      setFileSize("0 MB");
      setDownloadUrl("");
      setUploadStorageType(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกสินค้า";
      showToast(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not logged in view
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20">
          <Store className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            Creator Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
            ลงขายสินค้าดิจิทัลและ E-Book บน LeafBook
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            เปลี่ยนผลงาน E-Book (PDF), ซอร์สโค้ด, เทมเพลต และคอร์สเรียนของคุณให้เป็นรายได้ ข้อมูลบันทึกลง Supabase Cloud พร้อมระบบอัปโหลดไฟล์ในตัว
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto space-y-4">
          <div className="space-y-2 text-left text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>อัปโหลดไฟล์ PDF / E-Book ตรงเข้าระบบจัดเก็บทันที</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>เชื่อมต่อฐานข้อมูลคลาวด์ Supabase แบบเรียลไทม์ 100%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ระบบจัดส่งและดาวน์โหลดไฟล์อัตโนมัติหลังการชำระเงิน</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors text-center"
            >
              เข้าสู่ระบบเพื่อเริ่มขาย
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-center"
            >
              สมัครสมาชิกฟรี
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-600/15">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>LeafBook Creator Studio • Supabase Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ลงขายสินค้าดิจิทัล & อัปโหลด E-Book (PDF)
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            ผู้ใช้งานทุกคนสามารถลงขาย E-Book (PDF), ซอร์สโค้ด, เทมเพลต ได้ทันที อัปโหลดไฟล์ตรงเข้าสู่ระบบและบันทึกข้อมูลเข้า Supabase Database อัตโนมัติ
          </p>
        </div>

        {/* Current Seller Profile Chip */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-3 self-start md:self-auto shrink-0">
          <Image
            src={user.avatar || "/covers/default.png"}
            alt={user.name}
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover border-2 border-white/80"
          />
          <div className="text-left text-xs">
            <span className="text-[10px] text-blue-200 block uppercase font-bold tracking-wider">
              ผู้ลงขาย (Seller)
            </span>
            <strong className="text-sm font-bold text-white block">
              {user.name}
            </strong>
            <span className="text-[11px] text-blue-100">
              {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submittedSuccess && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                ลงขายและบันทึกลงฐานข้อมูล Supabase สำเร็จเรียบร้อย!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                สินค้าของคุณพร้อมแสดงบนหน้าร้านค้า และสามารถดาวน์โหลดไฟล์ได้ทันทีหลังสั่งซื้อ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedSuccess(false)}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ข้อมูลสินค้าดิจิทัลและไฟล์ E-Book
                </h2>
                <p className="text-xs text-slate-500">
                  กรอกรายละเอียดและอัปโหลดไฟล์ PDF สำหรับผู้ซื้อ
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Connected</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ============================================================ */}
            {/* SECTION: UPLOAD PDF / E-BOOK FILE (PRIMARY FEATURE) */}
            {/* ============================================================ */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 border-2 border-dashed border-indigo-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      อัปโหลดไฟล์ PDF / E-Book สำหรับผู้ซื้อ
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ระบบจะสร้างลิงก์ดาวน์โหลดที่ปลอดภัยและบันทึกข้อมูลเข้าฐานข้อมูล
                    </p>
                  </div>
                </div>

                {uploadStorageType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 shadow-2xs">
                    {uploadStorageType === "supabase" ? "☁️ Supabase Cloud" : "💻 Storage Server"}
                  </span>
                )}
              </div>

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                  <span>⚠️ {uploadError}</span>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.epub,.mobi,.docx,.zip,.rar"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Drop Area */}
              {!downloadUrl && !isUploadingFile && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    isDragOver
                      ? "border-blue-500 bg-blue-100/50 scale-[1.01]"
                      : "border-indigo-300/70 bg-white/80 hover:bg-white hover:border-indigo-400 hover:shadow-xs"
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-2.5">
                    <CloudUpload className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ PDF / E-Book มาวางที่นี่
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    รองรับไฟล์ <strong>.PDF, .EPUB, .DOCX, .ZIP</strong> (ขนาดไม่เกิน 80 MB)
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>เลือกไฟล์จากเครื่อง (Browse PDF)</span>
                  </button>
                </div>
              )}

              {/* Loading upload spinner */}
              {isUploadingFile && (
                <div className="p-6 rounded-xl bg-white border border-indigo-200 text-center space-y-3">
                  <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      กำลังอัปโหลดไฟล์เข้าระบบจัดเก็บ...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      กรุณารอสักครู่ ระบบกำลังจัดเตรียมลิงก์ดาวน์โหลดและคำนวณขนาดไฟล์
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Success Badge Card */}
              {downloadUrl && !isUploadingFile && (
                <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {fileName || "ebook-file.pdf"}
                          </strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {fileType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ขนาดไฟล์: <strong className="text-slate-700">{fileSize}</strong> • จัดเก็บบน{" "}
                          <span className="text-indigo-600 font-semibold">
                            {uploadStorageType === "supabase" ? "Supabase Storage (Cloud)" : "Local Downloads"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors cursor-pointer"
                        title="เปลี่ยนไฟล์ใหม่"
                      >
                        เปลี่ยนไฟล์
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDownloadUrl("");
                          setFileName("");
                          setFileSize("0 MB");
                          setUploadStorageType(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ยกเลิกไฟล์นี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Test Download link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>พร้อมสำหรับให้ผู้ซื้อดาวน์โหลดทันทีหลังสั่งซื้อ</span>
                    </span>
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>ทดสอบดาวน์โหลด</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Sample Preset E-Books for Instant Testing */}
              <div className="pt-2 border-t border-indigo-100/60">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  หรือคลิกเลือกไฟล์ E-Book ตัวอย่าง (สำหรับทดสอบทันที):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_SAMPLE_EBOOKS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPresetEbook(preset)}
                      className="p-2.5 rounded-xl bg-white/90 hover:bg-white border border-indigo-100 text-left transition-all hover:shadow-xs group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">📘</span>
                        <div className="min-w-0">
                          <strong className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-blue-600">
                            {preset.title}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            {preset.fileName} ({preset.fileSize})
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 1. ชื่อสินค้า */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อสินค้าดิจิทัล / ชื่อหนังสือ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น คู่มือการเขียน AI Prompt หรือ หนังสือเรียนรู้ Next.js"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
              />
            </div>

            {/* 2. หมวดหมู่สินค้า */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                หมวดหมู่สินค้า <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      category === cat.id
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                        : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* แท็กสินค้า */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                แท็กสินค้า (เลือกได้หลายแท็ก)
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVAILABLE_TAGS.map((tagItem) => {
                  const isSelected = tags.includes(tagItem.id);
                  return (
                    <button
                      key={tagItem.id}
                      type="button"
                      onClick={() => handleToggleTag(tagItem.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {tagItem.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. ราคาจำหน่าย & ราคาเดิม */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ราคาขายจริง (บาท) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ราคาเต็มก่อนลด (บาท) <span className="text-slate-400 font-normal">(ถ้ามี)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* 4. คำอธิบายสินค้า */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                คำอธิบายสินค้า <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุสิ่งที่ผู้ซื้อจะได้รับ วิธีใช้งาน จุดเด่นของโปรเจกต์ หรือข้อกำหนดต่างๆ..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
              />
            </div>

            {/* 5. จุดเด่น / Features */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                จุดเด่นของผลงาน (Bullet Points)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="พิมพ์จุดเด่นแล้วกดปุ่มเพิ่ม..."
                    className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    เพิ่ม
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs border border-slate-200"
                    >
                      <span>✓ {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. รูปภาพหน้าปกสินค้า */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รูปภาพหน้าปกสินค้า (URL หรือเลือกภาพสำเร็จรูป)
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.jpg หรือ /covers/..."
                className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 mb-2"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">ภาพสำเร็จรูป:</span>
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      coverImage === preset.url
                        ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. ข้อมูลไฟล์ดิจิทัลที่ดาวน์โหลด (สรุปและแก้ไข) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>สรุปข้อมูลไฟล์ดาวน์โหลด (ปรับแก้ได้)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ประเภทไฟล์
                  </label>
                  <input
                    type="text"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    placeholder="PDF, ZIP, DOCX"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ขนาดไฟล์
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="15 MB"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ชื่อไฟล์เมื่อดาวน์โหลด
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="my-ebook.pdf"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingFile}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกข้อมูลเข้า Supabase...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>ลงขายสินค้าทันที (Publish to Supabase)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>ข้อมูลจะถูกเชื่อมต่อและจัดเก็บลงฐานข้อมูล Supabase โดยตรง</span>
              </p>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>ตัวอย่างแสดงผลหน้าร้าน (Live Preview)</span>
              </span>
              <span className="text-[10px] text-slate-400">ตามเวลาจริง</span>
            </div>

            {/* Card Preview matching the shop card */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-md max-w-sm mx-auto group">
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={coverImage || "/covers/default.png"}
                  alt={title || "Preview"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  {CATEGORIES.find((c) => c.id === category)?.label || category}
                </span>
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold">
                  {fileType}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>ผู้สร้าง:</span>
                  <strong className="text-slate-700">{user.name}</strong>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {title || "ชื่อสินค้าของคุณจะแสดงตรงนี้"}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {description || "คำอธิบายสินค้า ประโยชน์ จุดเด่น ฟีเจอร์ที่ผู้ซื้อจะได้รับ..."}
                </p>

                <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100">
                  <span className="text-lg font-extrabold text-blue-600">
                    ฿{Number(price).toLocaleString()}
                  </span>
                  {originalPrice > price && (
                    <span className="text-xs text-slate-400 line-through">
                      ฿{Number(originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My Published Products Summary */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  สินค้าที่คุณลงขาย ({myProducts.length})
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>ดูหน้าร้าน</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                <Package className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p>คุณยังไม่ได้ลงขายสินค้าใดๆ</p>
                <p className="text-[11px] text-slate-400">กรอกแบบฟอร์มด้านข้างเพื่อเริ่มขายได้เลย!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {myProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                        <Image
                          src={prod.coverImage || "/covers/default.png"}
                          alt={prod.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">
                          {prod.title}
                        </h4>
                        <span className="text-[11px] text-blue-600 font-bold">
                          ฿{prod.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/products/${prod.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white"
                        title="ดูหน้ารายละเอียด"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`คุณต้องการลบสินค้า "${prod.title}" ใช่หรือไม่?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white cursor-pointer"
                        title="ลบสินค้า"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
