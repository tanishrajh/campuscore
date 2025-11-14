import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface ProfileBarProps {
  userId: string;
}

type CampusUser = {
  id: number;
  auth_uid: string;
  email: string | null;
  username: string | null;
  bio: string | null;
  show_profile: boolean | null;
};

const ProfileBar: React.FC<ProfileBarProps> = ({ userId }) => {
  const [profile, setProfile] = useState<CampusUser | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [showProfile, setShowProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    const { data, error } = await supabase
      .from("campus_users")
      .select("*")
      .eq("auth_uid", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile load error:", error);
      return;
    }

    if (data) {
      setProfile(data as CampusUser);
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");
      setShowProfile(data.show_profile ?? true);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("campus_users")
        .update({
          username: username.trim() || null,
          bio: bio.trim() || null,
          show_profile: showProfile,
        })
        .eq("auth_uid", userId);

      if (error) throw error;

      await loadProfile();
    } catch (err) {
      console.error("Profile save error:", err);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-50">Profile</h2>

      <form onSubmit={handleSave} className="space-y-3 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-semibold text-lg">
              {profile?.username?.[0]?.toUpperCase() ??
                profile?.email?.[0]?.toUpperCase() ??
                "U"}
            </div>
            <div className="text-xs text-slate-400 break-all">
              <p className="text-slate-200 text-sm font-medium">
                {profile?.username || "Set a username"}
              </p>
              <p>{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <input
              className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Display name / username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <textarea
              className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              rows={2}
              placeholder="Short bio (branch, interests, clubs, etc.)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showProfile}
              onChange={(e) => setShowProfile(e.target.checked)}
              className="accent-sky-500"
            />
            Show my profile on leaderboard & GroupUp
          </label>

          <button
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 text-xs font-semibold hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60 transition-all"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileBar;
