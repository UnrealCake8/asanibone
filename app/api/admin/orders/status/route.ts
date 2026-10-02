import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowed = new Set([
  "awaiting_payment","paid","finding_courier","courier_assigned","heading_to_store",
  "at_store","purchased","delivering","delivered","cancelled","failed"
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.orderId || !allowed.has(body.status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: body.orderId,
    p_status: body.status,
    p_note: body.note ? String(body.note) : null,
  });

  if (error) {
    const status = error.message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: status === 403 ? "Forbidden" : "Could not update order" }, { status });
  }

  return NextResponse.json({ order: data });
}
