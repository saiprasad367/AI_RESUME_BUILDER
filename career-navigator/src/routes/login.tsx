import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · CareerPilot AI" }] }),
  component: () => <AuthPage mode="login" />,
});

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function AuthPage({ mode }: { mode: "login" | "signup" | "forgot" | "reset" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const titles = {
    login: { h: "Welcome back", s: "Sign in to continue building your career." },
    signup: { h: "Create your account", s: "Free forever. Your first resume in 5 minutes." },
    forgot: { h: "Reset your password", s: "We'll email you a secure reset link." },
    reset: { h: "Set a new password", s: "Choose something secure you'll remember." },
  }[mode];

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (oAuthError) throw oAuthError;
    } catch (err: any) {
      const msg = err.message || "Failed to initialize Google login.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (!email || !password || !fullName) {
          throw new Error("Please fill in all fields.");
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (signUpError) throw signUpError;
        toast.success("Account created! Please check your email for a confirmation link.");
        navigate({ to: "/login" });
      } else if (mode === "login") {
        if (!email || !password) {
          throw new Error("Please enter your email and password.");
        }
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      } else if (mode === "forgot") {
        if (!email) {
          throw new Error("Please enter your email.");
        }
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        toast.success("Password reset email sent!");
      } else if (mode === "reset") {
        if (!password) {
          throw new Error("Please enter a new password.");
        }
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        if (updateError) throw updateError;
        toast.success("Password updated successfully!");
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      const msg = err.message || "Authentication failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 lg:flex">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-tint-blue/60 via-tint-lavender/30 to-tint-green/50"></div>
        <Logo />
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Your AI Career<br/>Operating System.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Resumes that adapt. ATS scores that improve. A career that compounds — guided by AI that learns with you.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["ATS-optimized resumes","Job description intelligence","Personalized career coaching","Weekly learning roadmaps"].map(i => (
              <li key={i} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-card border border-border">
                  <svg className="h-3 w-3 text-tint-green-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </span>
                {i}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CareerPilot AI</p>
      </aside>

      {/* Right form panel */}
      <main className="flex flex-col">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground">Home</Link>
        </header>
        <div className="hidden justify-end p-6 lg:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{titles.h}</h1>
          <p className="mt-2 text-muted-foreground">{titles.s}</p>

          {(mode === "login" || mode === "signup") && (
            <div className="mt-6 grid gap-2">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-border-strong w-full cursor-pointer transition-colors disabled:opacity-60"
              >
                <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13-5l-6-5.1c-2 1.4-4.4 2.1-7 2.1-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6 5.1c-.4.4 6.8-5 6.8-14.6 0-1.2-.1-2.3-.4-3.5z"/></svg>
                Continue with Google
              </button>
              <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border"></span>or with email<span className="h-px flex-1 bg-border"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field
                label="Full name"
                type="text"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}
            {mode !== "reset" && (
              <Field
                label="Email"
                type="email"
                placeholder="you@work.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <Field
                label={mode === "reset" ? "New password" : "Password"}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            {mode === "reset" && <Field label="Confirm password" type="password" placeholder="••••••••" />}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" /> Remember me
                </label>
                <Link to="/forgot-password" className="text-foreground hover:underline">Forgot password?</Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Please wait…" :
                mode === "login" ? "Sign in" :
                mode === "signup" ? "Create account" :
                mode === "forgot" ? "Send reset link" : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "login" && <>New here? <Link to="/signup" className="text-foreground hover:underline">Create an account</Link></>}
            {mode === "signup" && <>Already have an account? <Link to="/login" className="text-foreground hover:underline">Sign in</Link></>}
            {mode === "forgot" && <>Remembered it? <Link to="/login" className="text-foreground hover:underline">Back to sign in</Link></>}
            {mode === "reset" && <>Done? <Link to="/login" className="text-foreground hover:underline">Sign in</Link></>}
          </p>
        </div>
      </main>
    </div>
  );
}


function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...rest}
        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
      />
    </label>
  );
}
