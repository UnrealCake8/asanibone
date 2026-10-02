import { ArrowLeft, Clock3, PackageCheck } from "lucide-react";

export default function OrdersPage() {
  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div>
          <p className="eyebrow">YOUR ORDERS</p>
          <h1>Orders</h1>
        </div>
      </section>

      <section className="order-list">
        <article className="order-card order-large">
          <div className="order-icon"><Clock3 size={20} /></div>
          <div><strong>No active orders</strong><span>Start a request and tracking will appear here.</span></div>
        </article>
        <article className="order-card order-large">
          <div className="order-icon"><PackageCheck size={20} /></div>
          <div><strong>Past orders</strong><span>Your delivered requests will stay here.</span></div>
        </article>
      </section>

      <nav className="bottom-nav" aria-label="Primary">
        <a href="/">Home</a>
        <a className="nav-active" href="/orders">Orders</a>
        <a href="/account">Account</a>
      </nav>
    </main>
  );
}
