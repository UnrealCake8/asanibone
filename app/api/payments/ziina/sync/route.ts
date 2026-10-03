import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncZiinaPaymentStatus } from "@/lib/ziina";

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

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,status,ziina_payment_intent_id")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    const result = await syncZiinaPaymentStatus(order);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not verify payment." }, { status: 502 });
  }
}
