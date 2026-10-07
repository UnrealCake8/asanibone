import { ArrowRight, Clock3, Package, ShoppingBag, Truck, UserRound } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  let recentOrders: { id: string; item_description: string; store_name: string; status: string; quoted_total: number; }[] = [];
  let firstName = "";

  if (userId) {
    const [{ data: orders }, { data: profile }] = await Promise.all([
      supabase.from("orders").select("id,item_description,store_name,status,quoted_total").order("created_at", { ascending: false }).limit(2),
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
    ]);
    recentOrders = orders ?? [];
    firstName = profile?.full_name?.split(" ")[0] ?? "";
  }

  return (
    <main className="app-shell desktop-app-shell asanib-home asanib-superapp">
      <header className="desktop-header">
        <Link className="desktop-brand" href="/">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <span><strong>Asanib</strong><small>Courier & delivery</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link className="active" href="/">Home</Link><Link href="/order/new">Courier & Delivery</Link><Link href="/orders">Orders</Link><Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="asanib-mobile-top">
        <div className="asanib-mobile-brand">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <div><span className="asanib-greeting">{firstName ? `Hi, ${firstName}` : "Welcome to"}</span><strong>Asanib</strong></div>
        </div>
        <Link className="asanib-account-chip" href="/account" aria-label="Open account"><UserRound size={20} /></Link>
      </section>

      <Link className="asanib-commerce-hero" href="/order/new">
        <div><p className="eyebrow">COURIER & DELIVERY</p><h1>Picked up.<br/>Delivered.</h1><p>Send a courier to collect an item from a store or pickup location and deliver it to your door. Need us to buy it first? Add that to your request.</p><strong>Book a delivery <ArrowRight size={18}/></strong></div>
        <span className="asanib-hero-bag"><ShoppingBag size={42}/></span>
      </Link>

      <section className="asanib-service-section">
        <div className="asanib-section-head"><div><h2>What should we deliver?</h2><p>Courier pickup and delivery across supported areas</p></div></div>
        <div className="asanib-service-rail">
          <Link href="/order/new"><span><ShoppingBag size={27}/></span><strong>Buy & deliver</strong></Link>
          <Link href="/order/new"><span><Package size={27}/></span><strong>Courier pickup</strong></Link>
          <Link href="/order/new"><span><Truck size={27}/></span><strong>Door delivery</strong></Link>
        </div>
      </section>

      <section className="asanib-shortcuts">
        <Link href="/order/new"><span><Package size={20}/></span><div><small>Send a courier</small><strong>Book a delivery</strong></div><ArrowRight size={18}/></Link>
        <Link href="/orders"><span><Clock3 size={20}/></span><div><small>Your deliveries</small><strong>Track orders</strong></div><ArrowRight size={18}/></Link>
      </section>

      {userId && recentOrders.length > 0 ? (
        <section className="activity-panel super-activity asanib-activity">
          <div className="section-heading simple-heading"><div><p className="eyebrow">ACTIVITY</p><h2>Recent orders</h2></div><Link href="/orders">View all</Link></div>
          <div className="order-list">{recentOrders.map((order) => <article className="order-card" key={order.id}><div><strong>{order.item_description}</strong><span>{order.store_name} · {order.status.replaceAll("_", " ")}</span></div><span className="status-pill">AED {Number(order.quoted_total).toFixed(2)}</span></article>)}</div>
        </section>
      ) : null}

      <nav className="bottom-nav mobile-only-nav asanib-bottom-nav" aria-label="Primary">
        <Link className="nav-active" href="/"><span>⌂</span>Home</Link>
        <Link href="/order/new"><span>＋</span>Delivery</Link>
        <Link href="/orders"><span>▤</span>Orders</Link>
        <Link href="/account"><span>♙</span>Profile</Link>
      </nav>

      <footer className="asanib-footer"><div><strong>Asanib</strong><span>Operated by JS Ventures LLC · UAE</span></div><nav aria-label="Legal"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/refunds">Refunds</Link><Link href="/delivery">Delivery</Link><Link href="/providers">Providers</Link></nav></footer>
    </main>
  );
}
