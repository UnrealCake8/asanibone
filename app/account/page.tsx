import { ArrowLeft, LogIn, LogOut, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div><p className="eyebrow">PROFILE</p><h1>Account</h1></div>
      </section>

      <section className="form-card menu-list">
        {claims ? (
          <>
            <div className="account-summary">
              <UserRound size={22} />
              <div><strong>Signed in</strong><small>{String(claims.email || "")}</small></div>
            </div>
            <form action="/api/account/signout" method="post">
              <button type="submit"><LogOut size={19} /><span><strong>Sign out</strong><small>Sign out of this device</small></span></button>
            </form>
          </>
        ) : (
          <a className="account-link" href="/login">
            <LogIn size={19} /><span><strong>Sign in</strong><small>Access your orders and account</small></span>
          </a>
        )}
      </section>
    </main>
  );
}
