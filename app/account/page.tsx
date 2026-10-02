import { ArrowLeft, LogIn, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
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
    <main className="app-shell">
      <section className="topbar compact">
        <Link className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">ACCOUNT</p><h1>Profile</h1></div>
      </section>

      {claims ? (
        <>
          <section className="profile-card">
            <div className="profile-avatar"><UserRound size={26} /></div>
            <div>
              <strong>{profile?.full_name || "ASANIBONE customer"}</strong>
              <span>{String(claims.email || "")}</span>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-row"><Mail size={19} /><div><strong>Email</strong><span>{String(claims.email || "")}</span></div></div>
            <div className="settings-row"><ShieldCheck size={19} /><div><strong>Account security</strong><span>Password-protected Supabase account</span></div></div>
            <form action="/api/account/signout" method="post">
              <button className="settings-row danger-row" type="submit"><LogOut size={19} /><div><strong>Sign out</strong><span>Sign out of this device</span></div></button>
            </form>
          </section>
        </>
      ) : (
        <section className="auth-prompt-card">
          <div className="profile-avatar"><LogIn size={24} /></div>
          <div><h2>Sign in to ASANIBONE</h2><p>Access your real orders and account details.</p></div>
          <Link className="primary-button" href="/login">Sign in or create account</Link>
        </section>
      )}

      <nav className="bottom-nav" aria-label="Primary">
        <Link href="/">Home</Link>
        <Link href="/orders">Orders</Link>
        <Link className="nav-active" href="/account">Account</Link>
      </nav>
    </main>
  );
}
