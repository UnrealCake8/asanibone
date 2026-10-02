import { NextResponse } from "next/server";
import { calculateQuote } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: authError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (authError || !userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const estimate = Number(body?.estimate);
  const buffer = Number(body?.buffer);
  if (!body || !body.itemDescription || !body.storeName || !body.storeLocation || !body.deliveryAddress || !body.phone ||
      !Number.isFinite(estimate) || estimate < 0 || !Number.isFinite(buffer) || buffer < 0) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  const quote = calculateQuote(Math.round((estimate + buffer) * 100) / 100);
  const admin = createAdminClient();
  const { data, error } = await admin.from("orders").insert({
    user_id: userId,
    status: "awaiting_payment",
    item_description: String(body.itemDescription).slice(0, 2000),
    product_url: body.productUrl ? String(body.productUrl).slice(0, 2000) : null,
    store_name: String(body.storeName).slice(0, 200),
    store_location: String(body.storeLocation).slice(0, 500),
    estimated_item_price: estimate,
    price_buffer: buffer,
    item_allowance: quote.itemAllowance,
    delivery_fee: quote.deliveryFee,
    service_fee: quote.serviceFee,
    payment_fee: quote.paymentFee,
    quoted_total: quote.total,
    delivery_address: String(body.deliveryAddress).slice(0, 1000),
    delivery_notes: body.deliveryNotes ? String(body.deliveryNotes).slice(0, 1000) : null,
    phone: String(body.phone).slice(0, 50),
  }).select("id,status,quoted_total,created_at").single();

  if (error) return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  return NextResponse.json({ order: data }, { status: 201 });
}
