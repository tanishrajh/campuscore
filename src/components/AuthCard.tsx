import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthCard: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setMessage(
        "Magic link sent! Check your SIT email on this device and open the link."
      );
    } catch (err: any) {
      console.error("Auth error:", err);
      setMessage("Failed to send magic link: " + err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-2xl shadow-black/60 p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          Sign in to CampusCore
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Use your SIT email (USN@sit.ac.in). We&apos;ll send you a magic link
          – no password needed.
        </p>
      </div>

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

        <button
          type="submit"
          disabled={sending}
          className="w-full mt-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-sm font-medium hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
        >
          {sending ? "Sending magic link…" : "Send magic link"}
        </button>
      </form>

      {message && (
        <p className="text-xs text-slate-400 border border-slate-800 rounded-lg px-3 py-2 bg-slate-950/80">
          {message}
        </p>
      )}

      <p className="text-[11px] text-slate-500">
        Tip: open this site and your SIT mail on the same device while testing.
      </p>
    </div>
  );
};

export default AuthCard;
