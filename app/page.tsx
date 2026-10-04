import { ArrowRight, Clock3, MapPin, Package, Search, ShoppingBag, UserRound } from "lucide-react";
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
      supabase.from("orders").select("id,item_description,store_name,status,quoted_total").order("created_at", { ascending: false }).limit(3),
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
    ]);
    recentOrders = orders ?? [];
    firstName = profile?.full_name?.split(" ")[0] ?? "";
  }

  return (
    <main className="app-shell desktop-app-shell super-home">
      <header className="desktop-header">
        <Link className="desktop-brand" href="/">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <span><strong>ASANIBONE</strong><small>Local pickup, delivered</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link className="active" href="/">Home</Link><Link href="/orders">Orders</Link><Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="super-mobile-brand">
        <img className="brand-logo" src="/icon.svg" alt="Asanib" />
        <div><strong>{firstName ? `Hi, ${firstName}` : "asanibONE"}</strong><span>What can we get for you?</span></div>
      </section>

      <Link className="super-search" href="/order/new">
        <Search size={23} /><span>What do you need?</span>
      </Link>

      <section className="super-hero">
        <div>
          <p className="eyebrow">ASANIBONE</p>
          <h1>Anything local.<br />One request away.</h1>
          <p>Tell us what you need and where it is. We&apos;ll handle the pickup and delivery.</p>
          <Link className="super-hero-link" href="/order/new">Order now <ArrowRight size={18} /></Link>
        </div>
      </section>

      <Link className="location-strip" href="/order/delivery">
        <span className="location-icon"><MapPin size={23} /></span>
        <span><strong>Deliver in the UAE</strong><small>Add your delivery address</small></span>
        <ArrowRight size={19} />
      </Link>

      <section className="services-panel">
        <div className="super-section-title"><h2>What do you need?</h2><span>asanibONE services</span></div>
        <div className="service-grid">
          <Link href="/shop"><span className="service-art"><ShoppingBag size={31} /></span><strong>Shop</strong><small>Browse stores</small></Link>
          <Link href="/order/new"><span className="service-art"><Package size={31} /></span><strong>Pickup</strong><small>Collect & deliver</small></Link>
          <Link href="/orders"><span className="service-art"><Clock3 size={31} /></span><strong>Orders</strong><small>Track activity</small></Link>
          <Link href="/account"><span className="service-art"><UserRound size={31} /></span><strong>Account</strong><small>Your profile</small></Link>
        </div>

        <section className="activity-panel super-activity">
          <div className="section-heading simple-heading">
            <div><p className="eyebrow">ACTIVITY</p><h2>Recent orders</h2></div>
            {userId && recentOrders.length > 0 ? <Link href="/orders">View all</Link> : null}
          </div>
          {!userId ? (
            <Link className="empty-state" href="/login"><div className="empty-icon"><UserRound size={21} /></div><div><strong>Sign in to see orders</strong><span>Your order history will appear here.</span></div><ArrowRight size={18} /></Link>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state"><div className="empty-icon"><Clock3 size={21} /></div><div><strong>No orders yet</strong><span>Your first request will appear here.</span></div></div>
          ) : (
            <div className="order-list">{recentOrders.map((order) => <article className="order-card" key={order.id}><div><strong>{order.item_description}</strong><span>{order.store_name} · {order.status.replaceAll("_", " ")}</span></div><span className="status-pill">AED {Number(order.quoted_total).toFixed(2)}</span></article>)}</div>
          )}
        </section>
      </section>

      <nav className="bottom-nav mobile-only-nav super-bottom-nav" aria-label="Primary">
        <Link className="nav-active" href="/"><span>⌂</span>Home</Link>
        <Link href="/orders"><span>▤</span>Orders</Link>
        <Link href="/order/new"><span>＋</span>Order</Link>
        <Link href="/account"><span>♙</span>Account</Link>
      </nav>
    </main>
  );
}
