import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface SmartLostProps {
  userId: string;
  onOpenChat?: (
    targetUserId: string,
    contextType: "found",
    contextId: string,
    title: string
  ) => void;
}

type FoundItem = {
  id: string;
  finder_uid: string | null;
  title: string;
  description: string | null;
  location: string | null;
  tags: string[] | null;
  photo_url: string | null;
  is_returned: boolean | null;
  created_at: string;
  returned_at: string | null;
};

const SmartLost: React.FC<SmartLostProps> = ({ userId, onOpenChat }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<FoundItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  async function awardPointsToUser(uid: string | null, delta: number) {
    if (!uid) return;

    try {
      const { data, error } = await supabase
        .from("campus_users")
        .select("points")
        .eq("auth_uid", uid)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching user points:", error);
        return;
      }

      const current = data.points ?? 0;

      const { error: updateError } = await supabase
        .from("campus_users")
        .update({ points: current + delta })
        .eq("auth_uid", uid);

      if (updateError) {
        console.error("Error updating user points:", updateError);
      }
    } catch (err) {
      console.error("awardPointsToUser (SmartLost) error:", err);
    }
  }

  async function fetchFoundItems() {
    setLoadingItems(true);

    const { data, error } = await supabase
      .from("found_items")
      .select("*")
      .eq("is_returned", false)
      .order("created_at", { ascending: false });

    setLoadingItems(false);

    if (error) {
      console.error("Error loading found_items:", error);
      return;
    }

    setItems((data as FoundItem[]) ?? []);
  }

  useEffect(() => {
    fetchFoundItems();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      let photoUrl: string | null = null;

      if (file) {
        const filePath = `found/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from("campuscore")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase
          .storage
          .from("campuscore")
          .getPublicUrl(filePath);

        photoUrl = data.publicUrl;
      }

      const tagsArray = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const { error } = await supabase.from("found_items").insert([
        {
          finder_uid: userId,
          title: title.trim(),
          description: desc.trim() || null,
          location: location.trim() || null,
          tags: tagsArray.length ? tagsArray : null,
          photo_url: photoUrl,
          is_returned: false,
        },
      ]);

      if (error) throw error;

      setMessage("Found item posted ✅");
      setTitle("");
      setDesc("");
      setLocation("");
      setTags("");
      setFile(null);

      await fetchFoundItems();
    } catch (err: any) {
      console.error(err);
      setMessage("Error posting item: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMarkReturned(item: FoundItem) {
    if (item.finder_uid !== userId) {
      alert("Only the person who posted this item can mark it as returned.");
      return;
    }

    try {
      const { error } = await supabase
        .from("found_items")
        .update({
          is_returned: true,
          returned_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (error) throw error;

      await awardPointsToUser(item.finder_uid, 5);
      await fetchFoundItems();
    } catch (err) {
      console.error("Error marking returned:", err);
      alert("Failed to mark as returned.");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">
        SmartLost – Lost &amp; Found
      </h2>
      <p className="text-sm text-slate-400">
        Post items you&apos;ve found on campus so owners can locate them.
        When an item is returned, mark it as{" "}
        <span className="font-semibold text-emerald-300">Returned</span> to
        earn leaderboard points.
      </p>

      {/* FOUND ITEM FORM */}
      <section className="border border-slate-800 rounded-xl p-3 bg-slate-900/70 space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">
          I found something
        </h3>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Title (e.g., Brown wallet, C-block stairs)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            rows={2}
            placeholder="Description (brand, colour, any special marks)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <input
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Where did you find it? (e.g., near ECE block stairs)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Tags (comma separated: wallet, brown, girls hostel)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-slate-400"
          />

          <button
            disabled={submitting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-lg text-sm hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
          >
            {submitting ? "Posting…" : "Post found item"}
          </button>

          {message && (
            <p className="text-xs text-slate-400 mt-1">{message}</p>
          )}
        </form>
      </section>

      {/* OPEN FOUND ITEMS */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">
          Items waiting to be claimed
        </h3>

        {loadingItems && (
          <p className="text-xs text-slate-500">Loading items…</p>
        )}

        {!loadingItems && items.length === 0 && (
          <p className="text-xs text-slate-500">
            No open found items right now.
          </p>
        )}

        <ul className="space-y-2 max-h-80 overflow-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="border border-slate-800 rounded-xl p-2 bg-slate-900/70 flex gap-2 hover:border-sky-500/60 hover:bg-slate-900 transition-all"
            >
              {item.photo_url && (
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                />
              )}

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-50">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1">
                    {item.description}
                  </p>
                )}
                {item.location && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found at:{" "}
                    <span className="text-slate-200">
                      {item.location}
                    </span>
                  </p>
                )}
                {item.tags && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tags: {item.tags.join(", ")}
                  </p>
                )}

                <div className="flex justify-between items-center mt-2 gap-2">
                  <p className="text-[10px] text-slate-500">
                    Posted:{" "}
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  <div className="flex gap-2">
                    {onOpenChat &&
                      item.finder_uid &&
                      item.finder_uid !== userId && (
                        <button
                          onClick={() =>
                            onOpenChat(
                              item.finder_uid!,
                              "found",
                              item.id,
                              item.title
                            )
                          }
                          className="text-[11px] px-3 py-1 rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors"
                        >
                          Contact finder
                        </button>
                      )}

                    {item.finder_uid === userId && (
                      <button
                        onClick={() => handleMarkReturned(item)}
                        className="text-[11px] px-3 py-1 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                      >
                        Mark as returned
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default SmartLost;
