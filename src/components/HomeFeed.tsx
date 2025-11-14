import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import FeedItemModal from "./FeedItemModal";

type FeedType = "issue" | "found" | "question" | "market" | "groupup";

type FeedItem = {
  id: string;
  refId: string;
  type: FeedType;
  title: string;
  description: string;
  created_at: string;
  meta?: string;
};

type ModuleView =
  | "issues"
  | "smartlost"
  | "peerconnect"
  | "marketplace"
  | "groupup";

interface HomeFeedProps {
  onOpenModule?: (view: ModuleView) => void;
}

const HomeFeed: React.FC<HomeFeedProps> = ({ onOpenModule }) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);

      try {
        const [
          issuesRes,
          foundRes,
          questionsRes,
          marketRes,
          groupupRes,
        ] = await Promise.all([
          supabase
            .from("issues")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("found_items")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("peer_questions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("market_listings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("groupup_posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        const list: FeedItem[] = [];

        if (!issuesRes.error && issuesRes.data) {
          for (const row of issuesRes.data as any[]) {
            list.push({
              id: `issue-${row.id}`,
              refId: row.id,
              type: "issue",
              title: row.title ?? "Issue",
              description: row.description ?? "",
              created_at: row.created_at,
              meta: row.status ? `Status: ${row.status}` : undefined,
            });
          }
        }

        if (!foundRes.error && foundRes.data) {
          for (const row of foundRes.data as any[]) {
            list.push({
              id: `found-${row.id}`,
              refId: row.id,
              type: "found",
              title: row.title ?? "Found item",
              description: row.description ?? "",
              created_at: row.created_at,
              meta: row.location ?? undefined,
            });
          }
        }

        if (!questionsRes.error && questionsRes.data) {
          for (const row of questionsRes.data as any[]) {
            list.push({
              id: `question-${row.id}`,
              refId: row.id,
              type: "question",
              title: row.title ?? "Question",
              description: row.body ?? "",
              created_at: row.created_at,
              meta:
                row.tags && row.tags.length
                  ? `Tags: ${row.tags.join(", ")}`
                  : undefined,
            });
          }
        }

        if (!marketRes.error && marketRes.data) {
          for (const row of marketRes.data as any[]) {
            list.push({
              id: `market-${row.id}`,
              refId: row.id,
              type: "market",
              title: row.title ?? "Listing",
              description: row.description ?? "",
              created_at: row.created_at,
              meta:
                (row.price != null ? `₹${row.price}` : "") +
                (row.category ? ` • ${row.category}` : ""),
            });
          }
        }

        if (!groupupRes.error && groupupRes.data) {
          for (const row of groupupRes.data as any[]) {
            list.push({
              id: `groupup-${row.id}`,
              refId: row.id,
              type: "groupup",
              title: row.title ?? "GroupUp post",
              description: row.description ?? "",
              created_at: row.created_at,
              meta: row.meetup_info ?? undefined,
            });
          }
        }

        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setItems(list);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  function badge(type: FeedType) {
    switch (type) {
      case "issue":
        return "Issue";
      case "found":
        return "Lost & Found";
      case "question":
        return "Q&A";
      case "market":
        return "Marketplace";
      case "groupup":
        return "GroupUp";
      default:
        return "Feed";
    }
  }

  function badgeColor(type: FeedType) {
    switch (type) {
      case "issue":
        return "bg-rose-500/15 text-rose-300 border border-rose-500/40";
      case "found":
        return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40";
      case "question":
        return "bg-indigo-500/15 text-indigo-300 border border-indigo-500/40";
      case "market":
        return "bg-amber-500/15 text-amber-300 border border-amber-500/40";
      case "groupup":
        return "bg-sky-500/15 text-sky-300 border border-sky-500/40";
      default:
        return "bg-slate-700 text-slate-200 border border-slate-500/60";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-sm shadow-xl shadow-slate-950/50 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Campus Feed
          </h2>
          <p className="text-xs text-slate-400">
            Live activity from issues, Lost &amp; Found, Q&amp;A, Marketplace,
            and GroupUp.
          </p>
        </div>
      </div>

      {loading && items.length === 0 && (
        <p className="text-xs text-slate-500">Loading feed…</p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-xs text-slate-500">
          Nothing yet. Raise an issue, ask a question, or create a listing to
          see it appear here.
        </p>
      )}

      <ul className="space-y-2 max-h-[480px] overflow-auto pr-1">
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="border border-slate-800/80 rounded-xl p-2 bg-slate-900/60 cursor-pointer hover:bg-slate-900 hover:border-slate-500 transition-all duration-150"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <span
                  className={
                    "inline-flex items-center text-[10px] px-2 py-0.5 rounded-full mb-1 " +
                    badgeColor(item.type)
                  }
                >
                  {badge(item.type)}
                </span>
                <p className="text-sm font-semibold text-slate-50">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.meta && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {item.meta}
                  </p>
                )}
              </div>

              <p className="text-[10px] text-slate-500">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {selectedItem && (
        <FeedItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onOpenModule={onOpenModule}
        />
      )}
    </div>
  );
};

export default HomeFeed;
