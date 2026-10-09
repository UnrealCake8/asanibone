"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Link2, MapPin, Phone, Store } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { calculateQuote } from "@/lib/pricing";
import { readOrderDraft, saveOrderDraft } from "@/lib/order-draft";

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "pickup" ? "pickup" : "purchase";
  const [itemDescription, setItemDescription] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [estimate, setEstimate] = useState(100);
  const [buffer, setBuffer] = useState(10);

  useEffect(() => {
    const draft = readOrderDraft();
    queueMicrotask(() => {
      setItemDescription(draft.itemDescription || "");
      setProductUrl(draft.productUrl || "");
      setStoreName(draft.storeName || "");
      setStoreLocation(draft.storeLocation || "");
      setDeliveryAddress(draft.deliveryAddress || "");
      setPhone(draft.phone || "");
      if (typeof draft.estimate === "number") setEstimate(draft.estimate);
      if (typeof draft.buffer === "number") setBuffer(draft.buffer);
    });
  }, []);

  const quote = useMemo(() => calculateQuote(mode === "pickup" ? 0 : Math.max(0, estimate + buffer)), [mode, estimate, buffer]);

  function submit(event: FormEvent) {
    event.preventDefault();

    if (mode === "pickup") {
      saveOrderDraft({
        itemDescription,
        storeName: "Parcel pickup",
        storeLocation,
        estimate: 0,
        buffer: 0,
        deliveryAddress,
        phone,
      });
      router.push("/order/review");
      return;
    }

    saveOrderDraft({ itemDescription, productUrl, storeName, storeLocation, estimate, buffer });
    router.push("/order/delivery");
  }

  const isPickup = mode === "pickup";

  return (
    <main className="app-shell request-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">{isPickup ? "PICKUP & DELIVERY" : "PURCHASE & DELIVERY"}</p><h1>{isPickup ? "Pick up a parcel" : "Buy and deliver"}</h1></div>
      </section>

      <form className="request-layout" onSubmit={submit}>
        <section className="form-card request-main-card quick-request-form">
          <label>{isPickup ? "What should we collect?" : "What should we buy?"}
            <textarea required value={itemDescription} onChange={(event) => setItemDescription(event.target.value)} placeholder={isPickup ? "Parcel, bag, documents, or item details…" : "Item, size, colour, quantity…"} rows={3} />
          </label>

          {isPickup ? (
            <>
              <label>Collection address
                <div className="input-row"><MapPin size={18} /><input required value={storeLocation} onChange={(event) => setStoreLocation(event.target.value)} placeholder="Building, street, area, emirate" /></div>
              </label>
              <label>Deliver to
                <div className="input-row"><MapPin size={18} /><input required value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Building, street, area, emirate" /></div>
              </label>
              <label>Phone number
                <div className="input-row"><Phone size={18} /><input required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+971 5X XXX XXXX" /></div>
              </label>
            </>
          ) : (
            <>
              <label>Store
                <div className="input-row"><Store size={18} /><input required value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Store name" /></div>
              </label>
              <label>Store branch or area
                <div className="input-row"><MapPin size={18} /><input required value={storeLocation} onChange={(event) => setStoreLocation(event.target.value)} placeholder="Mall or area" /></div>
              </label>
              <label>Product link <span className="optional">Optional</span>
                <div className="input-row"><Link2 size={18} /><input type="url" value={productUrl} onChange={(event) => setProductUrl(event.target.value)} placeholder="https://…" /></div>
              </label>
              <div className="split-grid">
                <label>Expected price
                  <div className="money-input"><span>AED</span><input required min="0" step="0.01" type="number" value={estimate} onChange={(event) => setEstimate(Number(event.target.value || 0))} /></div>
                </label>
                <label>Price buffer
                  <div className="money-input"><span>AED</span><input required min="0" step="0.01" type="number" value={buffer} onChange={(event) => setBuffer(Number(event.target.value || 0))} /></div>
                </label>
              </div>
            </>
          )}
        </section>

        <aside className="request-summary-card">
          {!isPickup ? <div><span>Item allowance</span><strong>AED {quote.itemAllowance.toFixed(2)}</strong></div> : null}
          <div><span>{isPickup ? "Pickup and delivery" : "Delivery"}</span><strong>AED {quote.deliveryFee.toFixed(2)}</strong></div>
          <div><span>Service fee</span><strong>AED {quote.serviceFee.toFixed(2)}</strong></div>
          <div><span>Payment fee</span><strong>AED {quote.paymentFee.toFixed(2)}</strong></div>
          <div className="summary-total"><span>Estimated maximum</span><strong>AED {quote.total.toFixed(2)}</strong></div>
          <button className="primary-button" type="submit">{isPickup ? "Review and pay" : "Add delivery details"} <ArrowRight size={18} /></button>
        </aside>
      </form>
    </main>
  );
}
