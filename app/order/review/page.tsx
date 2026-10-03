"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearOrderDraft, readOrderDraft } from "@/lib/order-draft";
import type { OrderDraft, Quote } from "@/lib/types";

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Partial<OrderDraft>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const current = readOrderDraft();
    queueMicrotask(() => setDraft(current));

    fetch("/api/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ estimate: current.estimate, buffer: current.buffer }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not calculate quote.");
        return res.json();
      })
      .then(setQuote)
      .catch((e) => setError(e.message));
  }, []);

  async function payWithZiina() {
    setSubmitting(true);
    setError("");

    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });

    if (orderResponse.status === 401) {
      router.push("/login");
      return;
    }

    if (!orderResponse.ok) {
      const body = await orderResponse.json().catch(() => ({}));
      setError(body.error || "Could not create order.");
      setSubmitting(false);
      return;
    }

    const orderBody = await orderResponse.json();

    const paymentResponse = await fetch("/api/payments/ziina/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId: orderBody.order.id }),
    });

    if (!paymentResponse.ok) {
      const body = await paymentResponse.json().catch(() => ({}));
      setError(body.error || "Could not start payment.");
      setSubmitting(false);
      router.push("/orders");
      return;
    }

    const payment = await paymentResponse.json();
    clearOrderDraft();
    window.location.assign(payment.redirectUrl);
  }

  return (
    <main className="app-shell request-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/order/delivery" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">STEP 3 OF 3</p><h1>Review</h1></div>
      </section>

      <div className="request-layout">
        <section className="form-card review-details request-main-card">
          <div><span>Item</span><strong>{draft.itemDescription || "Not provided"}</strong></div>
          <div><span>Store</span><strong>{draft.storeName || "Not provided"}</strong></div>
          <div><span>Branch</span><strong>{draft.storeLocation || "Not provided"}</strong></div>
          <div><span>Deliver to</span><strong>{draft.deliveryAddress || "Not provided"}</strong></div>
        </section>

        <aside className="request-summary-card">
          {!quote && !error ? <div className="loading-row"><LoaderCircle className="spin" size={18} /> Calculating…</div> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {quote ? (
            <>
              <div><span>Item allowance</span><strong>AED {quote.itemAllowance.toFixed(2)}</strong></div>
              <div><span>Delivery</span><strong>AED {quote.deliveryFee.toFixed(2)}</strong></div>
              <div><span>Service fee</span><strong>AED {quote.serviceFee.toFixed(2)}</strong></div>
              <div><span>Payment fee</span><strong>AED {quote.paymentFee.toFixed(2)}</strong></div>
              <div className="summary-total"><span>Total</span><strong>AED {quote.total.toFixed(2)}</strong></div>
            </>
          ) : null}

          <div className="secure-note"><ShieldCheck size={17} /><span>Secure checkout powered by Ziina</span></div>

          <button className="primary-button" type="button" onClick={payWithZiina} disabled={!quote || submitting}>
            {submitting ? <LoaderCircle className="spin" size={18} /> : <CreditCard size={18} />}
            {submitting ? "Opening Ziina…" : "Pay with Ziina"}
          </button>
        </aside>
      </div>
    </main>
  );
}
