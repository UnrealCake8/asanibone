"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Link2, MapPin, Store } from "lucide-react";

const DELIVERY_FEE = 20;
const SERVICE_FEE = 10;
const ZIINA_PERCENT = 0.026;
const ZIINA_FIXED = 1;

function paymentFeeFor(desiredNet: number) {
  return Math.ceil(((desiredNet + ZIINA_FIXED) / (1 - ZIINA_PERCENT) - desiredNet) * 100) / 100;
}

export default function NewOrderPage() {
  const [estimate, setEstimate] = useState(100);
  const [buffer, setBuffer] = useState(10);

  const pricing = useMemo(() => {
    const itemAllowance = Math.max(0, estimate + buffer);
    const desiredNet = itemAllowance + DELIVERY_FEE + SERVICE_FEE;
    const paymentFee = paymentFeeFor(desiredNet);
    const total = desiredNet + paymentFee;
    return { itemAllowance, paymentFee, total };
  }, [estimate, buffer]);

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div>
          <p className="eyebrow">NEW REQUEST</p>
          <h1>What should we get?</h1>
        </div>
      </section>

      <section className="form-card">
        <label>
          Item
          <textarea placeholder="Describe the exact item, size, colour, quantity, etc." rows={4} />
        </label>

        <div className="inline-actions">
          <button type="button"><Link2 size={18} /> Add product link</button>
          <button type="button"><Camera size={18} /> Add photo</button>
        </div>

        <label>
          Store
          <div className="input-row">
            <Store size={18} />
            <input placeholder="Store name" />
          </div>
        </label>

        <label>
          Store location
          <div className="input-row">
            <MapPin size={18} />
            <input placeholder="Mall, branch or area" />
          </div>
        </label>

        <div className="split-grid">
          <label>
            Expected item price
            <div className="money-input">
              <span>AED</span>
              <input
                inputMode="decimal"
                value={estimate}
                onChange={(e) => setEstimate(Number(e.target.value || 0))}
              />
            </div>
          </label>

          <label>
            Price buffer
            <div className="money-input">
              <span>AED</span>
              <input
                inputMode="decimal"
                value={buffer}
                onChange={(e) => setBuffer(Number(e.target.value || 0))}
              />
            </div>
          </label>
        </div>
      </section>

      <section className="price-card">
        <div><span>Item allowance</span><strong>AED {pricing.itemAllowance.toFixed(2)}</strong></div>
        <div><span>Delivery</span><strong>AED {DELIVERY_FEE.toFixed(2)}</strong></div>
        <div><span>Service fee</span><strong>AED {SERVICE_FEE.toFixed(2)}</strong></div>
        <div><span>Payment fee</span><strong>AED {pricing.paymentFee.toFixed(2)}</strong></div>
        <div className="price-total"><span>Maximum charge</span><strong>AED {pricing.total.toFixed(2)}</strong></div>
        <p>If the item costs less than your allowance, the difference can be refunded after purchase.</p>
      </section>

      <button className="primary-button full-width" type="button">
        Continue to delivery <ArrowRight size={18} />
      </button>
    </main>
  );
}
