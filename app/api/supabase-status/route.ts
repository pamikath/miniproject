import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, SUPABASE_URL } from "@/lib/supabase/client";

// GET /api/supabase-status - ตรวจสอบสถานะการเชื่อมต่อ Supabase
export async function GET() {
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      status: "unconfigured",
      message: "ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY",
      supabaseUrl: SUPABASE_URL,
    });
  }

  try {
    // Ping Supabase products table
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({
        configured: true,
        connected: false,
        status: "table_error",
        message: `เชื่อมต่อกับ Supabase (${SUPABASE_URL}) สำเร็จ แต่ตาราง 'products' ยังไม่ถูกสร้างหรือติดสิทธิ์ RLS: ${error.message}`,
        error: error.message,
        supabaseUrl: SUPABASE_URL,
      });
    }

    return NextResponse.json({
      configured: true,
      connected: true,
      status: "connected",
      message: `เชื่อมต่อกับฐานข้อมูล Supabase (${SUPABASE_URL}) สำเร็จเรียบร้อยแล้ว!`,
      productCount: count ?? 0,
      supabaseUrl: SUPABASE_URL,
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      connected: false,
      status: "network_error",
      message: `ไม่สามารถเชื่อมต่อ Supabase: ${err.message}`,
      error: err.message,
      supabaseUrl: SUPABASE_URL,
    });
  }
}
