import { NextResponse } from "next/server";
import {
  getOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
} from "@/lib/supabase/db";
import { Order, OrderStatus } from "@/lib/types";

// GET /api/orders - ดึงรายการคำสั่งซื้อจาก Supabase
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || undefined;

    const result = await getOrdersFromSupabase(email);
    return NextResponse.json({
      success: true,
      orders: result.orders,
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

// POST /api/orders - สร้างคำสั่งซื้อใหม่ลงใน Supabase
export async function POST(req: Request) {
  try {
    const orderData: Order = await req.json();

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing order items" },
        { status: 400 }
      );
    }

    if (!orderData.id) {
      orderData.id = `ord-${Date.now()}`;
    }

    const saveResult = await saveOrderToSupabase(orderData);

    return NextResponse.json({
      success: saveResult.success,
      order: orderData,
      error: saveResult.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/orders - อัปเดตสถานะคำสั่งซื้อใน Supabase
export async function PATCH(req: Request) {
  try {
    const { orderId, status } = (await req.json()) as {
      orderId: string;
      status: OrderStatus;
    };

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const updateResult = await updateOrderStatusInSupabase(orderId, status);

    return NextResponse.json({
      success: updateResult.success,
      orderId,
      status,
      error: updateResult.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
