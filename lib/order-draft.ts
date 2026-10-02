import type { OrderDraft } from "@/lib/types";

const KEY = "asanibone-order-draft";

export function saveOrderDraft(draft: Partial<OrderDraft>) {
  if (typeof window === "undefined") return;
  const current = readOrderDraft();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...draft }));
}

export function readOrderDraft(): Partial<OrderDraft> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function clearOrderDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
