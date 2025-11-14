import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Question = {
  id: string;
  author_uid: string | null;
  title: string;
  body: string;
  tags: string[] | null;
  created_at: string;
  best_answer_id: string | null;
};

type Answer = {
  id: string;
  question_id: string;
  author_uid: string | null;
  body: string;
  upvotes: number;
  created_at: string;
};

interface PeerConnectProps {
  userId: string;
}

const PeerConnect: React.FC<PeerConnectProps> = ({ userId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const [newQTitle, setNewQTitle] = useState("");
  const [newQBody, setNewQBody] = useState("");
  const [newQTags, setNewQTags] = useState("");

  const [newAnswerBody, setNewAnswerBody] = useState("");
  const [postingQ, setPostingQ] = useState(false);
  const [postingA, setPostingA] = useState(false);

  async function fetchQuestions() {
    setLoadingQuestions(true);

    const { data, error } = await supabase
      .from("peer_questions")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadingQuestions(false);

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }

    setQuestions((data as Question[]) ?? []);
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchAnswers(questionId: string) {
    setLoadingAnswers(true);

    const { data, error } = await supabase
      .from("peer_answers")
      .select("*")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    setLoadingAnswers(false);

    if (error) {
      console.error("Error fetching answers:", error);
      return;
    }

    setAnswers((data as Answer[]) ?? []);
  }

  async function selectQuestion(q: Question) {
    setSelectedQuestion(q);
    await fetchAnswers(q.id);
  }

  async function awardPointsToUser(answerAuthorUid: string | null, delta: number) {
    if (!answerAuthorUid) return;

    try {
      const { data, error } = await supabase
        .from("campus_users")
        .select("points")
        .eq("auth_uid", answerAuthorUid)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching user points:", error);
        return;
      }

      const currentPoints = data.points ?? 0;

      const { error: updateError } = await supabase
        .from("campus_users")
        .update({ points: currentPoints + delta })
        .eq("auth_uid", answerAuthorUid);

      if (updateError) {
        console.error("Error updating user points:", updateError);
      }
    } catch (err) {
      console.error("awardPointsToUser unexpected error:", err);
    }
  }

  async function handleAskQuestion(e: React.FormEvent) {
    e.preventDefault();

    if (!newQTitle.trim() || !newQBody.trim()) return;

    setPostingQ(true);

    try {
      const tags = newQTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const { error } = await supabase.from("peer_questions").insert([
        {
          author_uid: userId,
          title: newQTitle.trim(),
          body: newQBody.trim(),
          tags: tags.length ? tags : null,
        },
      ]);

      if (error) throw error;

      await awardPointsToUser(userId, 1); // asking question

      setNewQTitle("");
      setNewQBody("");
      setNewQTags("");
      await fetchQuestions();
    } catch (err) {
      console.error("Error posting question:", err);
      alert("Failed to post question.");
    } finally {
      setPostingQ(false);
    }
  }

  async function handlePostAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!newAnswerBody.trim()) return;

    setPostingA(true);

    try {
      const { error } = await supabase.from("peer_answers").insert([
        {
          question_id: selectedQuestion.id,
          author_uid: userId,
          body: newAnswerBody.trim(),
        },
      ]);

      if (error) throw error;

      await awardPointsToUser(userId, 2); // answering

      setNewAnswerBody("");
      await fetchAnswers(selectedQuestion.id);
    } catch (err) {
      console.error("Error posting answer:", err);
      alert("Failed to post answer.");
    } finally {
      setPostingA(false);
    }
  }

  async function handleUpvote(a: Answer) {
    const newUpvotes = (a.upvotes ?? 0) + 1;

    setAnswers((prev) =>
      prev.map((ans) =>
        ans.id === a.id ? { ...ans, upvotes: newUpvotes } : ans
      )
    );

    const { error } = await supabase
      .from("peer_answers")
      .update({ upvotes: newUpvotes })
      .eq("id", a.id);

    if (error) {
      console.error("Error upvoting:", error);
      if (selectedQuestion) fetchAnswers(selectedQuestion.id);
    }
  }

  async function handleMarkBest(a: Answer) {
    if (!selectedQuestion) return;

    if (selectedQuestion.author_uid !== userId) {
      alert("Only the person who asked the question can mark best answer.");
      return;
    }

    try {
      const { error } = await supabase
        .from("peer_questions")
        .update({ best_answer_id: a.id })
        .eq("id", selectedQuestion.id);

      if (error) {
        console.error("Failed to mark best answer:", error);
        alert("Failed to mark best answer.");
        return;
      }

      const updated = { ...selectedQuestion, best_answer_id: a.id };
      setSelectedQuestion(updated);
      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q))
      );

      await awardPointsToUser(a.author_uid, 10); // best answer
    } catch (err) {
      console.error("Error in handleMarkBest:", err);
      alert("Failed to mark best answer.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">
        PeerConnect – Academic Q&amp;A
      </h2>
      <p className="text-sm text-slate-400">
        Ask doubts, answer others, and climb the campus scoreboard – like a
        mini StackOverflow only for SIT.
      </p>

      {/* ASK QUESTION */}
      <section className="border border-slate-800 rounded-xl p-3 bg-slate-900/70 space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">
          Ask a question
        </h3>

        <form onSubmit={handleAskQuestion} className="space-y-2">
          <input
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Title (e.g., How to prepare for DSA?)"
            value={newQTitle}
            onChange={(e) => setNewQTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            rows={3}
            placeholder="Explain your doubt in detail..."
            value={newQBody}
            onChange={(e) => setNewQBody(e.target.value)}
          />
          <input
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Tags (comma separated: dsa, python, 3rd sem)"
            value={newQTags}
            onChange={(e) => setNewQTags(e.target.value)}
          />

          <button
            disabled={postingQ}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-lg text-sm hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
          >
            {postingQ ? "Posting..." : "Post question"}
          </button>
        </form>
      </section>

      {/* QUESTIONS + ANSWERS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Question list */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Recent questions
          </h3>

          {loadingQuestions && (
            <p className="text-xs text-slate-500">Loading…</p>
          )}

          {questions.length === 0 && !loadingQuestions && (
            <p className="text-xs text-slate-500">No questions yet.</p>
          )}

          <ul className="space-y-2 max-h-80 overflow-auto pr-1">
            {questions.map((q) => (
              <li
                key={q.id}
                className={`border rounded-lg p-2 cursor-pointer transition-all text-xs ${
                  selectedQuestion?.id === q.id
                    ? "bg-slate-900 border-sky-600/70"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-900"
                }`}
                onClick={() => selectQuestion(q)}
              >
                <p className="font-semibold text-slate-50 text-sm">
                  {q.title}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                  {q.body}
                </p>

                <div className="flex justify-between mt-1 items-end">
                  <p className="text-[10px] text-slate-500">
                    {new Date(q.created_at).toLocaleString()}
                  </p>

                  <div className="flex gap-1 flex-wrap justify-end">
                    {(q.tags ?? []).map((t) => (
                      <span
                        key={t}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Question details */}
        <div>
          {!selectedQuestion && (
            <p className="text-xs text-slate-500">
              Select a question to view answers.
            </p>
          )}

          {selectedQuestion && (
            <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/70 space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-50 text-sm">
                  {selectedQuestion.title}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  {selectedQuestion.body}
                </p>
                <div className="mt-1 flex gap-1 flex-wrap">
                  {(selectedQuestion.tags ?? []).map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Answers list */}
              <div className="border-t border-slate-800 pt-2 space-y-2">
                <p className="text-xs font-semibold text-slate-200">
                  Answers
                </p>

                {loadingAnswers && (
                  <p className="text-xs text-slate-500">Loading…</p>
                )}

                {answers.length === 0 && !loadingAnswers && (
                  <p className="text-xs text-slate-500">
                    No answers yet. Be the first to help.
                  </p>
                )}

                <ul className="space-y-2">
                  {answers.map((a) => {
                    const isBest = selectedQuestion.best_answer_id === a.id;
                    return (
                      <li
                        key={a.id}
                        className={
                          "border rounded p-2 text-xs " +
                          (isBest
                            ? "bg-emerald-950/60 border-emerald-600/70"
                            : "bg-slate-900/70 border-slate-800")
                        }
                      >
                        <p className="text-slate-100">{a.body}</p>

                        <div className="flex justify-between mt-1 items-center">
                          <p className="text-[10px] text-slate-500">
                            {new Date(a.created_at).toLocaleString()}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpvote(a)}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700"
                            >
                              👍 {a.upvotes}
                            </button>

                            <button
                              onClick={() => handleMarkBest(a)}
                              className={
                                "text-[11px] px-2 py-0.5 rounded-full " +
                                (isBest
                                  ? "bg-emerald-500 text-slate-950"
                                  : "bg-slate-800 text-slate-100 hover:bg-slate-700")
                              }
                            >
                              {isBest ? "Best answer" : "Mark best"}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Answer form */}
              <form
                onSubmit={handlePostAnswer}
                className="border-t border-slate-800 pt-2 space-y-2"
              >
                <textarea
                  className="w-full border border-slate-700 rounded-lg p-2 text-xs bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                  rows={2}
                  placeholder="Write your answer..."
                  value={newAnswerBody}
                  onChange={(e) => setNewAnswerBody(e.target.value)}
                />
                <button
                  disabled={postingA}
                  className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 rounded-full text-xs hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60 transition-all"
                >
                  {postingA ? "Posting…" : "Post answer"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PeerConnect;
