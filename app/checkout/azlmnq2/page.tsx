"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SpecialCheckoutContent() {
  const query = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"unknown" | "pending" | "paid">("unknown");
  const [checking, setChecking] = useState(false);
  const paymentId = query.get("payment");

  useEffect(() => {
    if (!paymentId || !query.has("returned")) return;
    let active = true;
    fetch("/api/payments/ngenius/special/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Verification unavailable.");
      if (active) setPaymentStatus(data.status === "paid" ? "paid" : "pending");
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : "Verification unavailable.");
    });
    return () => { active = false; };
  }, [paymentId, query]);
  async function recheckPayment() {
    if (!paymentId) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/payments/ngenius/special/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Verification unavailable.");
      setPaymentStatus(data.status === "paid" ? "paid" : "pending");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Verification unavailable.");
    } finally { setChecking(false); }
  }

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/ngenius/special", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "AZLMNQ2" }),
      });
      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }
      const body = await response.json().catch(() => ({}));
      if (!response.ok || typeof body.redirectUrl !== "string") {
        throw new Error(body.error || "Unable to start checkout.");
      }
      window.location.assign(body.redirectUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start checkout.");
      setBusy(false);
    }
  }

  return (
    <main className="app-shell request-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/order/new" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">SPECIAL CHECKOUT</p><h1>AED 20 payment</h1></div>
      </section>
      <div className="request-layout">
        <section className="form-card request-main-card">
          <p className="eyebrow">CODE AZLMNQ2</p>
          <h2>Separate payment checkout</h2>
          <p>This is a standalone live payment for AED 20.00, not a delivery order. You will be redirected to Network International to pay securely.</p>
          {query.has("returned") ? (
            <div role="status">
              <p>{paymentStatus === "paid" ? "Payment confirmed by Network International." : paymentStatus === "pending" ? "Payment not yet confirmed. Check your bank before attempting another payment." : "Payment status unknown. Do not retry until you verify whether your bank was charged."}</p>
              {paymentId ? <button type="button" className="primary-button" onClick={recheckPayment} disabled={checking}>{checking ? "Checking…" : "Check payment status"}</button> : null}
            </div>
          ) : null}
          {query.has("cancelled") ? <p>Checkout was cancelled. No payment confirmation was received.</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </section>
        <aside className="request-summary-card">
          <div><span>Special checkout</span><strong>AZLMNQ2</strong></div>
          <div className="summary-total"><span>Amount to pay</span><strong>AED 20.00</strong></div>
          <div className="secure-note"><ShieldCheck size={17} /><span>Live Network International checkout</span></div>
          <button className="primary-button" type="button" onClick={checkout} disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <CreditCard size={18} />}
            {busy ? "Opening checkout…" : "Pay AED 20.00"}
          </button>
        </aside>
      </div>
    </main>
  );
}
export default function SpecialCheckoutPage() {
  return <Suspense fallback={<main className="app-shell request-shell" />}><SpecialCheckoutContent /></Suspense>;
}
