import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import type { Tables } from "@/lib/database.types";

type OrderForPaymentSync = Pick<
  Tables<"orders">,
  "id" | "status" | "ziina_payment_intent_id"
>;

type ZiinaPaymentIntent = {
  id: string;
  status:
    | "requires_payment_instrument"
    | "pending"
    | "requires_user_action"
    | "completed"
    | "failed";
  latest_error?: unknown;
};

export async function getZiinaPaymentIntent(id: string) {
  const response = await fetch(
    `${serverEnv.ziinaApiBaseUrl()}/api/payment_intent/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${serverEnv.ziinaApiKey()}`,
      },
      cache: "no-store",
    }
  );

  const body = (await response.json().catch(() => null)) as ZiinaPaymentIntent | null;

  if (!response.ok || !body?.id || !body.status) {
    throw new Error("Could not verify Ziina payment.");
  }

  return body;
}

export async function syncZiinaPaymentStatus(order: OrderForPaymentSync) {
  if (!order.ziina_payment_intent_id) {
    return { orderStatus: order.status, paymentStatus: null };
  }

  const payment = await getZiinaPaymentIntent(order.ziina_payment_intent_id);

  if (payment.status !== "completed" || order.status === "paid") {
    return { orderStatus: order.status, paymentStatus: payment.status };
  }

  const admin = createAdminClient();

  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id)
    .neq("status", "paid")
    .select("id")
    .maybeSingle();

  if (updateError) {
    throw new Error("Could not update paid order.");
  }

  if (updated) {
    await admin.from("order_events").insert({
      order_id: order.id,
      status: "paid",
      note: "Ziina payment verified",
    });
  }

  return { orderStatus: "paid" as const, paymentStatus: payment.status };
}
