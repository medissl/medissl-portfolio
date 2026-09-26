"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase";

type State = "loading" | "signed-out" | "checking" | "allowed" | "denied";

export function AdminGuard({ children }: { children: ReactNode }) {
  const supabase = getBrowserSupabase();
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [identity, setIdentity] = useState<string | null>(null);

  async function checkAccess() {
    setState("checking");
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setIdentity(null);
      setState("signed-out");
      return;
    }

    setIdentity(user.email ?? "Authenticated user");
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    setState(!error && data ? "allowed" : "denied");
  }

  useEffect(() => {
    void checkAccess();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void checkAccess();
    });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage("Signing in…");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("");
    await checkAccess();
  }

  async function logout() {
    await supabase.auth.signOut();
    setMessage("");
    setState("signed-out");
  }

  if (state === "loading" || state === "checking") {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <p className="eyebrow">ADMIN</p>
          <h1>Checking access…</h1>
        </div>
      </div>
    );
  }

  if (state === "signed-out") {
    return (
      <div className="admin-shell">
        <form className="admin-card admin-login" onSubmit={login}>
          <ShieldCheck size={26} aria-hidden="true" />
          <p className="eyebrow">PRIVATE CMS</p>
          <h1>Portfolio control room.</h1>
          <p className="muted">
            This area is only for the portfolio owner. Public visitors cannot
            create, edit, publish, or remove work.
          </p>

          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {message && <p className="form-message">{message}</p>}
          <button className="button button--primary" type="submit">
            <LogIn size={17} /> Sign in
          </button>
        </form>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="admin-shell">
        <div className="admin-card">
          <p className="eyebrow">AUTHENTICATED / NOT AUTHORIZED</p>
          <h1>This account is not an admin.</h1>
          <p className="muted">
            Signed in as {identity}. Add this Supabase user to the
            <code> admin_users </code> table before using the CMS.
          </p>
          <button className="button button--ghost" type="button" onClick={logout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <div>
          <p className="eyebrow">PORTFOLIO CMS</p>
          <span className="muted">{identity}</span>
        </div>
        <button className="button button--ghost" type="button" onClick={logout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
