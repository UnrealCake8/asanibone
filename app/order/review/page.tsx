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
      body: JSON.stringify({
        estimate: current.estimate,
        buffer: current.buffer,
        pickupEmirate: current.pickupEmirate,
        deliveryEmirate: current.deliveryEmirate,
        deliverySpeed: current.deliverySpeed,
        orderType: current.orderType,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not calculate quote.");
        return res.json();
      })
      .then(setQuote)
      .catch((reason) => setError(reason.message));
  }, []);

  async function continueToPayment() {
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

    const { order } = await orderResponse.json();
    const paymentResponse = await fetch("/api/payments/ngenius/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });

    if (!paymentResponse.ok) {
      const body = await paymentResponse.json().catch(() => ({}));
      setError(body.error || "Could not start secure checkout.");
      setSubmitting(false);
      return;
    }

    const payment = await paymentResponse.json();
    clearOrderDraft();
    window.location.assign(payment.redirectUrl);
  }

  const deliveryLabel = draft.deliverySpeed?.replaceAll("_", "-") || "Not selected";

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
          <div><span>Delivery</span><strong>{deliveryLabel} · {draft.pickupEmirate || "—"} to {draft.deliveryEmirate || "—"}</strong></div>
          <div><span>Deliver to</span><strong>{draft.deliveryAddress || "Not provided"}</strong></div>
        </section>

        <aside className="request-summary-card">
          {!quote && !error ? <div className="loading-row"><LoaderCircle className="spin" size={18} /> Calculating…</div> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {quote ? (
            <>
              {quote.itemAllowance > 0 ? <div><span>Item allowance</span><strong>AED {quote.itemAllowance.toFixed(2)}</strong></div> : null}
              <div><span>Delivery</span><strong>AED {quote.deliveryFee.toFixed(2)}</strong></div>
              {quote.serviceFee > 0 ? <div><span>Shopping service</span><strong>AED {quote.serviceFee.toFixed(2)}</strong></div> : null}
              <div className="summary-total"><span>Maximum today</span><strong>AED {quote.total.toFixed(2)}</strong></div>
              {quote.itemAllowance > 0 ? <p className="quote-explainer">Your item allowance covers the estimated item price. We will confirm any adjustment with you.</p> : null}
            </>
          ) : null}

          <div className="secure-note"><ShieldCheck size={17} /><span>Secure checkout powered by Network International</span></div>

          <button className="primary-button" type="button" onClick={continueToPayment} disabled={!quote || submitting}>
            {submitting ? <LoaderCircle className="spin" size={18} /> : <CreditCard size={18} />}
            {submitting ? "Opening secure checkout…" : "Continue to secure payment"}
          </button>
        </aside>
      </div>
    </main>
  );
}
