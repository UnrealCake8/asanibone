import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyNgeniusReference } from "@/lib/ngenius";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  if (authError || !auth?.claims?.sub) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const id = typeof body?.paymentId === "string" ? body.paymentId : "";
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: payment, error } = await admin.from("ngenius_special_payments")
    .select("id,user_id,status,ngenius_order_reference,amount_fils")
    .eq("id", id).eq("user_id", auth.claims.sub).maybeSingle();
  if (error || !payment) return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
  if (payment.status === "paid") return NextResponse.json({ status: "paid" });

  try {
    const result = await verifyNgeniusReference(payment.ngenius_order_reference, payment.amount_fils);
    if (!result.paid) return NextResponse.json({ status: "pending" });
    const { data: updated, error: updateError } = await admin.from("ngenius_special_payments")
      .update({ status: "paid", confirmed_at: new Date().toISOString() })
      .eq("id", payment.id).eq("status", "pending").select("id").maybeSingle();
    if (updateError) throw updateError;
    return NextResponse.json({ status: "paid", newlyConfirmed: Boolean(updated) });
  } catch {
    return NextResponse.json({ error: "Unable to verify the payment with N-Genius.", status: "unknown" }, { status: 502 });
  }
}
