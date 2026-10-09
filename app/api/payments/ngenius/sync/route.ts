import { NextResponse } from "next/server";
import { syncNgeniusPaymentStatus } from "@/lib/ngenius";
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

  const { data: order, error } = await supabase
    .from("orders")
    .select("id,status,ngenius_order_reference")
    .eq("id", orderId)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  try {
    return NextResponse.json(await syncNgeniusPaymentStatus(order));
  } catch {
    return NextResponse.json({ error: "Could not verify payment." }, { status: 502 });
  }
}
