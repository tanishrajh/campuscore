import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type ChatContextType = "market" | "found" | "groupup";

export type ChatTarget = {
  targetUserId: string;
  contextType: ChatContextType;
  contextId: string;
  contextTitle: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_uid: string;
  body: string;
  created_at: string;
};

interface ChatPanelProps {
  currentUserId: string;
  target: ChatTarget; // <- no longer nullable
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  currentUserId,
  target,
  onClose,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [otherName, setOtherName] = useState<string>("Student");

  useEffect(() => {
    async function setup() {
      setLoading(true);

      try {
        // load other user's profile
        const { data: profile } = await supabase
          .from("campus_users")
          .select("username, email")
          .eq("auth_uid", target.targetUserId)
          .maybeSingle();

        if (profile) {
          setOtherName(
            profile.username || profile.email || "Campus student"
          );
        } else {
          setOtherName("Campus student");
        }

        const [userA, userB] =
          currentUserId < target.targetUserId
            ? [currentUserId, target.targetUserId]
            : [target.targetUserId, currentUserId];

        // check for existing conversation
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_a", userA)
          .eq("user_b", userB)
          .eq("context_type", target.contextType)
          .eq("context_id", target.contextId)
          .maybeSingle();

        let convId: string | null = existing?.id ?? null;

        // create if missing
        if (!convId) {
          const { data: created, error: createErr } = await supabase
            .from("conversations")
            .insert([
              {
                user_a: userA,
                user_b: userB,
                context_type: target.contextType,
                context_id: target.contextId,
                title: target.contextTitle,
              },
            ])
            .select("id")
            .single();

          if (createErr) {
            console.error("Create conversation error:", createErr);
          } else {
            convId = created.id;
          }
        }

        if (!convId) {
          setConversationId(null);
          setMessages([]);
          return;
        }

        setConversationId(convId);

        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true });

        setMessages((msgs as Message[]) ?? []);
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    }

    setup();
  }, [target, currentUserId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!conversationId) return;

    const text = input.trim();
    if (!text) return;

    setSending(true);
    setInput("");

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            sender_uid: currentUserId,
            body: text,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data as Message]);
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  }

  const contextLabel =
    target.contextType === "market"
      ? "Marketplace"
      : target.contextType === "found"
      ? "Lost & Found"
      : "GroupUp";

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md">
      <div className="bg-slate-950/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl shadow-black/60 flex flex-col h-96 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
          <div className="text-sm">
            <p className="font-semibold text-slate-50">{otherName}</p>
            <p className="text-[11px] text-slate-400">
              {contextLabel}: {target.contextTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-sm px-2 py-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-auto px-3 py-2 bg-slate-950/40 space-y-2">
          {loading && (
            <p className="text-xs text-slate-500">Loading chat…</p>
          )}

          {!loading && messages.length === 0 && (
            <p className="text-xs text-slate-500">
              Start the conversation 👋
            </p>
          )}

          {messages.map((m) => {
            const isMe = m.sender_uid === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={
                    "max-w-[75%] px-3 py-1.5 rounded-2xl text-xs " +
                    (isMe
                      ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm shadow-sky-900/70"
                      : "bg-slate-900 border border-slate-700 text-slate-100")
                  }
                >
                  <p>{m.body}</p>
                  <p className="text-[9px] mt-0.5 opacity-70">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* INPUT */}
        <form
          onSubmit={handleSend}
          className="border-t border-slate-800 px-2 py-2 flex items-center gap-2 bg-slate-950/80"
        >
          <input
            className="flex-1 border border-slate-700 rounded-full px-3 py-1.5 text-xs bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            disabled={sending || !conversationId}
            className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white disabled:opacity-50 hover:from-indigo-400 hover:to-sky-400 transition-all"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
