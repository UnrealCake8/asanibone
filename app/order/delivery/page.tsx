"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EMIRATES, getDeliveryOptions, isSameDayAvailable, type DeliverySpeed, type Emirate } from "@/lib/delivery-pricing";
import { readOrderDraft, saveOrderDraft } from "@/lib/order-draft";

const defaultEmirate: Emirate = "Dubai";

export default function DeliveryPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupEmirate, setPickupEmirate] = useState<Emirate>(defaultEmirate);
  const [deliveryEmirate, setDeliveryEmirate] = useState<Emirate>(defaultEmirate);
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>("same_day");
  const [orderType, setOrderType] = useState<"purchase" | "pickup">("purchase");

  const options = useMemo(
    () => getDeliveryOptions(pickupEmirate, deliveryEmirate),
    [pickupEmirate, deliveryEmirate]
  );

  useEffect(() => {
    const draft = readOrderDraft();
    queueMicrotask(() => {
      setAddress(draft.deliveryAddress || "");
      setNotes(draft.deliveryNotes || "");
      setPhone(draft.phone || "");
      setPickupEmirate(draft.pickupEmirate || defaultEmirate);
      setDeliveryEmirate(draft.deliveryEmirate || defaultEmirate);
      setOrderType(draft.orderType || "purchase");
      setDeliverySpeed(draft.deliverySpeed || (isSameDayAvailable() ? "same_day" : "next_day"));
    });
  }, []);

  useEffect(() => {
    if (!options.some((option) => option.speed === deliverySpeed)) {
      setDeliverySpeed(options[0]?.speed || "next_day");
    }
  }, [deliverySpeed, options]);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveOrderDraft({
      deliveryAddress: address,
      deliveryNotes: notes,
      phone,
      pickupEmirate,
      deliveryEmirate,
      deliverySpeed,
      orderType,
    });
    router.push("/order/review");
  }

  const sameDayOpen = isSameDayAvailable();

  return (
    <main className="app-shell request-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/order/new" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">STEP 2 OF 3</p><h1>Delivery</h1></div>
      </section>

      <form className="request-layout" onSubmit={submit}>
        <section className="form-card request-main-card">
          <div className="split-grid">
            <label>Collection emirate
              <select value={pickupEmirate} onChange={(event) => setPickupEmirate(event.target.value as Emirate)}>
                {EMIRATES.map((emirate) => <option key={emirate} value={emirate}>{emirate}</option>)}
              </select>
            </label>
            <label>Delivery emirate
              <select value={deliveryEmirate} onChange={(event) => setDeliveryEmirate(event.target.value as Emirate)}>
                {EMIRATES.map((emirate) => <option key={emirate} value={emirate}>{emirate}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="delivery-speed-picker">
            <legend>Choose delivery speed</legend>
            {!sameDayOpen ? <p className="cutoff-note"><Clock3 size={16} /> Same-day orders close at 9:00 PM. Next-day delivery is available.</p> : null}
            <div className="delivery-speed-list">
              {options.length === 0 ? <p className="form-error">Regular same-day slots are closed. Please contact us for an after-hours delivery.</p> : null}\n              {options.map((option) => (
                <label className={deliverySpeed === option.speed ? "delivery-speed-option selected" : "delivery-speed-option"} key={option.speed}>
                  <input type="radio" name="delivery-speed" value={option.speed} checked={deliverySpeed === option.speed} onChange={() => setDeliverySpeed(option.speed)} />
                  <span><strong>{option.label}</strong><small>{option.timeframe}</small></span>
                  <b>AED {option.deliveryFee}</b>
                </label>
              ))}
            </div>
          </fieldset>

          <label>Delivery address
            <div className="input-row"><MapPin size={18} /><input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Building, street, area, emirate" /></div>
          </label>
          <label>Phone number
            <div className="input-row"><Phone size={18} /><input required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+971 5X XXX XXXX" /></div>
          </label>
          <label>Notes <span className="optional">Optional</span>
            <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Apartment, landmark, gate instructions…" />
          </label>

          <aside className="after-hours-card">
            <Clock3 size={20} />
            <div><strong>Need delivery after 10 PM?</strong><p>For a delivery that cannot wait, contact us directly. Gia will coordinate it personally.</p>
              <span><a href="tel:+971585235595"><Phone size={15} /> +971 58 523 5595</a><a href="mailto:support@asanib.com"><Mail size={15} /> support@asanib.com</a></span>
            </div>
          </aside>
        </section>

        <aside className="request-summary-card simple-summary">
          <p className="eyebrow">NEXT</p>
          <h2>Review and pay</h2>
          <p>Check your request and the maximum amount before continuing to secure payment.</p>
          <button className="primary-button" type="submit" disabled={options.length === 0}>Review <ArrowRight size={18} /></button>
        </aside>
      </form>
    </main>
  );
}
