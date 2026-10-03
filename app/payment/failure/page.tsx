import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <main className="app-shell payment-result-shell">
      <section className="payment-result-card">
        <div className="payment-result-icon"><XCircle size={30} /></div>
        <p className="eyebrow">PAYMENT</p>
        <h1>Payment not completed</h1>
        <p>Your order is still waiting for payment. You can return to Orders and try again.</p>
        <Link className="primary-button secondary-button" href="/orders"><ArrowLeft size={18} /> Back to orders</Link>
      </section>
    </main>
  );
}
