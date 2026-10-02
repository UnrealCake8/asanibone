import { ArrowRight, Clock3, Package, ShieldCheck, Sparkles, UserRound } from "lucide-react";
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
    <main className="app-shell home-shell">
      <section className="brand-row">
        <div className="brand-mark" aria-hidden="true">A</div>
        <div className="brand-copy">
          <strong>ASANIBONE</strong>
          <span>Anything. From almost anywhere.</span>
        </div>
        <Link className="icon-button" href="/account" aria-label="Account">
          <UserRound size={20} />
        </Link>
      </section>

      <section className="home-hero">
        <div className="hero-kicker"><Sparkles size={15} /> On-demand local pickup</div>
        <h1>{firstName ? "What do you need, " + firstName + "?" : "What do you need?"}</h1>
        <p>Tell us the item and where to get it. We&apos;ll handle the store run and delivery.</p>

        <Link className="primary-button hero-cta" href="/order/new">
          Start a request <ArrowRight size={18} />
        </Link>

        <div className="hero-meta">
          <span><ShieldCheck size={15} /> Secure checkout</span>
          <span><Package size={15} /> Real-store pickup</span>
        </div>
      </section>

      <section className="how-it-works">
        <article><span>1</span><div><strong>Request it</strong><small>Describe the exact item and store.</small></div></article>
        <article><span>2</span><div><strong>We collect it</strong><small>A courier heads to the store and buys it.</small></div></article>
        <article><span>3</span><div><strong>Get it delivered</strong><small>Track the order through to your door.</small></div></article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div><p className="eyebrow">ACTIVITY</p><h2>Recent orders</h2></div>
          {userId && recentOrders.length > 0 ? <Link href="/orders">View all</Link> : null}
        </div>

        {!userId ? (
          <Link className="empty-state" href="/login">
            <div className="empty-icon"><UserRound size={22} /></div>
            <div><strong>Sign in to see your orders</strong><span>Your real order history will appear here.</span></div>
            <ArrowRight size={18} />
          </Link>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Clock3 size={22} /></div>
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

      <nav className="bottom-nav" aria-label="Primary">
        <Link className="nav-active" href="/">Home</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/account">Account</Link>
      </nav>
    </main>
  );
}
