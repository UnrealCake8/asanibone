import { ArrowRight, Clock3, Package, ShoppingBag, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  const [{ data: merchants }, { data: products }] = await Promise.all([
    supabase.from("merchants").select("id,name,slug,description,logo_url").eq("active", true).order("sort_order").order("name").limit(8),
    supabase.from("products").select("id,name,image_url,price,merchant_id").eq("active", true).eq("in_stock", true).order("sort_order").limit(8),
  ]);
  const merchantMap = new Map((merchants ?? []).map((m) => [m.id, m.name]));

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
          <span><strong>Asanib</strong><small>Shop. Tap. Done.</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link className="active" href="/">Home</Link><Link href="/shop">Shop</Link><Link href="/orders">Orders</Link><Link href="/account">Account</Link>
        </nav>
      </header>

      <section className="asanib-mobile-top">
        <div className="asanib-mobile-brand">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <div><span className="asanib-greeting">{firstName ? `Hi, ${firstName}` : "Welcome to"}</span><strong>Asanib</strong></div>
        </div>
        <Link className="asanib-account-chip" href="/account" aria-label="Open account"><UserRound size={20} /></Link>
      </section>

      <Link className="asanib-commerce-hero" href="/shop">
        <div><p className="eyebrow">ASANIB SHOP</p><h1>Tap it.<br/>Get it.</h1><p>Everyday products from local stores, ready to order.</p><strong>Shop now <ArrowRight size={18}/></strong></div>
        <span className="asanib-hero-bag"><ShoppingBag size={42}/></span>
      </Link>

      <section className="asanib-service-section">
        <div className="asanib-section-head"><h2>What do you need?</h2><Link href="/shop">See all</Link></div>
        <div className="asanib-service-rail">
          <Link href="/shop"><span><ShoppingBag size={27}/></span><strong>Shop</strong></Link>
          {(merchants ?? []).slice(0,5).map((m) => (
            <Link href={"/shop/"+m.slug} key={m.id}>
              <span className="asanib-service-image">{m.logo_url ? <img src={m.logo_url} alt=""/> : <Store size={27}/>}</span>
              <strong>{m.name}</strong>
            </Link>
          ))}
          <Link href="/order/new"><span><Package size={27}/></span><strong>Pickup</strong></Link>
        </div>
      </section>

      {(products ?? []).length > 0 ? (
        <section className="asanib-products-section">
          <div className="asanib-section-head"><div><h2>Popular right now</h2><p>Tap a product to buy</p></div><Link href="/shop">View all</Link></div>
          <div className="asanib-home-products">
            {products!.map((p) => (
              <Link className="asanib-home-product" href={"/shop/product/"+p.id} key={p.id}>
                <div>{p.image_url ? <img src={p.image_url} alt=""/> : <Store size={32}/>}</div>
                <small>{merchantMap.get(p.merchant_id) || "Asanib"}</small>
                <strong>{p.name}</strong>
                <b>AED {Number(p.price).toFixed(2)}</b>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="asanib-shortcuts">
        <Link href="/order/new"><span><Package size={20}/></span><div><small>Can’t find it?</small><strong>Request a pickup</strong></div><ArrowRight size={18}/></Link>
        <Link href="/orders"><span><Clock3 size={20}/></span><div><small>Your purchases</small><strong>Track orders</strong></div><ArrowRight size={18}/></Link>
      </section>

      {userId && recentOrders.length > 0 ? (
        <section className="activity-panel super-activity asanib-activity">
          <div className="section-heading simple-heading"><div><p className="eyebrow">ACTIVITY</p><h2>Recent orders</h2></div><Link href="/orders">View all</Link></div>
          <div className="order-list">{recentOrders.map((order) => <article className="order-card" key={order.id}><div><strong>{order.item_description}</strong><span>{order.store_name} · {order.status.replaceAll("_", " ")}</span></div><span className="status-pill">AED {Number(order.quoted_total).toFixed(2)}</span></article>)}</div>
        </section>
      ) : null}

      <nav className="bottom-nav mobile-only-nav asanib-bottom-nav" aria-label="Primary">
        <Link className="nav-active" href="/"><span>⌂</span>Home</Link>
        <Link href="/shop"><span>▣</span>Shop</Link>
        <Link href="/orders"><span>▤</span>Orders</Link>
        <Link href="/account"><span>♙</span>Profile</Link>
      </nav>

      <footer className="asanib-footer"><div><strong>Asanib</strong><span>Operated by JS Ventures LLC · UAE</span></div><nav aria-label="Legal"><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/refunds">Refunds</Link><Link href="/delivery">Delivery</Link><Link href="/providers">Providers</Link></nav></footer>
    </main>
  );
}
