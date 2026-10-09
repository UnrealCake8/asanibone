import { NextResponse } from "next/server";
import { isDeliverySpeed, isEmirate } from "@/lib/delivery-pricing";
import { calculateQuote } from "@/lib/pricing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const estimate = Number(body?.estimate);
  const buffer = Number(body?.buffer);
  const orderType = body?.orderType === "pickup" ? "pickup" : "purchase";

  if (
    !Number.isFinite(estimate) ||
    estimate < 0 ||
    !Number.isFinite(buffer) ||
    buffer < 0 ||
    !isEmirate(body?.pickupEmirate) ||
    !isEmirate(body?.deliveryEmirate) ||
    !isDeliverySpeed(body?.deliverySpeed)
  ) {
    return NextResponse.json({ error: "Choose a valid delivery option." }, { status: 400 });
  }

  try {
    return NextResponse.json(calculateQuote({
      itemAllowance: orderType === "pickup" ? 0 : Math.round((estimate + buffer) * 100) / 100,
      pickupEmirate: body.pickupEmirate,
      deliveryEmirate: body.deliveryEmirate,
      deliverySpeed: body.deliverySpeed,
      orderType,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not calculate delivery.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
