import { ArrowLeft, Bell, CreditCard, LogIn, MapPin } from "lucide-react";

export default function AccountPage() {
  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div>
          <p className="eyebrow">PROFILE</p>
          <h1>Account</h1>
        </div>
      </section>

      <section className="form-card menu-list">
        <button><LogIn size={19} /><span><strong>Sign in</strong><small>Supabase Auth will plug in here</small></span></button>
        <button><MapPin size={19} /><span><strong>Saved addresses</strong><small>Home, work and other delivery locations</small></span></button>
        <button><CreditCard size={19} /><span><strong>Payments</strong><small>Ziina checkout handled securely server-side</small></span></button>
        <button><Bell size={19} /><span><strong>Notifications</strong><small>Order progress and courier updates</small></span></button>
      </section>
    </main>
  );
}
