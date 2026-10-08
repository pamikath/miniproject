import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { items, successUrl, cancelUrl } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "thb",
        product_data: {
          name: item.title,
          images: item.coverImage ? [item.coverImage] : [],
        },
        unit_amount: Math.round(item.price * 100), // in satang
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/cart`,
    } as any);

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
