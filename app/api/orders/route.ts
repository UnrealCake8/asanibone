import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: authError } = await supabase.auth.getClaims();

  if (authError || !claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const estimate = Number(body?.estimate);
  const buffer = Number(body?.buffer);

  if (
    !body ||
    !body.itemDescription ||
    !body.storeName ||
    !body.storeLocation ||
    !body.deliveryAddress ||
    !body.phone ||
    !Number.isFinite(estimate) ||
    estimate < 0 ||
    !Number.isFinite(buffer) ||
    buffer < 0
  ) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("create_order", {
    p_item_description: String(body.itemDescription),
    p_product_url: body.productUrl ? String(body.productUrl) : "",
    p_store_name: String(body.storeName),
    p_store_location: String(body.storeLocation),
    p_estimate: estimate,
    p_buffer: buffer,
    p_delivery_address: String(body.deliveryAddress),
    p_delivery_notes: body.deliveryNotes ? String(body.deliveryNotes) : "",
    p_phone: String(body.phone),
  });

  if (error) {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  return NextResponse.json({
    order: {
      id: data.id,
      status: data.status,
      quoted_total: data.quoted_total,
      created_at: data.created_at,
    },
  }, { status: 201 });
}
