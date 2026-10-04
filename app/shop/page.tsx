import { ArrowLeft, ArrowRight, Search, Store } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: merchants } = await supabase.from("merchants").select("id,name,slug,description,logo_url").eq("active", true).order("sort_order").order("name");
  const { data: products } = await supabase.from("products").select("id,name,image_url,price,merchant_id").eq("active", true).eq("in_stock", true).order("sort_order").limit(12);
  const merchantMap = new Map((merchants ?? []).map((m) => [m.id, m.name]));
  return <main className="app-shell desktop-app-shell storefront-shell">
    <header className="storefront-header"><Link className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20}/></Link><div><p className="eyebrow">ASANIBONE SHOP</p><h1>Shop</h1></div></header>
    <div className="store-search"><Search size={21}/><span>Search stores and products</span></div>
    <section className="store-section"><div className="store-section-heading"><div><h2>Stores</h2><p>Shop from merchants on asanibONE</p></div></div>
      {(merchants ?? []).length ? <div className="merchant-row">{merchants!.map((m) => <Link className="merchant-card" href={"/shop/"+m.slug} key={m.id}><span className="merchant-logo">{m.logo_url ? <img src={m.logo_url} alt=""/> : <Store size={26}/>}</span><strong>{m.name}</strong><small>{m.description || "View store"}</small></Link>)}</div> : <div className="store-empty"><Store size={28}/><strong>Stores are coming soon</strong><span>Add merchants in Supabase and they’ll appear here automatically.</span></div>}
    </section>
    <section className="store-section"><div className="store-section-heading"><div><h2>Popular right now</h2><p>Products from our storefront</p></div></div>
      {(products ?? []).length ? <div className="product-grid">{products!.map((p) => <article className="product-card" key={p.id}><div className="product-image">{p.image_url ? <img src={p.image_url} alt=""/> : <Store size={34}/>}</div><small>{merchantMap.get(p.merchant_id) || "asanibONE"}</small><strong>{p.name}</strong><div className="product-price"><b>AED {Number(p.price).toFixed(2)}</b><ArrowRight size={17}/></div></article>)}</div> : null}
    </section>
    <nav className="bottom-nav mobile-only-nav super-bottom-nav" aria-label="Primary"><Link href="/"><span>⌂</span>Home</Link><Link href="/orders"><span>▤</span>Orders</Link><Link className="nav-active" href="/shop"><span>▣</span>Shop</Link><Link href="/account"><span>♙</span>Account</Link></nav>
  </main>;
}
