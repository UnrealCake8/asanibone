"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Mail, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="app-shell">
      <section className="topbar compact">
        <a className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></a>
        <div><p className="eyebrow">ASANIBONE</p><h1>Sign in</h1></div>
      </section>

      <section className="form-card">
        {sent ? (
          <div className="auth-message">
            <Mail size={24} />
            <h2>Check your email</h2>
            <p>We sent you a secure sign-in link.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label>Email
              <div className="input-row">
                <Mail size={18} />
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={18} /> : null}
              {loading ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
