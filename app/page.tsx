import { ArrowRight, Camera, Link2, MapPin, Package, Search, UserRound } from "lucide-react";

const recent = [
  { store: "Virgin Megastore", item: "USB-C cable", status: "Delivered" },
  { store: "Carrefour", item: "2L milk + cereal", status: "Delivered" },
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">ASANIBONE</p>
          <h1>What do you need?</h1>
          <p className="subtle">Tell us the item and shop. We&apos;ll handle the run.</p>
        </div>
        <button className="icon-button" aria-label="Account">
          <UserRound size={20} />
        </button>
      </section>

      <section className="hero-card">
        <div className="input-row">
          <Search size={20} />
          <input aria-label="Describe what you want" placeholder="e.g. AirPods from Sharaf DG" />
        </div>

        <div className="quick-grid">
          <button className="quick-action">
            <Link2 size={20} />
            <span>Paste link</span>
          </button>
          <button className="quick-action">
            <Camera size={20} />
            <span>Add photo</span>
          </button>
          <button className="quick-action">
            <MapPin size={20} />
            <span>Choose store</span>
          </button>
        </div>

        <a className="primary-button" href="/order/new">
          Start request <ArrowRight size={18} />
        </a>
      </section>

      <section className="info-strip">
        <div>
          <strong>Buy from almost any shop</strong>
          <span>No merchant signup needed</span>
        </div>
        <Package size={28} />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Recent orders</h2>
          <a href="/orders">View all</a>
        </div>

        <div className="order-list">
          {recent.map((order) => (
            <article className="order-card" key={order.store + order.item}>
              <div>
                <strong>{order.item}</strong>
                <span>{order.store}</span>
              </div>
              <span className="status-pill">{order.status}</span>
            </article>
          ))}
        </div>
      </section>

      <nav className="bottom-nav" aria-label="Primary">
        <a className="nav-active" href="/">Home</a>
        <a href="/orders">Orders</a>
        <a href="/account">Account</a>
      </nav>
    </main>
  );
}
