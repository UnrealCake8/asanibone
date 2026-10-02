import { Bike, CircleDollarSign, Clock3, PackageCheck, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claimsData.claims.sub)
    .single();

  if (profile?.role !== "admin") notFound();

  const { data: orders } = await supabase.rpc("admin_list_orders");
  const queue = orders ?? [];
  const open = queue.filter((o) => !["delivered", "cancelled", "failed"].includes(o.status)).length;
  const delivering = queue.filter((o) => ["courier_assigned", "heading_to_store", "at_store", "purchased", "delivering"].includes(o.status)).length;
  const deliveredToday = queue.filter((o) => o.status === "delivered" && new Date(o.updated_at).toDateString() === new Date().toDateString()).length;
  const grossToday = queue
    .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + Number(o.quoted_total), 0);

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div><p className="eyebrow">JS VENTURES • OPERATIONS</p><h1>Order desk</h1><p className="subtle">Manual dispatch console for the MVP.</p></div>
      </section>

      <section className="stat-grid">
        <article><Clock3 /><span>Open</span><strong>{open}</strong></article>
        <article><Bike /><span>On delivery</span><strong>{delivering}</strong></article>
        <article><PackageCheck /><span>Delivered today</span><strong>{deliveredToday}</strong></article>
        <article><CircleDollarSign /><span>Gross today</span><strong>AED {grossToday.toFixed(2)}</strong></article>
      </section>

      <section className="admin-panel">
        <div className="section-heading"><h2>Incoming orders</h2><span className="status-pill">Manual courier</span></div>
        <div className="admin-table">
          {queue.length === 0 && <p className="subtle">No orders yet.</p>}
          {queue.map((order) => (
            <article key={order.id}>
              <div className="order-icon"><ShoppingBag size={19} /></div>
              <div><small>{order.id.slice(0,8)}</small><strong>{order.item_description}</strong><span>{order.store_name}</span></div>
              <div className="admin-money"><strong>AED {Number(order.quoted_total).toFixed(2)}</strong><span>{order.status.replaceAll("_"," ")}</span></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
