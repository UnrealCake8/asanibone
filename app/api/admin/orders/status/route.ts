import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/database.types";

type OrderStatus = Enums<"order_status">;

const allowed: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  "awaiting_payment","paid","finding_courier","courier_assigned","heading_to_store",
  "at_store","purchased","delivering","delivered","cancelled","failed"
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const status = body?.status as OrderStatus | undefined;

  if (!body?.orderId || !status || !allowed.has(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: String(body.orderId),
    p_status: status,
    p_note: body.note ? String(body.note) : undefined,
  });

  if (error) {
    const statusCode = error.message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json(
      { error: statusCode === 403 ? "Forbidden" : "Could not update order" },
      { status: statusCode }
    );
  }

  return NextResponse.json({ order: data });
}
