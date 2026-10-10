import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

type NgeniusAccessToken = { access_token?: string };
type NgeniusOrder = {
  reference?: string;
  _links?: { payment?: { href?: string } };
  _embedded?: { payment?: Array<{ state?: string }> };
};

async function accessToken() {
  const response = await fetch(serverEnv.ngeniusIdentityUrl(), {
    method: "POST",
    headers: {
      Authorization: `Basic ${serverEnv.ngeniusApiKey()}`,
      "Content-Type": "application/vnd.ni-identity.v1+json",
    },
    body: JSON.stringify({ realmName: "networkinternational" }),
    cache: "no-store",
  });

  const body = await response.json().catch(() => null) as NgeniusAccessToken | null;
  if (!response.ok || !body?.access_token) throw new Error("Could not authenticate with Network International.");
  return body.access_token;
}

export async function createNgeniusOrder({
  amount,
  email,
  description,
  redirectUrl,
  cancelUrl,
}: {
  amount: number;
  email?: string;
  description: string;
  redirectUrl: string;
  cancelUrl: string;
}) {
  const token = await accessToken();
  const response = await fetch(
    `${serverEnv.ngeniusGatewayUrl()}/transactions/outlets/${serverEnv.ngeniusOutletId()}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.ni-payment.v2+json",
        Accept: "application/vnd.ni-payment.v2+json",
      },
      body: JSON.stringify({
        action: "PURCHASE",
        amount: { currencyCode: "AED", value: amount },
        emailAddress: email || undefined,
        language: "en",
        merchantAttributes: { redirectUrl, cancelUrl, skipConfirmationPage: true },
        orderSummary: {
          total: { currencyCode: "AED", value: amount },
          items: [{ description, quantity: 1, totalPrice: { currencyCode: "AED", value: amount } }],
        },
      }),
      cache: "no-store",
    }
  );

  const body = await response.json().catch(() => null) as NgeniusOrder | null;
  if (!response.ok || !body?.reference || !body._links?.payment?.href) {
    throw new Error("Could not start secure checkout.");
  }

  return { reference: body.reference, redirectUrl: body._links.payment.href };
}

export async function verifyNgeniusReference(reference: string, expectedAmountFils: number) {
  const token = await accessToken();
  const response = await fetch(
    `${serverEnv.ngeniusGatewayUrl()}/transactions/outlets/${encodeURIComponent(serverEnv.ngeniusOutletId())}/orders/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.ni-payment.v2+json" }, cache: "no-store" }
  );
  if (!response.ok) throw new Error("Could not retrieve N-Genius transaction.");
  const order = await response.json() as NgeniusOrder & {
    amount?: { value?: number; currencyCode?: string };
    _embedded?: { payment?: Array<{ state?: string; amount?: { value?: number; currencyCode?: string } }> };
  };
  if (order.reference && order.reference !== reference) throw new Error("Payment reference mismatch.");
  const matches = (amount?: { value?: number; currencyCode?: string }) =>
    amount?.value === expectedAmountFils && amount?.currencyCode === "AED";
  const paid = order._embedded?.payment?.some(p =>
    ["PURCHASED", "CAPTURED"].includes(p.state || "") && matches(p.amount || order.amount)
  ) === true;
  return { paid };
}

export async function syncNgeniusPaymentStatus(order: { id: string; status: string; ngenius_order_reference: string | null }) {
  if (!order.ngenius_order_reference) return { orderStatus: order.status };

  const token = await accessToken();
  const response = await fetch(
    `${serverEnv.ngeniusGatewayUrl()}/transactions/outlets/${serverEnv.ngeniusOutletId()}/orders/${encodeURIComponent(order.ngenius_order_reference)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  const body = await response.json().catch(() => null) as NgeniusOrder | null;
  if (!response.ok || !body) throw new Error("Could not verify payment.");

  const paid = body._embedded?.payment?.some((payment) =>
    ["PURCHASED", "CAPTURED", "SUCCESS"].includes(payment.state || "")
  );

  if (!paid || order.status === "paid") return { orderStatus: order.status };

  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status: "paid" }).eq("id", order.id);
  if (error) throw new Error("Could not record payment.");

  await admin.from("order_events").insert({ order_id: order.id, status: "paid", note: "Network International payment confirmed" });
  return { orderStatus: "paid" };
}
