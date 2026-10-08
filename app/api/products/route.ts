import { NextResponse } from "next/server";
import {
  getProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
} from "@/lib/supabase/db";
import { Product } from "@/lib/types";

// GET /api/products - ดึงรายการสินค้าทั้งหมดจากฐานข้อมูล Supabase
export async function GET() {
  try {
    const result = await getProductsFromSupabase();
    return NextResponse.json({
      success: true,
      products: result.products,
      fromDatabase: result.fromDatabase,
      source: result.fromDatabase ? "supabase" : "initial_cache",
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - เพิ่มหรือแก้ไขสินค้าในฐานข้อมูล Supabase
export async function POST(req: Request) {
  try {
    const productData: Product = await req.json();

    if (!productData || !productData.title || !productData.price) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, price)" },
        { status: 400 }
      );
    }

    if (!productData.id) {
      productData.id = `prod-${Date.now()}`;
    }

    const saveResult = await saveProductToSupabase(productData);

    return NextResponse.json({
      success: saveResult.success,
      product: productData,
      error: saveResult.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products?id=xxx - ลบสินค้าออกจากฐานข้อมูล Supabase
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing product id parameter" },
        { status: 400 }
      );
    }

    const deleteResult = await deleteProductFromSupabase(id);

    return NextResponse.json({
      success: deleteResult.success,
      deletedId: id,
      error: deleteResult.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
