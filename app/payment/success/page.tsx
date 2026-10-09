import Link from "next/link";
import { CheckCircle2, Clock3, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncNgeniusPaymentStatus } from "@/lib/ngenius";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { order: orderId } = await searchParams;
  let paid = false;

  if (orderId) {
    const supabase = await createClient();
    const { data: claimsData } = await supabase.auth.getClaims();

    if (claimsData?.claims?.sub) {
      const { data: order } = await supabase
        .from("orders")
        .select("id,status,ngenius_order_reference")
        .eq("id", orderId)
        .single();

      if (order) {
        try {
          paid = (await syncNgeniusPaymentStatus(order)).orderStatus === "paid";
        } catch {
          paid = order.status === "paid";
        }
      }
    }
  }

  return (
    <main className="app-shell payment-result-shell">
      <section className="payment-result-card">
        <div className="payment-result-icon success">{paid ? <CheckCircle2 size={30} /> : <Clock3 size={30} />}</div>
        <p className="eyebrow">PAYMENT</p>
        <h1>{paid ? "Payment confirmed" : "Payment processing"}</h1>
        <p>{paid ? "Network International confirmed your payment. We are now preparing your delivery." : "We are confirming your payment with Network International."}</p>
        {orderId ? <small>Order {orderId.slice(0, 8)}</small> : null}
        <Link className="primary-button" href="/orders">View orders <ArrowRight size={18} /></Link>
      </section>
    </main>
  );
}
