import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNgeniusOrder } from "@/lib/ngenius";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claims, error } = await supabase.auth.getClaims();
  if (error || !claims?.claims?.sub) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (payload?.code !== "AZLMNQ2") {
    return NextResponse.json({ error: "Invalid checkout code." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const origin = new URL(request.url).origin;

  try {
    const payment = await createNgeniusOrder({
      amount: 2000,
      email: typeof claims.claims.email === "string" ? claims.claims.email : undefined,
      description: "Asanib special checkout AZLMNQ2",
      redirectUrl: `${origin}/checkout/azlmnq2?payment=${id}&returned=1`,
      cancelUrl: `${origin}/checkout/azlmnq2?payment=${id}&cancelled=1`,
    });

    const admin = createAdminClient();
    const { error: insertError } = await admin.from("ngenius_special_payments").insert({
      id, user_id: claims.claims.sub, checkout_code: "AZLMNQ2",
      amount_fils: 2000, currency: "AED",
      ngenius_order_reference: payment.reference,
      status: "pending",
    });
    if (insertError) {
      console.error("Could not store special payment reference", insertError.code);
      return NextResponse.json({ error: "Could not track checkout. Confirm payment setup before retrying." }, { status: 503 });
    }
    return NextResponse.json({ redirectUrl: payment.redirectUrl });
  } catch {
    return NextResponse.json({ error: "Unable to open Network International checkout. Check gateway configuration." }, { status: 502 });
  }
}
