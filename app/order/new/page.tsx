"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Link2, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateQuote } from "@/lib/pricing";
import { readOrderDraft, saveOrderDraft } from "@/lib/order-draft";

export default function NewOrderPage() {
  const router = useRouter();
  const [itemDescription, setItemDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [estimate, setEstimate] = useState(100);
  const [buffer, setBuffer] = useState(10);

  useEffect(() => {
    const draft = readOrderDraft();
    queueMicrotask(() => {
      setItemDescription(draft.itemDescription || "");
      setProductUrl(draft.productUrl || "");
      setStoreName(draft.storeName || "");
      setStoreLocation(draft.storeLocation || "");
      if (typeof draft.estimate === "number") setEstimate(draft.estimate);
      if (typeof draft.buffer === "number") setBuffer(draft.buffer);
    });
  }, []);

  const quote = useMemo(() => calculateQuote(Math.max(0, estimate + buffer)), [estimate, buffer]);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveOrderDraft({ itemDescription, productUrl, storeName, storeLocation, estimate, buffer });
    router.push("/order/delivery");
  }

  return (
    <main className="app-shell request-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">STEP 1 OF 3</p><h1>Request</h1></div>
      </section>

      <form className="request-layout" onSubmit={submit}>
        <section className="form-card request-main-card">
          <label>What do you need?
            <textarea required value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Item, size, colour, quantity…" rows={4} />
          </label>

          <label>Product link <span className="optional">Optional</span>
            <div className="input-row"><Link2 size={18} /><input type="url" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://…" /></div>
          </label>

          <div className="desktop-field-grid">
            <label>Store
              <div className="input-row"><Store size={18} /><input required value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store name" /></div>
            </label>
            <label>Branch / area
              <div className="input-row"><MapPin size={18} /><input required value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)} placeholder="Mall or area" /></div>
            </label>
          </div>

          <div className="split-grid">
            <label>Expected price
              <div className="money-input"><span>AED</span><input required min="0" step="0.01" type="number" value={estimate} onChange={(e) => setEstimate(Number(e.target.value || 0))} /></div>
            </label>
            <label>Price buffer
              <div className="money-input"><span>AED</span><input required min="0" step="0.01" type="number" value={buffer} onChange={(e) => setBuffer(Number(e.target.value || 0))} /></div>
            </label>
          </div>
        </section>

        <aside className="request-summary-card">
          <div><span>Item allowance</span><strong>AED {quote.itemAllowance.toFixed(2)}</strong></div>
          <div><span>Delivery</span><strong>AED {quote.deliveryFee.toFixed(2)}</strong></div>
          <div><span>Service fee</span><strong>AED {quote.serviceFee.toFixed(2)}</strong></div>
          <div><span>Payment fee</span><strong>AED {quote.paymentFee.toFixed(2)}</strong></div>
          <div className="summary-total"><span>Estimated maximum</span><strong>AED {quote.total.toFixed(2)}</strong></div>
          <button className="primary-button" type="submit">Continue <ArrowRight size={18} /></button>
        </aside>
      </form>
    </main>
  );
}
