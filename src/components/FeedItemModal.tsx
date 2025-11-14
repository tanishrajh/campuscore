import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type FeedType = "issue" | "found" | "question" | "market" | "groupup";

type ModuleView =
  | "issues"
  | "smartlost"
  | "peerconnect"
  | "marketplace"
  | "groupup";

interface FeedItemModalProps {
  item: {
    id: string;
    type: FeedType;
    refId: string;
  } | null;
  onClose: () => void;
  onOpenModule?: (view: ModuleView) => void;
}

type QuestionDetails = {
  question: any;
  answers: any[];
};

const FeedItemModal: React.FC<FeedItemModalProps> = ({
  item,
  onClose,
  onOpenModule,
}) => {
  const [data, setData] = useState<any | QuestionDetails | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDetails() {
    if (!item) return;
    setLoading(true);

    try {
      switch (item.type) {
        case "issue": {
          const { data, error } = await supabase
            .from("issues")
            .select("*")
            .eq("id", item.refId)
            .maybeSingle();
          if (!error) setData(data);
          break;
        }

        case "found": {
          const { data, error } = await supabase
            .from("found_items")
            .select("*")
            .eq("id", item.refId)
            .maybeSingle();
          if (!error) setData(data);
          break;
        }

        case "question": {
          const { data: q, error: qErr } = await supabase
            .from("peer_questions")
            .select("*")
            .eq("id", item.refId)
            .maybeSingle();

          let answers: any[] = [];
          if (!qErr && q) {
            const { data: a, error: aErr } = await supabase
              .from("peer_answers")
              .select("*")
              .eq("question_id", item.refId)
              .order("created_at", { ascending: true });

            if (!aErr && a) answers = a as any[];
          }

          if (!qErr && q) setData({ question: q, answers });
          break;
        }

        case "market": {
          const { data, error } = await supabase
            .from("market_listings")
            .select("*")
            .eq("id", item.refId)
            .maybeSingle();
          if (!error) setData(data);
          break;
        }

        case "groupup": {
          const { data, error } = await supabase
            .from("groupup_posts")
            .select("*")
            .eq("id", item.refId)
            .maybeSingle();
          if (!error) setData(data);
          break;
        }
      }
    } catch (err) {
      console.error("Modal load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (item) {
      setData(null);
      loadDetails();
    }
  }, [item]);

  if (!item) return null;

  const close = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onClose();
  };

  const renderCommonHeader = (title?: string, description?: string) => (
    <>
      {title && (
        <p className="text-base font-semibold text-slate-50">{title}</p>
      )}
      {description && (
        <p className="text-sm text-slate-300 mt-1">{description}</p>
      )}
    </>
  );

  function moduleForType(type: FeedType): ModuleView | null {
    switch (type) {
      case "issue":
        return "issues";
      case "found":
        return "smartlost";
      case "question":
        return "peerconnect";
      case "market":
        return "marketplace";
      case "groupup":
        return "groupup";
      default:
        return null;
    }
  }

  const moduleView = moduleForType(item.type);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl shadow-black/60 max-w-lg w-full p-4 space-y-3 animate-[fadeIn_0.15s_ease-out]"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-300 tracking-wide uppercase">
            {item.type === "issue" && "Issue details"}
            {item.type === "found" && "Found item"}
            {item.type === "question" && "Question"}
            {item.type === "market" && "Marketplace listing"}
            {item.type === "groupup" && "GroupUp post"}
          </h3>

          <button
            onClick={close}
            className="px-2 py-1 text-slate-400 hover:text-slate-100 text-sm rounded-full hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {loading && (
          <p className="text-sm text-slate-400">Loading…</p>
        )}

        {/* NON-QUESTION TYPES */}
        {!loading && data && item.type !== "question" && (
          <div className="space-y-3">
            {renderCommonHeader(data.title, data.description)}

            {item.type === "issue" && (
              <>
                <p className="text-xs text-slate-400">
                  Status:{" "}
                  <span className="font-medium text-slate-100">
                    {data.status}
                  </span>
                </p>
                {data.image_url && (
                  <img
                    src={data.image_url}
                    className="w-full rounded-xl border border-slate-700 mt-2"
                  />
                )}
              </>
            )}

            {item.type === "found" && (
              <>
                {data.photo_url && (
                  <img
                    src={data.photo_url}
                    className="w-full h-48 object-cover rounded-xl border border-slate-700 mt-2"
                  />
                )}
                {data.location && (
                  <p className="text-sm text-slate-300 mt-1">
                    Location:{" "}
                    <span className="font-medium">
                      {data.location}
                    </span>
                  </p>
                )}
                {data.tags && (
                  <p className="text-xs text-slate-400 mt-1">
                    Tags: {data.tags.join(", ")}
                  </p>
                )}
              </>
            )}

            {item.type === "market" && (
              <>
                {data.photo_url && (
                  <img
                    src={data.photo_url}
                    className="w-full h-48 object-cover rounded-xl border border-slate-700 mt-2"
                  />
                )}
                {data.price != null && (
                  <p className="text-lg font-semibold text-emerald-400 mt-1">
                    ₹{data.price}
                  </p>
                )}
                {data.category && (
                  <p className="text-xs text-slate-400 mt-1">
                    Category: {data.category}
                  </p>
                )}
              </>
            )}

            {item.type === "groupup" && (
              <>
                {data.meetup_info && (
                  <p className="text-sm text-slate-300 mt-1">
                    Meetup:{" "}
                    <span className="font-medium">
                      {data.meetup_info}
                    </span>
                  </p>
                )}
                {data.tags && (
                  <p className="text-xs text-slate-400 mt-1">
                    Tags: {data.tags.join(", ")}
                  </p>
                )}
              </>
            )}

            <p className="text-[10px] text-slate-500 mt-3">
              Posted on: {new Date(data.created_at).toLocaleString()}
            </p>
          </div>
        )}

        {/* QUESTION */}
        {!loading && data && item.type === "question" && (
          <div className="space-y-3">
            {(() => {
              const q = (data as QuestionDetails).question;
              const answers = (data as QuestionDetails).answers;

              return (
                <>
                  <p className="text-base font-semibold text-slate-50">
                    {q.title}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    {q.body}
                  </p>
                  {q.tags && (
                    <p className="text-xs text-slate-400 mt-1">
                      Tags: {q.tags.join(", ")}
                    </p>
                  )}

                  <h4 className="font-semibold text-sm mt-3 text-slate-200">
                    Answers
                  </h4>
                  <div className="max-h-48 overflow-auto text-sm space-y-2">
                    {answers.length > 0 ? (
                      answers.map((ans) => (
                        <div
                          key={ans.id}
                          className="border border-slate-700 rounded-lg p-2 bg-slate-900/70"
                        >
                          <p className="text-slate-200">{ans.body}</p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(
                              ans.created_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No answers yet.
                      </p>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 mt-3">
                    Posted on: {new Date(q.created_at).toLocaleString()}
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-1">
          <p className="text-[11px] text-slate-500">
            View full details in the respective module.
          </p>
          {moduleView && onOpenModule && (
            <button
              onClick={() => {
                onOpenModule(moduleView);
                onClose();
              }}
              className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-400 hover:to-sky-400 transition-all"
            >
              Open module
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedItemModal;
