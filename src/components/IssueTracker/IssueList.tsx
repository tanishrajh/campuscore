import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Issue = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  image_url: string | null;
  me_too_count: number | null;
  created_at: string;
};

const STATUSES = ["Submitted", "In Review", "In Progress", "Resolved"] as const;

const IssueList: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  async function fetchIssues() {
    setLoading(true);

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.error("Issues load error:", error);
      return;
    }

    setIssues((data as Issue[]) ?? []);
  }

  useEffect(() => {
    fetchIssues();
  }, []);

  async function handleStatusChange(issue: Issue, newStatus: string) {
    if (issue.status === newStatus) return;

    setUpdatingId(issue.id);

    const prev = issues;

    setIssues((current) =>
      current.map((i) =>
        i.id === issue.id ? { ...i, status: newStatus } : i
      )
    );

    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", issue.id);

    if (error) {
      console.error("Status update error:", error);
      setIssues(prev);
    }

    setUpdatingId(null);
  }

  async function handleMeToo(issue: Issue) {
    setVotingId(issue.id);
    const prevCount = issue.me_too_count ?? 0;
    const newCount = prevCount + 1;

    const prevIssues = issues;
    setIssues((current) =>
      current.map((i) =>
        i.id === issue.id ? { ...i, me_too_count: newCount } : i
      )
    );

    const { error } = await supabase
      .from("issues")
      .update({ me_too_count: newCount })
      .eq("id", issue.id);

    if (error) {
      console.error("MeToo update error:", error);
      setIssues(prevIssues);
    }

    setVotingId(null);
  }

  function statusChipClass(s: string, active: boolean) {
    const base =
      "px-3 py-1 rounded-full text-[11px] font-medium border transition-colors";
    if (!active) {
      return base + " bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500";
    }

    switch (s) {
      case "Submitted":
        return (
          base +
          " bg-slate-800 text-slate-100 border-slate-500"
        );
      case "In Review":
        return (
          base +
          " bg-amber-500/20 text-amber-200 border-amber-400"
        );
      case "In Progress":
        return (
          base +
          " bg-sky-500/20 text-sky-200 border-sky-400"
        );
      case "Resolved":
        return (
          base +
          " bg-emerald-500/20 text-emerald-200 border-emerald-400"
        );
      default:
        return (
          base +
          " bg-slate-800 text-slate-100 border-slate-500"
        );
    }
  }

  return (
    <div className="space-y-3">
      {loading && issues.length === 0 && (
        <p className="text-xs text-slate-500">Loading issues…</p>
      )}

      {!loading && issues.length === 0 && (
        <p className="text-xs text-slate-500">
          No issues reported yet. Be the first to submit one.
        </p>
      )}

      <ul className="space-y-3 max-h-[520px] overflow-auto pr-1">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="border border-slate-800 rounded-2xl p-3 bg-slate-950/80 shadow-sm shadow-slate-950/40"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {issue.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {issue.location || "Location not specified"} •{" "}
                  {new Date(issue.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end text-[11px] text-slate-400">
                <span className="uppercase tracking-wide mb-1">
                  Status
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-100 border border-slate-600">
                  {issue.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-200 mt-2">
              {issue.description}
            </p>

            {issue.image_url && (
              <img
                src={issue.image_url}
                alt={issue.title}
                className="mt-3 rounded-xl border border-slate-800 max-h-56 object-cover"
              />
            )}

            <div className="mt-3 flex flex-col gap-2">
              {/* Me Too + count */}
              <button
                onClick={() => handleMeToo(issue)}
                disabled={votingId === issue.id}
                className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-slate-900 text-slate-200 border border-slate-700 hover:border-sky-500 hover:bg-slate-800 disabled:opacity-60 transition-colors w-max"
              >
                <span>👍</span>
                <span>
                  Me too! ({issue.me_too_count ?? 0})
                </span>
              </button>

              {/* Status controls */}
              <div className="flex flex-wrap gap-2 items-center">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(issue, s)}
                    disabled={updatingId === issue.id}
                    className={statusChipClass(
                      s,
                      s === issue.status
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IssueList;
