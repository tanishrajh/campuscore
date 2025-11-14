import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type GroupUpPost = {
  id: string;
  creator_uid: string | null;
  title: string;
  description: string | null;
  tags: string[] | null;
  meetup_info: string | null;
  rsvp_count: number;
  created_at: string;
};

interface GroupUpProps {
  userId: string;
  onOpenChat?: (
    targetUserId: string,
    contextType: "groupup",
    contextId: string,
    title: string
  ) => void;
}

async function awardPointsToUser(uid: string | null, delta: number) {
  if (!uid) return;

  try {
    const { data, error } = await supabase
      .from("campus_users")
      .select("points")
      .eq("auth_uid", uid)
      .maybeSingle();

    if (error || !data) {
      console.error("GroupUp: fetch points error:", error);
      return;
    }

    const current = data.points ?? 0;

    const { error: updateError } = await supabase
      .from("campus_users")
      .update({ points: current + delta })
      .eq("auth_uid", uid);

    if (updateError) {
      console.error("GroupUp: update points error:", updateError);
    }
  } catch (err) {
    console.error("GroupUp: awardPoints unexpected error:", err);
  }
}

const EventFinderGroupUp: React.FC<GroupUpProps> = ({
  userId,
  onOpenChat,
}) => {
  const [groupPosts, setGroupPosts] = useState<GroupUpPost[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [grTitle, setGrTitle] = useState("");
  const [grDesc, setGrDesc] = useState("");
  const [grTags, setGrTags] = useState("");
  const [grMeetup, setGrMeetup] = useState("");
  const [postingGroup, setPostingGroup] = useState(false);
  const [grMsg, setGrMsg] = useState<string | null>(null);

  async function fetchGroupPosts() {
    setLoadingGroups(true);
    const { data, error } = await supabase
      .from("groupup_posts")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadingGroups(false);

    if (error) {
      console.error("Error fetching GroupUp posts:", error);
      return;
    }

    setGroupPosts((data as GroupUpPost[]) ?? []);
  }

  useEffect(() => {
    fetchGroupPosts();
  }, []);

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!grTitle.trim()) return;

    setPostingGroup(true);
    setGrMsg(null);

    try {
      const tagsArray = grTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const { error } = await supabase.from("groupup_posts").insert([
        {
          creator_uid: userId,
          title: grTitle.trim(),
          description: grDesc.trim() || null,
          tags: tagsArray.length ? tagsArray : null,
          meetup_info: grMeetup.trim() || null,
        },
      ]);

      if (error) throw error;

      // reward for creating a GroupUp post
      await awardPointsToUser(userId, 1);

      setGrMsg("Group post created ✅");
      setGrTitle("");
      setGrDesc("");
      setGrTags("");
      setGrMeetup("");

      await fetchGroupPosts();
    } catch (err: any) {
      console.error(err);
      setGrMsg("Error creating GroupUp post: " + err.message);
    } finally {
      setPostingGroup(false);
    }
  }

  async function handleGroupRSVP(gr: GroupUpPost) {
    const newCount = (gr.rsvp_count ?? 0) + 1;

    setGroupPosts((prev) =>
      prev.map((g) => (g.id === gr.id ? { ...g, rsvp_count: newCount } : g))
    );

    const { error } = await supabase
      .from("groupup_posts")
      .update({ rsvp_count: newCount })
      .eq("id", gr.id);

    if (error) {
      console.error("RSVP failed:", error);
      fetchGroupPosts();
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">GroupUp</h2>
      <p className="text-sm text-slate-400">
        Find people for hackathons, study sessions, workouts, gaming squads,
        and more — only within SIT.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Create GroupUp */}
        <section className="border border-slate-800 rounded-xl p-3 bg-slate-900/70 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Create a GroupUp post
          </h3>

          <form onSubmit={handleCreateGroup} className="space-y-2">
            <input
              className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Title (e.g., Looking for DevCon hackathon team)"
              value={grTitle}
              onChange={(e) => setGrTitle(e.target.value)}
            />

            <textarea
              className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              rows={2}
              placeholder="Describe what you're looking for..."
              value={grDesc}
              onChange={(e) => setGrDesc(e.target.value)}
            />

            <input
              className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Tags (e.g., hackathon, webdev, football)"
              value={grTags}
              onChange={(e) => setGrTags(e.target.value)}
            />

            <input
              className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Meetup info (e.g., Sat 7pm, Library steps)"
              value={grMeetup}
              onChange={(e) => setGrMeetup(e.target.value)}
            />

            <button
              disabled={postingGroup}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-lg text-sm hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
            >
              {postingGroup ? "Posting..." : "Post GroupUp"}
            </button>

            {grMsg && (
              <p className="text-xs text-slate-400 mt-1">{grMsg}</p>
            )}
          </form>
        </section>

        {/* RIGHT: List GroupUp posts */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Active GroupUp posts
          </h3>

          {loadingGroups && (
            <p className="text-xs text-slate-500">Loading groups...</p>
          )}

          {groupPosts.length === 0 && !loadingGroups && (
            <p className="text-xs text-slate-500">
              No GroupUp posts yet. Create one to find people.
            </p>
          )}

          <ul className="space-y-2 max-h-80 overflow-auto pr-1">
            {groupPosts.map((g) => (
              <li
                key={g.id}
                className="border border-slate-800 rounded-xl p-2 bg-slate-900/70 hover:border-sky-500/60 hover:bg-slate-900 transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-50">
                      {g.title}
                    </p>
                    {g.description && (
                      <p className="text-[11px] text-slate-300 mt-1">
                        {g.description}
                      </p>
                    )}
                    {g.meetup_info && (
                      <p className="text-[11px] text-slate-300 mt-1">
                        Meetup:{" "}
                        <span className="font-medium text-slate-100">
                          {g.meetup_info}
                        </span>
                      </p>
                    )}
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {(g.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {new Date(g.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <button
                    onClick={() => handleGroupRSVP(g)}
                    className="text-[11px] px-3 py-1 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    I&apos;m interested ({g.rsvp_count})
                  </button>

                  {onOpenChat &&
                    g.creator_uid &&
                    g.creator_uid !== userId && (
                      <button
                        onClick={() =>
                          onOpenChat(
                            g.creator_uid!,
                            "groupup",
                            g.id,
                            g.title
                          )
                        }
                        className="text-[11px] px-3 py-1 rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors"
                      >
                        Message
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default EventFinderGroupUp;
