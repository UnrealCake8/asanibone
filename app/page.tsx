import { ArrowRight, Clock3, UserRound } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  let recentOrders: {
    id: string;
    item_description: string;
    store_name: string;
    status: string;
    quoted_total: number;
  }[] = [];

  let firstName = "";

  if (userId) {
    const [{ data: orders }, { data: profile }] = await Promise.all([
      supabase
        .from("orders")
        .select("id,item_description,store_name,status,quoted_total")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("profiles").select("full_name").eq("id", userId).single(),
    ]);

    recentOrders = orders ?? [];
    firstName = profile?.full_name?.split(" ")[0] ?? "";
  }

  return (
    <main className="app-shell desktop-app-shell">
      <header className="desktop-header">
        <Link className="desktop-brand" href="/">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <span><strong>ASANIBONE</strong><small>Local pickup, delivered</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link className="active" href="/">Home</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="home-simple-grid">
        <div className="home-primary">
          <p className="eyebrow">ON-DEMAND PICKUP</p>
          <h1>{firstName ? "What do you need, " + firstName + "?" : "What do you need?"}</h1>
          <p className="home-lede">Tell us the item, the shop, and where to deliver it.</p>
          <Link className="primary-button home-main-cta" href="/order/new">
            Start request <ArrowRight size={18} />
          </Link>
        </div>

        <section className="activity-panel">
          <div className="section-heading simple-heading">
            <div><p className="eyebrow">ACTIVITY</p><h2>Recent orders</h2></div>
            {userId && recentOrders.length > 0 ? <Link href="/orders">View all</Link> : null}
          </div>

          {!userId ? (
            <Link className="empty-state" href="/login">
              <div className="empty-icon"><UserRound size={21} /></div>
              <div><strong>Sign in to see orders</strong><span>Your order history will appear here.</span></div>
              <ArrowRight size={18} />
            </Link>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Clock3 size={21} /></div>
              <div><strong>No orders yet</strong><span>Your first real request will appear here.</span></div>
            </div>
          ) : (
            <div className="order-list">
              {recentOrders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div>
                    <strong>{order.item_description}</strong>
                    <span>{order.store_name} · {order.status.replaceAll("_", " ")}</span>
                  </div>
                  <span className="status-pill">AED {Number(order.quoted_total).toFixed(2)}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <nav className="bottom-nav mobile-only-nav" aria-label="Primary">
        <Link className="nav-active" href="/">Home</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/account">Account</Link>
      </nav>
    </main>
  );
}
