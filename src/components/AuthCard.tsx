import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthCard = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    if (!email.endsWith("@sit.ac.in")) {
      setMessage("Use your @sit.ac.in college email.");
      return;
    }

    setMessage("Sending magic link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error(error);
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for the login link.");
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow max-w-sm mx-auto space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">Campus Login</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="your@sit.ac.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
        onClick={handleLogin}
      >
        Send Magic Link
      </button>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
};

export default AuthCard;
