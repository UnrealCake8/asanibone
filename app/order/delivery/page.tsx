"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Phone } from "lucide-react";
import { readOrderDraft, saveOrderDraft } from "@/lib/order-draft";

export default function DeliveryPage() {
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const draft = readOrderDraft();
    setAddress(draft.deliveryAddress || "");
    setNotes(draft.deliveryNotes || "");
    setPhone(draft.phone || "");
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveOrderDraft({ deliveryAddress: address, deliveryNotes: notes, phone });
    window.location.href = "/order/review";
  }

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/order/new" aria-label="Back"><ArrowLeft size={20} /></a>
        <div><p className="eyebrow">STEP 2 OF 3</p><h1>Where to?</h1></div>
      </section>

      <form className="form-card" onSubmit={submit}>
        <label>Delivery address
          <div className="input-row"><MapPin size={18} /><input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building, street, area, emirate" /></div>
        </label>
        <label>Phone number
          <div className="input-row"><Phone size={18} /><input required inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 5X XXX XXXX" /></div>
        </label>
        <label>Delivery notes
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Apartment, landmark, gate instructions…" />
        </label>
        <button className="primary-button" type="submit">Review request <ArrowRight size={18} /></button>
      </form>
    </main>
  );
}
