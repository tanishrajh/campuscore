import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import AuthCard from "./components/AuthCard";
import IssueForm from "./components/IssueTracker/IssueForm";
import IssueList from "./components/IssueTracker/IssueList";
import ProfileBar from "./components/ProfileBar";
import SmartLost from "./components/SmartLost/SmartLost";
import PeerConnect from "./components/PeerConnect/PeerConnect";
import Marketplace from "./components/Marketplace/Marketplace";
import EventFinderGroupUp from "./components/Events/EventFinderGroupUp";
import HomeFeed from "./components/HomeFeed";
import Leaderboard from "./components/Leaderboard";
import UserStats from "./components/UserStats";
import ChatPanel from "./components/ChatPanel";

type View =
  | "home"
  | "issues"
  | "smartlost"
  | "peerconnect"
  | "marketplace"
  | "groupup"
  | "leaderboard"
  | "profile";

type ChatContextType = "market" | "found" | "groupup";

type ChatTarget = {
  targetUserId: string;
  contextType: ChatContextType;
  contextId: string;
  contextTitle: string;
};

type ModuleView =
  | "issues"
  | "smartlost"
  | "peerconnect"
  | "marketplace"
  | "groupup";

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<View>("home");
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);

  // create campus_users row if missing
  async function createUserProfileIfNotExists(user: any) {
    try {
      const { data, error } = await supabase
        .from("campus_users")
        .select("*")
        .eq("auth_uid", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        return;
      }

      if (data) return;

      const { email } = user;

      const { error: insertError } = await supabase.from("campus_users").insert([
        {
          auth_uid: user.id,
          email,
        },
      ]);

      if (insertError) {
        console.error("Profile insert error:", insertError);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) createUserProfileIfNotExists(sessionUser);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        if (sessionUser) createUserProfileIfNotExists(sessionUser);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setActiveView("home");
    setChatTarget(null);
  }

  // open chat helper
  function handleOpenChat(
    targetUserId: string,
    contextType: ChatContextType,
    contextId: string,
    title: string
  ) {
    setChatTarget({
      targetUserId,
      contextType,
      contextId,
      contextTitle: title,
    });
  }

  // navigation from feed modal
  function handleOpenModuleFromFeed(view: ModuleView) {
    setActiveView(view);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-50">
        <AuthCard />
      </div>
    );
  }

  // PAGE CONTENT
  let content: React.ReactNode = null;

  switch (activeView) {
    case "home":
      content = <HomeFeed onOpenModule={handleOpenModuleFromFeed} />;
      break;
    case "issues":
      content = (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm shadow-lg shadow-slate-950/40 p-4">
            <h2 className="text-lg font-semibold mb-2 text-slate-50">
              Report an issue
            </h2>
            <IssueForm />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm shadow-lg shadow-slate-950/40 p-4">
            <h2 className="text-lg font-semibold mb-2 text-slate-50">
              Campus issues dashboard
            </h2>
            <IssueList />
          </div>
        </section>
      );
      break;
    case "smartlost":
      content = (
        <SmartLost userId={user.id} onOpenChat={handleOpenChat} />
      );
      break;
    case "peerconnect":
      content = <PeerConnect userId={user.id} />;
      break;
    case "marketplace":
      content = (
        <Marketplace userId={user.id} onOpenChat={handleOpenChat} />
      );
      break;
    case "groupup":
      content = (
        <EventFinderGroupUp
          userId={user.id}
          onOpenChat={handleOpenChat}
        />
      );
      break;
    case "leaderboard":
      content = <Leaderboard currentUserId={user.id} />;
      break;
    case "profile":
      content = (
        <div className="space-y-4">
          <ProfileBar userId={user.id} />
          <UserStats userId={user.id} />
        </div>
      );
      break;
  }

  const navItems: { id: View; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "issues", label: "Issues" },
    { id: "smartlost", label: "SmartLost" },
    { id: "peerconnect", label: "PeerConnect" },
    { id: "marketplace", label: "Marketplace" },
    { id: "groupup", label: "GroupUp" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                CampusCore
              </span>{" "}
              <span className="text-slate-400 text-base align-middle">
                Smart Campus Hub
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              A unified, student-first portal for SIT – lost &amp; found,
              Q&amp;A, marketplace, groups and more.
            </p>
          </div>

          {/* Profile button */}
          <div className="relative self-end sm:self-auto">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700 shadow-lg shadow-slate-950/40 hover:border-slate-500 hover:bg-slate-900 transition-all duration-150"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center text-xs font-semibold">
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </span>
              <span className="hidden sm:inline text-slate-100 max-w-[160px] truncate text-xs">
                {user.email}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 text-sm z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setActiveView("profile");
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors text-slate-100 text-xs"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* NAVBAR */}
        <nav className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-sm shadow-lg shadow-slate-950/40 px-2 py-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setProfileOpen(false);
                }}
                className={
                  "px-3 py-1.5 rounded-full text-[11px] sm:text-xs transition-all duration-150 whitespace-nowrap " +
                  (activeView === item.id
                    ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-slate-50 shadow-sm shadow-sky-900/60"
                    : "text-slate-300 hover:bg-slate-800")
                }
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                setActiveView("profile");
                setProfileOpen(false);
              }}
              className={
                "ml-2 px-3 py-1.5 rounded-full text-[11px] sm:text-xs transition-all duration-150 whitespace-nowrap " +
                (activeView === "profile"
                  ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-50 shadow-sm shadow-emerald-900/60"
                  : "text-slate-300 hover:bg-slate-800")
              }
            >
              Profile
            </button>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="mt-1 sm:mt-2">{content}</main>
      </div>

      {/* CHAT PANEL */}
      {chatTarget && (
        <ChatPanel
          currentUserId={user.id}
          target={chatTarget}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}

export default App;
