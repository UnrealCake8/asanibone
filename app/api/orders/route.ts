import { NextResponse } from "next/server";
import { isDeliverySpeed, isEmirate } from "@/lib/delivery-pricing";
import { calculateQuote } from "@/lib/pricing";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const orderType = body?.orderType === "pickup" ? "pickup" : "purchase";

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
    buffer < 0 ||
    !isEmirate(body.pickupEmirate) ||
    !isEmirate(body.deliveryEmirate) ||
    !isDeliverySpeed(body.deliverySpeed)
  ) {
    return NextResponse.json({ error: "Choose a valid delivery option." }, { status: 400 });
  }

  let quote;
  try {
    quote = calculateQuote({
      itemAllowance: orderType === "pickup" ? 0 : Math.round((estimate + buffer) * 100) / 100,
      pickupEmirate: body.pickupEmirate,
      deliveryEmirate: body.deliveryEmirate,
      deliverySpeed: body.deliverySpeed,
      orderType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not calculate delivery.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const deliveryDetails = [
    body.deliveryNotes ? String(body.deliveryNotes) : "",
    `Service: ${body.deliverySpeed.replace("_", "-")} · ${body.pickupEmirate} to ${body.deliveryEmirate}`,
  ].filter(Boolean).join("\n");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert({
      user_id: claimsData.claims.sub,
      status: "awaiting_payment",
      item_description: String(body.itemDescription),
      product_url: body.productUrl ? String(body.productUrl) : null,
      store_name: String(body.storeName),
      store_location: String(body.storeLocation),
      estimated_item_price: orderType === "pickup" ? 0 : estimate,
      price_buffer: orderType === "pickup" ? 0 : buffer,
      item_allowance: quote.itemAllowance,
      delivery_fee: quote.deliveryFee,
      service_fee: quote.serviceFee,
      payment_fee: quote.paymentFee,
      quoted_total: quote.total,
      delivery_address: String(body.deliveryAddress),
      delivery_notes: deliveryDetails || null,
      phone: String(body.phone),
    })
    .select("id,status,quoted_total,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  await admin.from("order_events").insert({
    order_id: data.id,
    status: "awaiting_payment",
    note: "Order created",
  });

  return NextResponse.json({ order: data }, { status: 201 });
}
