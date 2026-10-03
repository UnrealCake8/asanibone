import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

type ZiinaWebhook = {
  event?: string;
  data?: {
    id?: string;
    status?: string;
  };
};

function validSignature(raw: string, received: string | null) {
  if (!received) return false;

  const expected = createHmac("sha256", serverEnv.ziinaWebhookSecret())
    .update(raw)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-hmac-signature");

  if (!validSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(raw) as ZiinaWebhook;

  if (payload.event !== "payment_intent.status.updated") {
    return NextResponse.json({ ok: true });
  }

  const paymentIntentId = payload.data?.id;
  const paymentStatus = payload.data?.status;

  if (!paymentIntentId || !paymentStatus) {
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id,status")
    .eq("ziina_payment_intent_id", paymentIntentId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ ok: true });
  }

  if (paymentStatus === "completed" && order.status !== "paid") {
    const { error: updateError } = await admin
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: "Could not update payment status." }, { status: 500 });
    }

    await admin.from("order_events").insert({
      order_id: order.id,
      status: "paid",
      note: "Ziina payment completed",
    });
  }

  return NextResponse.json({ ok: true });
}
