import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNgeniusOrder } from "@/lib/ngenius";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: authError } = await supabase.auth.getClaims();

  if (authError || !claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";

  if (!orderId) return NextResponse.json({ error: "Order is required." }, { status: 400 });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,quoted_total,item_description,ngenius_order_reference")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== "awaiting_payment") return NextResponse.json({ error: "This order cannot be paid right now." }, { status: 409 });
  if (order.ngenius_order_reference) return NextResponse.json({ error: "A secure checkout is already open for this order." }, { status: 409 });

  const origin = new URL(request.url).origin;

  try {
    const payment = await createNgeniusOrder({
      amount: Math.round(Number(order.quoted_total) * 100),
      email: typeof claimsData.claims.email === "string" ? claimsData.claims.email : undefined,
      description: `Asanib order ${order.id.slice(0, 8)}: ${order.item_description}`,
      redirectUrl: `${origin}/payment/success?order=${encodeURIComponent(order.id)}`,
      cancelUrl: `${origin}/payment/cancel?order=${encodeURIComponent(order.id)}`,
    });

    const admin = createAdminClient();
    const { error: updateError } = await admin
      .from("orders")
      .update({ ngenius_order_reference: payment.reference })
      .eq("id", order.id);

    if (updateError) return NextResponse.json({ error: "Could not attach payment to order." }, { status: 500 });

    return NextResponse.json({ redirectUrl: payment.redirectUrl });
  } catch {
    return NextResponse.json({ error: "Could not start secure checkout." }, { status: 502 });
  }
}
