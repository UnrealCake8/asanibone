"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readOrderDraft, saveOrderDraft } from "@/lib/order-draft";

export default function DeliveryPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const draft = readOrderDraft();
    queueMicrotask(() => {
      setAddress(draft.deliveryAddress || "");
      setNotes(draft.deliveryNotes || "");
      setPhone(draft.phone || "");
    });
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveOrderDraft({ deliveryAddress: address, deliveryNotes: notes, phone });
    router.push("/order/review");
  }

  return (
    <main className="app-shell request-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/order/new" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">STEP 2 OF 3</p><h1>Delivery</h1></div>
      </section>

      <form className="request-layout" onSubmit={submit}>
        <section className="form-card request-main-card">
          <label>Delivery address
            <div className="input-row"><MapPin size={18} /><input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building, street, area, emirate" /></div>
          </label>
          <label>Phone number
            <div className="input-row"><Phone size={18} /><input required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 5X XXX XXXX" /></div>
          </label>
          <label>Notes <span className="optional">Optional</span>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Apartment, landmark, gate instructions…" />
          </label>
        </section>

        <aside className="request-summary-card simple-summary">
          <p className="eyebrow">NEXT</p>
          <h2>Review and pay</h2>
          <p>Check your request, then continue to secure Ziina checkout.</p>
          <button className="primary-button" type="submit">Review <ArrowRight size={18} /></button>
        </aside>
      </form>
    </main>
  );
}
