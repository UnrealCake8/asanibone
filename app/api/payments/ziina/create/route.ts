import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

type ZiinaPaymentIntent = {
  id: string;
  redirect_url?: string;
  status?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: authError } = await supabase.auth.getClaims();

  if (authError || !claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";

  if (!orderId) {
    return NextResponse.json({ error: "Order is required." }, { status: 400 });
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,status,quoted_total,item_description,ziina_payment_intent_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ error: "Order is already paid." }, { status: 409 });
  }

  if (order.status !== "awaiting_payment") {
    return NextResponse.json({ error: "This order cannot be paid right now." }, { status: 409 });
  }

  const origin = new URL(request.url).origin;
  const amount = Math.round(Number(order.quoted_total) * 100);

  const ziinaResponse = await fetch(`${serverEnv.ziinaApiBaseUrl()}/api/payment_intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.ziinaApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency_code: "AED",
      message: `ASANIBONE order ${order.id.slice(0, 8)}`,
      success_url: `${origin}/payment/success?order=${encodeURIComponent(order.id)}`,
      cancel_url: `${origin}/payment/cancel?order=${encodeURIComponent(order.id)}`,
      failure_url: `${origin}/payment/failure?order=${encodeURIComponent(order.id)}`,
      test: serverEnv.ziinaTestMode(),
      expiry: String(Date.now() + 30 * 60 * 1000),
      allow_tips: false,
    }),
    cache: "no-store",
  });

  const ziinaBody = (await ziinaResponse.json().catch(() => null)) as ZiinaPaymentIntent | null;

  if (!ziinaResponse.ok || !ziinaBody?.id || !ziinaBody.redirect_url) {
    return NextResponse.json({ error: "Could not start Ziina checkout." }, { status: 502 });
  }

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("orders")
    .update({ ziina_payment_intent_id: ziinaBody.id })
    .eq("id", order.id);

  if (updateError) {
    return NextResponse.json({ error: "Could not attach payment to order." }, { status: 500 });
  }

  return NextResponse.json({
    paymentIntentId: ziinaBody.id,
    redirectUrl: ziinaBody.redirect_url,
  });
}
