import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

async function awardPointsToUser(uid: string | null, delta: number) {
  if (!uid) return;

  try {
    const { data, error } = await supabase
      .from("campus_users")
      .select("points")
      .eq("auth_uid", uid)
      .maybeSingle();

    if (error || !data) {
      console.error("IssueForm: fetch points error:", error);
      return;
    }

    const current = data.points ?? 0;

    const { error: updateError } = await supabase
      .from("campus_users")
      .update({ points: current + delta })
      .eq("auth_uid", uid);

    if (updateError) {
      console.error("IssueForm: update points error:", updateError);
    }
  } catch (err) {
    console.error("IssueForm: awardPoints unexpected error:", err);
  }
}

const IssueForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // grab current user so we can store reporter_uid
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      let imageUrl: string | null = null;

      if (file) {
        const path = `issues/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from("campuscore")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data } = supabase
          .storage
          .from("campuscore")
          .getPublicUrl(path);

        imageUrl = data.publicUrl;
      }

      const { error } = await supabase.from("issues").insert([
        {
          title: title.trim(),
          description: description.trim(),
          location: location.trim() || null,
          status: "Submitted",
          image_url: imageUrl,
          reporter_uid: userId,
        },
      ]);

      if (error) throw error;

      // small reward for reporting a problem
      await awardPointsToUser(userId, 1);

      setTitle("");
      setDescription("");
      setLocation("");
      setFile(null);
      setMessage("Issue reported ✅");
    } catch (err: any) {
      console.error("Issue submit error:", err);
      setMessage("Failed to submit issue: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <input
        className="w-full border border-slate-700 rounded-lg px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        placeholder="Title (e.g., Wi-Fi down in ECE)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border border-slate-700 rounded-lg px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        rows={4}
        placeholder="Describe the issue"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border border-slate-700 rounded-lg px-3 py-2 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        placeholder="Location (e.g., ECE Block)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <div className="space-y-1 text-xs text-slate-300">
        <p>Optional photo</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-xs text-slate-400"
        />
      </div>

      <button
        disabled={submitting}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white text-sm font-medium hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
      >
        {submitting ? "Submitting…" : "Submit issue"}
      </button>

      {message && (
        <p className="text-xs text-slate-400 mt-1">{message}</p>
      )}
    </form>
  );
};

export default IssueForm;
