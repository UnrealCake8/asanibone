import { ArrowRight, Clock3, MapPin, Package, ShoppingBag, UserRound } from "lucide-react";
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
    <main className="app-shell desktop-app-shell super-home asanib-home">
      <header className="desktop-header">
        <Link className="desktop-brand" href="/">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <span><strong>Asanib</strong><small>Local pickup, delivered</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link className="active" href="/">Home</Link><Link href="/orders">Orders</Link><Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="asanib-mobile-top">
        <div className="asanib-mobile-brand">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <div>
            <span className="asanib-greeting">{firstName ? `Hi, ${firstName}` : "Welcome"}</span>
            <strong>Asanib</strong>
          </div>
        </div>
        <Link className="asanib-account-chip" href="/account" aria-label="Open account">
          <UserRound size={20} />
        </Link>
      </section>

      <section className="asanib-mobile-intro">
        <p className="eyebrow">Your everyday local app</p>
        <h1>What do you need today?</h1>
        <p>Shop nearby, request a pickup, and keep track of your orders from one place.</p>
      </section>

      <section className="asanib-quick-grid" aria-label="Asanib services">
        <Link className="asanib-quick-card" href="/shop">
          <span><ShoppingBag size={25} /></span>
          <strong>Shop</strong>
          <small>Browse stores</small>
        </Link>
        <Link className="asanib-quick-card" href="/order/new">
          <span><Package size={25} /></span>
          <strong>Pickup</strong>
          <small>Collect & deliver</small>
        </Link>
        <Link className="asanib-quick-card" href="/orders">
          <span><Clock3 size={25} /></span>
          <strong>Orders</strong>
          <small>Track activity</small>
        </Link>
        <Link className="asanib-quick-card" href="/account">
          <span><UserRound size={25} /></span>
          <strong>Account</strong>
          <small>Your profile</small>
        </Link>
      </section>

      <Link className="asanib-primary-action" href="/order/new">
        <span>
          <small>Need something picked up?</small>
          <strong>Create a request</strong>
        </span>
        <ArrowRight size={21} />
      </Link>

      <Link className="asanib-location-card" href="/order/delivery">
        <span className="asanib-location-icon"><MapPin size={22} /></span>
        <span>
          <small>Delivering across the UAE</small>
          <strong>Add your delivery address</strong>
        </span>
        <ArrowRight size={19} />
      </Link>

      <section className="activity-panel super-activity asanib-activity">
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

      <nav className="bottom-nav mobile-only-nav super-bottom-nav asanib-bottom-nav" aria-label="Primary">
        <Link className="nav-active" href="/"><span>⌂</span>Home</Link>
        <Link href="/shop"><span>⌑</span>Shop</Link>
        <Link href="/orders"><span>▤</span>Orders</Link>
        <Link href="/account"><span>♙</span>Account</Link>
      </nav>
    </main>
  );
}
