import { Bike, CircleDollarSign, Clock3, PackageCheck, ShoppingBag } from "lucide-react";

const queue = [
  { id: "DEMO-001", item: "USB-C cable", store: "Virgin Megastore", total: "154.64", status: "Paid" },
  { id: "DEMO-002", item: "Birthday balloons", store: "Party Centre", total: "119.83", status: "Finding courier" },
];

export default function AdminPage() {
  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div><p className="eyebrow">JS VENTURES • OPERATIONS</p><h1>Order desk</h1><p className="subtle">Manual dispatch console for the MVP.</p></div>
      </section>

      <section className="stat-grid">
        <article><Clock3 /><span>Open</span><strong>2</strong></article>
        <article><Bike /><span>On delivery</span><strong>0</strong></article>
        <article><PackageCheck /><span>Delivered today</span><strong>0</strong></article>
        <article><CircleDollarSign /><span>Gross today</span><strong>AED 0</strong></article>
      </section>

      <section className="admin-panel">
        <div className="section-heading"><h2>Incoming orders</h2><span className="status-pill">Manual courier</span></div>
        <div className="admin-table">
          {queue.map((order) => (
            <article key={order.id}>
              <div className="order-icon"><ShoppingBag size={19} /></div>
              <div><small>{order.id}</small><strong>{order.item}</strong><span>{order.store}</span></div>
              <div className="admin-money"><strong>AED {order.total}</strong><span>{order.status}</span></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
