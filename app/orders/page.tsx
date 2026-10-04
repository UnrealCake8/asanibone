"use client";

import { useEffect, useState } from "react";
import { Clock3, LoaderCircle, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  status: string;
  item_description: string;
  store_name: string;
  quoted_total: number;
  created_at: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/orders/mine");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Could not load orders");

        const body = await res.json();
        const rows: Order[] = body.orders || [];

        if (!cancelled) setOrders(rows);

        const awaiting = rows.filter((order) => order.status === "awaiting_payment");
        if (awaiting.length === 0) return;

        const results = await Promise.all(
          awaiting.map((order) =>
            fetch("/api/payments/ziina/sync", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ orderId: order.id }),
            }).then((response) => response.json().catch(() => ({})))
          )
        );

        if (!results.some((result) => result.orderStatus === "paid")) return;

        const refreshed = await fetch("/api/orders/mine");
        if (!refreshed.ok) return;
        const refreshedBody = await refreshed.json();
        if (!cancelled) setOrders(refreshedBody.orders || []);
      } catch {
        if (!cancelled) setOrders([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="app-shell desktop-app-shell">
      <header className="desktop-header">
        <Link className="desktop-brand" href="/">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <span><strong>Asanib</strong><small>Local pickup, delivered</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link href="/">Home</Link>
          <Link className="active" href="/orders">Orders</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="topbar compact mobile-page-heading">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h1>Orders</h1></div>
      </section>

      <section className="desktop-content-narrow">
        <div className="section-heading desktop-section-title">
          <div><p className="eyebrow">YOUR ACTIVITY</p><h2>Orders</h2></div>
          <Link href="/order/new">New request</Link>
        </div>

        <div className="order-list spacious">
          {orders === null ? (
            <div className="empty-state">
              <div className="empty-icon"><LoaderCircle className="spin" size={21} /></div>
              <div><strong>Loading your orders</strong><span>One moment…</span></div>
            </div>
          ) : null}

          {orders?.length === 0 ? (
            <div className="empty-panel">
              <div className="large-empty-icon"><PackageOpen size={30} /></div>
              <h2>No orders yet</h2>
              <p>When you place a real request, it&apos;ll show up here with its live status.</p>
              <Link className="primary-button" href="/order/new">Start your first request</Link>
            </div>
          ) : null}

          {orders?.map((order) => (
            <article className="order-card order-card-polished" key={order.id}>
              <div className="order-leading">
                <div className="empty-icon"><Clock3 size={18} /></div>
                <div>
                  <strong>{order.item_description}</strong>
                  <span>{order.store_name}</span>
                </div>
              </div>
              <div className="order-trailing">
                <strong>AED {Number(order.quoted_total).toFixed(2)}</strong>
                <span className="status-pill">{order.status.replaceAll("_", " ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
