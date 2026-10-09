"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() || null },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setMessage("Account created. Check your email only if Supabase asks you to confirm the address.");
  }

  function changeMode(next: "signin" | "signup") {
    setMode(next);
    setError("");
    setMessage("");
  }

  return (
    <main className="app-shell auth-shell">
      <section className="topbar compact auth-topbar">
        <Link className="icon-button" href="/" aria-label="Back"><ArrowLeft size={20} /></Link>
        <div><p className="eyebrow">ASANIB</p><h1>{mode === "signin" ? "Welcome back" : "Create account"}</h1></div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Account">
          <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => changeMode("signin")}>Sign in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>Create account</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" ? (
            <label>Full name
              <div className="input-row">
                <UserRound size={18} />
                <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            </label>
          ) : null}

          <label>Email
            <div className="input-row">
              <Mail size={18} />
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </label>

          <label>Password
            <div className="input-row">
              <LockKeyhole size={18} />
              <input required minLength={8} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            </div>
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}

          <button className="primary-button" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-footnote">No passwordless magic links. Your account uses your email and password.</p>
      </section>
    </main>
  );
}
