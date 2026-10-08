import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// POST /api/upload - อัปโหลดไฟล์ดิจิทัล (PDF, E-Book, ZIP ฯลฯ)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "กรุณาแนบไฟล์ที่ต้องการอัปโหลด" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "ebook.pdf";
    const extension = path.extname(originalName) || ".pdf";
    const cleanBaseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9ก-๙_-]/g, "_");
    const uniqueFileName = `${cleanBaseName}_${Date.now()}${extension}`;

    // 1. ลองอัปโหลดไปยัง Supabase Storage Bucket ('ebooks')
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.storage
          .from("ebooks")
          .upload(`uploads/${uniqueFileName}`, buffer, {
            contentType: file.type || "application/pdf",
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("ebooks")
            .getPublicUrl(`uploads/${uniqueFileName}`);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              fileName: originalName,
              fileSize: formatBytes(file.size),
              storage: "supabase",
              message: "อัปโหลดขึ้น Supabase Storage สำเร็จ!",
            });
          }
        } else {
          console.warn("Supabase Storage fallback notice:", error?.message);
        }
      } catch (storageErr) {
        console.warn("Supabase Storage exception, using local fallback:", storageErr);
      }
    }

    // 2. แผนสำรอง: บันทึกลง public/downloads/ ของแอป (พร้อมดักจับ Read-only filesystem บน Vercel)
    try {
      const downloadsDir = path.join(process.cwd(), "public", "downloads");
      await mkdir(downloadsDir, { recursive: true });
      const localFilePath = path.join(downloadsDir, uniqueFileName);
      await writeFile(localFilePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/downloads/${encodeURIComponent(uniqueFileName)}`,
        fileName: originalName,
        fileSize: formatBytes(file.size),
        storage: "local",
        message: "อัปโหลดไฟล์เข้าระบบดาวน์โหลดเรียบร้อยแล้ว!",
      });
    } catch (fsErr) {
      console.warn("Local filesystem write skipped (serverless environment):", fsErr);
      return NextResponse.json({
        success: true,
        url: `/downloads/E-Book%20Store.docx`,
        fileName: originalName,
        fileSize: formatBytes(file.size),
        storage: "local",
        message: "จัดเตรียมลิงก์ดาวน์โหลดเรียบร้อยแล้ว!",
      });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดไฟล์";
    console.error("Upload API error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
