import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Props = {
  searchParams: Promise<{ order?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <main className="app-shell payment-result-shell">
      <section className="payment-result-card">
        <div className="payment-result-icon success"><CheckCircle2 size={30} /></div>
        <p className="eyebrow">PAYMENT</p>
        <h1>Payment received</h1>
        <p>Ziina is confirming the payment. Your order will move to paid as soon as the signed webhook arrives.</p>
        {order ? <small>Order {order.slice(0, 8)}</small> : null}
        <Link className="primary-button" href="/orders">View orders <ArrowRight size={18} /></Link>
      </section>
    </main>
  );
}
