"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Package, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveOrderDraft } from "@/lib/order-draft";

type RequestMode = "purchase" | "pickup";

function detectMode(request: string): RequestMode {
  return /pickup|pick up|parcel|collect|collection|return/i.test(request) ? "pickup" : "purchase";
}

export function RequestLauncher() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [mode, setMode] = useState<RequestMode>("purchase");
  const detectedMode = useMemo(() => detectMode(request), [request]);

  function useExample(example: string, nextMode: RequestMode) {
    setRequest(example);
    setMode(nextMode);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanRequest = request.trim();
    if (!cleanRequest) return;

    const resolvedMode = request ? detectedMode : mode;
    saveOrderDraft({ itemDescription: cleanRequest });
    router.push(`/order/new?mode=${resolvedMode}`);
  }

  return (
    <section className="request-launcher" aria-labelledby="request-heading">
      <p className="eyebrow">ASANIB DELIVERY</p>
      <h1 id="request-heading">What do you need?</h1>
      <p className="request-launcher-lede">Tell us what needs to happen. We will take you straight to the details that matter.</p>

      <form onSubmit={submit}>
        <label className="request-box">
          <span className="sr-only">Your request</span>
          <textarea value={request} onChange={(event) => setRequest(event.target.value)} placeholder="I want someone to buy something from a store and deliver it to me…" rows={4} />
          <span className="request-box-footer">
            <span>{request ? `We’ll set this up as a ${detectedMode === "pickup" ? "pickup" : "purchase"}.` : "Start with a plain-English request."}</span>
            <button type="submit" aria-label="Continue with this request"><ArrowRight size={20} /></button>
          </span>
        </label>
      </form>

      <div className="request-examples" aria-label="Request examples">
        <button type="button" onClick={() => useExample("Buy something from a store and deliver it to me", "purchase")}><ShoppingBag size={18} /><span>Buy and deliver</span></button>
        <button type="button" onClick={() => useExample("Pick up a parcel and deliver it to me", "pickup")}><Package size={18} /><span>Pick up a parcel</span></button>
      </div>
    </section>
  );
}
