import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type CampusUser = {
  id: number;
  auth_uid: string;
  email: string | null;
  username: string | null;
  points: number | null;
  show_profile: boolean | null;
};

interface LeaderboardProps {
  currentUserId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<CampusUser[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchLeaderboard() {
    setLoading(true);

    const { data, error } = await supabase
      .from("campus_users")
      .select("id, auth_uid, email, username, points, show_profile")
      .order("points", { ascending: false })
      .limit(50);

    setLoading(false);

    if (error) {
      console.error("Error loading leaderboard:", error);
      return;
    }

    let list = (data as CampusUser[]) ?? [];

    // Only show: users who allow it, plus always yourself
    list = list.filter((u) => {
      if (u.auth_uid === currentUserId) return true;
      return u.show_profile ?? true;
    });

    setUsers(list);
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Campus Champions
          </h2>
          <p className="text-sm text-slate-400">
            Points for helping others: returning items, answering questions,
            posting useful content.
          </p>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && users.length === 0 && (
        <p className="text-xs text-slate-500">Loading leaderboard…</p>
      )}

      {users.length === 0 && !loading && (
        <p className="text-xs text-slate-500">
          No visible profiles yet. Update your profile and start helping others!
        </p>
      )}

      <ul className="space-y-1">
        {users.map((u, index) => {
          const isMe = u.auth_uid === currentUserId;
          const visible = u.show_profile ?? true;

          const displayName = visible
            ? u.username || u.email || "Campus student"
            : isMe
            ? "(You – hidden profile)"
            : "Hidden student";

          const pts = u.points ?? 0;

          return (
            <li
              key={u.id}
              className={
                "flex items-center justify-between border rounded-lg px-3 py-2 text-sm " +
                (isMe
                  ? "bg-emerald-950/60 border-emerald-500/60"
                  : "bg-slate-900/70 border-slate-800")
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 w-6 text-center">
                  #{index + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-50 truncate max-w-[180px]">
                    {displayName}
                  </p>
                  {isMe && (
                    <p className="text-[10px] text-slate-500">
                      Points count even if your profile is hidden.
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-emerald-400">
                {pts} pts
              </p>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-slate-500 mt-2">
        Control your visibility in{" "}
        <span className="font-semibold">Profile → Show my profile</span>.
      </p>
    </div>
  );
};

export default Leaderboard;
