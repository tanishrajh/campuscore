import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface UserStatsProps {
  userId: string;
}

const UserStats: React.FC<UserStatsProps> = ({ userId }) => {
  const [points, setPoints] = useState<number>(0);
  const [issues, setIssues] = useState(0);
  const [answers, setAnswers] = useState(0);
  const [foundItems, setFoundItems] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const { data: userData } = await supabase
          .from("campus_users")
          .select("points")
          .eq("auth_uid", userId)
          .maybeSingle();

        if (userData) {
          setPoints(userData.points ?? 0);
        }

        const [{ count: issueCount }, { count: answerCount }, { count: foundCount }] =
          await Promise.all([
            supabase
              .from("issues")
              .select("*", { count: "exact", head: true })
              .eq("reporter_uid", userId),
            supabase
              .from("peer_answers")
              .select("*", { count: "exact", head: true })
              .eq("author_uid", userId),
            supabase
              .from("found_items")
              .select("*", { count: "exact", head: true })
              .eq("finder_uid", userId),
          ]);

        setIssues(issueCount ?? 0);
        setAnswers(answerCount ?? 0);
        setFoundItems(foundCount ?? 0);
      } catch (err) {
        console.error("Stats load error:", err);
      }
    }

    loadStats();
  }, [userId]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4">
      <h3 className="text-sm font-semibold text-slate-100 mb-3">
        Your contribution snapshot
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Points</p>
          <p className="text-xl font-semibold text-emerald-400 mt-1">
            {points}
          </p>
        </div>
        <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Issues reported</p>
          <p className="text-xl font-semibold text-slate-50 mt-1">
            {issues}
          </p>
        </div>
        <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Answers given</p>
          <p className="text-xl font-semibold text-slate-50 mt-1">
            {answers}
          </p>
        </div>
        <div className="border border-slate-800 rounded-xl p-3 bg-slate-900/70">
          <p className="text-[11px] text-slate-400">Items found</p>
          <p className="text-xl font-semibold text-slate-50 mt-1">
            {foundItems}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
