"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, LoaderCircle, PackageOpen } from "lucide-react";
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
    fetch("/api/orders/mine")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return { orders: [] };
        }
        if (!res.ok) throw new Error("Could not load orders");
        return res.json();
      })
      .then((body) => setOrders(body.orders || []))
      .catch(() => setOrders([]));
  }, [router]);

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">YOUR ACTIVITY</p><h1>Orders</h1></div>
      </section>

      <section className="order-list spacious">
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
      </section>

      <nav className="bottom-nav" aria-label="Primary">
        <Link href="/">Home</Link>
        <Link className="nav-active" href="/orders">Orders</Link>
        <Link href="/account">Account</Link>
      </nav>
    </main>
  );
}
