"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, LoaderCircle } from "lucide-react";

type Order = {
  id: string;
  status: string;
  item_description: string;
  store_name: string;
  quoted_total: number;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          return { orders: [] };
        }
        return res.json();
      })
      .then((body) => setOrders(body.orders || []));
  }, []);

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div><p className="eyebrow">YOUR ORDERS</p><h1>Orders</h1></div>
      </section>

      <section className="order-list">
        {orders === null && (
          <article className="order-card order-large">
            <div className="order-icon"><LoaderCircle className="spin" size={20} /></div>
            <div><strong>Loading orders</strong><span>Checking your account…</span></div>
          </article>
        )}

        {orders?.length === 0 && (
          <article className="order-card order-large">
            <div className="order-icon"><Clock3 size={20} /></div>
            <div><strong>No orders yet</strong><span>Your requests will appear here.</span></div>
          </article>
        )}

        {orders?.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <strong>{order.item_description}</strong>
              <span>{order.store_name} • {order.status.replaceAll("_", " ")}</span>
            </div>
            <span className="status-pill">AED {Number(order.quoted_total).toFixed(2)}</span>
          </article>
        ))}
      </section>

      <nav className="bottom-nav" aria-label="Primary">
        <a href="/">Home</a><a className="nav-active" href="/orders">Orders</a><a href="/account">Account</a>
      </nav>
    </main>
  );
}
