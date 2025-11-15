import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Mode = "login" | "register";

const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setMessage(null);
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your SIT email.");
      return;
    }

    // Enforce SIT email domain
    if (!trimmedEmail.endsWith("@sit.ac.in")) {
      setMessage("Only SIT emails (USN@sit.ac.in) are allowed.");
      return;
    }

    if (!trimmedPassword) {
      setMessage("Please enter your password.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (mode === "register" && trimmedPassword !== trimmedConfirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        // Simple sign up (no email confirmation required)
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          console.error("Sign up error:", error);
          setMessage("Registration failed: " + error.message);
        } else {
          setMessage(
            "Account created! You can now login with your email and password."
          );
          // Switch to login mode after successful registration
          setMode("login");
          setPassword("");
          setConfirm("");
        }
      } else {
        // Email + password login
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });

        if (error) {
          console.error("Login error:", error);
          setMessage("Login failed: " + error.message);
        } else {
          // App.tsx will detect the session and render the main app
          setMessage(null);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setMessage("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-2xl shadow-black/60 p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          {isRegister ? "Create your CampusCore account" : "Sign in to CampusCore"}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Use your official SIT email (<span className="font-mono">USN@sit.ac.in</span>)
          to access the smart campus hub.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex rounded-full bg-slate-900 border border-slate-700 p-1 text-xs">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={
            "px-4 py-1.5 rounded-full transition-all " +
            (mode === "login"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "text-slate-300 hover:text-slate-100")
          }
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={
            "px-4 py-1.5 rounded-full transition-all " +
            (mode === "register"
              ? "bg-sky-500 text-slate-950 font-semibold"
              : "text-slate-300 hover:text-slate-100")
          }
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div className="space-y-1">
          <label className="text-xs text-slate-300">SIT Email</label>
          <input
            type="email"
            required
            className="w-full border border-slate-700 rounded-lg px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="1si24is112@sit.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">Password</label>
          <input
            type="password"
            required
            className="w-full border border-slate-700 rounded-lg px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder={isRegister ? "Create a password (min 6 chars)" : "Enter your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isRegister && (
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full border border-slate-700 rounded-lg px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-sm font-medium hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
        >
          {loading
            ? isRegister
              ? "Creating account…"
              : "Signing in…"
            : isRegister
            ? "Register"
            : "Login"}
        </button>
      </form>

      {message && (
        <p className="text-xs text-slate-400 border border-slate-800 rounded-lg px-3 py-2 bg-slate-950/80">
          {message}</p>
      )}

      <p className="text-[11px] text-slate-500">
        New users: use <span className="font-mono">Register</span> to create your account.
        Then sign in anytime with <span className="font-mono">Login</span> using the same email and password.
      </p>
    </div>
  );
};

export default AuthCard;