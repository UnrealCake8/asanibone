import { LogIn, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  let profile: { full_name: string | null } | null = null;
  if (claims?.sub) {
    const { data: row } = await supabase.from("profiles").select("full_name").eq("id", claims.sub).single();
    profile = row;
  }

  return (
    <main className="app-shell desktop-app-shell">
      <header className="desktop-header">
        <Link className="desktop-brand" href="/">
          <img className="brand-logo" src="/icon.svg" alt="Asanib" />
          <span><strong>Asanib</strong><small>Local pickup, delivered</small></span>
        </Link>
        <nav className="desktop-links" aria-label="Desktop navigation">
          <Link href="/">Home</Link>
          <Link href="/orders">Orders</Link>
          <Link className="active" href="/account">Account</Link>
        </nav>
      </header>

      <section className="topbar compact mobile-page-heading">
        <div><p className="eyebrow">ACCOUNT</p><h1>Profile</h1></div>
      </section>

      <section className="desktop-content-narrow">
        <div className="section-heading desktop-section-title">
          <div><p className="eyebrow">ACCOUNT</p><h2>Profile</h2></div>
        </div>

        {claims ? (
          <>
            <section className="profile-card">
              <div className="profile-avatar"><UserRound size={26} /></div>
              <div>
                <strong>{profile?.full_name || "Asanib customer"}</strong>
                <span>{String(claims.email || "")}</span>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-row"><Mail size={19} /><div><strong>Email</strong><span>{String(claims.email || "")}</span></div></div>
              <div className="settings-row"><ShieldCheck size={19} /><div><strong>Account security</strong><span>Password-protected account</span></div></div>
              <form action="/api/account/signout" method="post">
                <button className="settings-row danger-row" type="submit"><LogOut size={19} /><div><strong>Sign out</strong><span>Sign out of this device</span></div></button>
              </form>
            </section>
          </>
        ) : (
          <section className="auth-prompt-card">
            <div className="profile-avatar"><LogIn size={24} /></div>
            <div><h2>Sign in to Asanib</h2><p>Access your orders and account details.</p></div>
            <Link className="primary-button" href="/login">Sign in or create account</Link>
          </section>
        )}
      </section>
    </main>
  );
}
