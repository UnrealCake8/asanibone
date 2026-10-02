"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Link2, MapPin, Store } from "lucide-react";
import { calculateQuote, DEFAULT_DELIVERY_FEE, DEFAULT_SERVICE_FEE } from "@/lib/pricing";
import { readOrderDraft, saveOrderDraft } from "@/lib/order-draft";

export default function NewOrderPage() {
  const [itemDescription, setItemDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [estimate, setEstimate] = useState(100);
  const [buffer, setBuffer] = useState(10);

  useEffect(() => {
    const draft = readOrderDraft();
    setItemDescription(draft.itemDescription || "");
    setProductUrl(draft.productUrl || "");
    setStoreName(draft.storeName || "");
    setStoreLocation(draft.storeLocation || "");
    if (typeof draft.estimate === "number") setEstimate(draft.estimate);
    if (typeof draft.buffer === "number") setBuffer(draft.buffer);
  }, []);

  const pricing = useMemo(() => calculateQuote(Math.max(0, estimate + buffer)), [estimate, buffer]);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveOrderDraft({ itemDescription, productUrl, storeName, storeLocation, estimate, buffer });
    window.location.href = "/order/delivery";
  }

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div><p className="eyebrow">STEP 1 OF 3</p><h1>What should we get?</h1></div>
      </section>

      <form onSubmit={submit}>
        <section className="form-card">
          <label>Item
            <textarea required value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Describe the exact item, size, colour, quantity, etc." rows={4} />
          </label>

          <label>Product link <span className="optional">Optional</span>
            <div className="input-row"><Link2 size={18} /><input type="url" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://…" /></div>
          </label>

          <div className="inline-actions"><button type="button"><Camera size={18} /> Photo upload coming next</button></div>

          <label>Store
            <div className="input-row"><Store size={18} /><input required value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store name" /></div>
          </label>

          <label>Store location
            <div className="input-row"><MapPin size={18} /><input required value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)} placeholder="Mall, branch or area" /></div>
          </label>

          <div className="split-grid">
            <label>Expected item price
              <div className="money-input"><span>AED</span><input required min="0" step="0.01" type="number" value={estimate} onChange={(e) => setEstimate(Number(e.target.value || 0))} /></div>
            </label>
            <label>Price buffer
              <div className="money-input"><span>AED</span><input required min="0" step="0.01" type="number" value={buffer} onChange={(e) => setBuffer(Number(e.target.value || 0))} /></div>
            </label>
          </div>
        </section>

        <section className="price-card">
          <div><span>Item allowance</span><strong>AED {pricing.itemAllowance.toFixed(2)}</strong></div>
          <div><span>Delivery</span><strong>AED {DEFAULT_DELIVERY_FEE.toFixed(2)}</strong></div>
          <div><span>Service fee</span><strong>AED {DEFAULT_SERVICE_FEE.toFixed(2)}</strong></div>
          <div><span>Estimated payment fee</span><strong>AED {pricing.paymentFee.toFixed(2)}</strong></div>
          <div className="price-total"><span>Estimated maximum</span><strong>AED {pricing.total.toFixed(2)}</strong></div>
          <p>The final quote is recalculated securely on our server before payment.</p>
        </section>

        <button className="primary-button full-width" type="submit">Continue to delivery <ArrowRight size={18} /></button>
      </form>
    </main>
  );
}
