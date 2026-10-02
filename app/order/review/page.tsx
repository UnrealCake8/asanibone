"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { readOrderDraft } from "@/lib/order-draft";
import type { OrderDraft, Quote } from "@/lib/types";

export default function ReviewPage() {
  const [draft, setDraft] = useState<Partial<OrderDraft>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = readOrderDraft();
    setDraft(current);
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

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/order/delivery" aria-label="Back"><ArrowLeft size={20} /></a>
        <div><p className="eyebrow">STEP 3 OF 3</p><h1>Review</h1></div>
      </section>

      <section className="form-card review-details">
        <div><span>Item</span><strong>{draft.itemDescription || "Not provided"}</strong></div>
        <div><span>Store</span><strong>{draft.storeName || "Not provided"}</strong></div>
        <div><span>Branch / area</span><strong>{draft.storeLocation || "Not provided"}</strong></div>
        <div><span>Deliver to</span><strong>{draft.deliveryAddress || "Not provided"}</strong></div>
      </section>

      <section className="price-card">
        {!quote && !error && <div className="loading-row"><LoaderCircle className="spin" size={18} /> Calculating secure quote…</div>}
        {error && <p>{error}</p>}
        {quote && <>
          <div><span>Item allowance</span><strong>AED {quote.itemAllowance.toFixed(2)}</strong></div>
          <div><span>Delivery</span><strong>AED {quote.deliveryFee.toFixed(2)}</strong></div>
          <div><span>Service fee</span><strong>AED {quote.serviceFee.toFixed(2)}</strong></div>
          <div><span>Payment fee</span><strong>AED {quote.paymentFee.toFixed(2)}</strong></div>
          <div className="price-total"><span>Maximum charge</span><strong>AED {quote.total.toFixed(2)}</strong></div>
        </>}
      </section>

      <section className="notice-card"><ShieldCheck size={20} /><p>Your quote is recalculated on our server. The browser cannot choose its own service or processing fee.</p></section>

      <button className="primary-button full-width" type="button" disabled={!quote}>
        <CheckCircle2 size={18} /> Continue to secure payment
      </button>
      <p className="center-note">Ziina checkout will activate once the server API credentials are connected.</p>
    </main>
  );
}
