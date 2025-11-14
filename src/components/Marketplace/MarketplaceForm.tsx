import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface MarketplaceFormProps {
  userId: string;
  onCreated: () => void;
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
      console.error("MarketplaceForm: fetch points error:", error);
      return;
    }

    const current = data.points ?? 0;

    const { error: updateError } = await supabase
      .from("campus_users")
      .update({ points: current + delta })
      .eq("auth_uid", uid);

    if (updateError) {
      console.error("MarketplaceForm: update points error:", updateError);
    }
  } catch (err) {
    console.error("MarketplaceForm: awardPoints unexpected error:", err);
  }
}

const MarketplaceForm: React.FC<MarketplaceFormProps> = ({
  userId,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("books");
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setPosting(true);
    setMsg(null);

    try {
      let photoUrl: string | null = null;

      if (file) {
        const filePath = `market/${Date.now()}-${file.name}`;
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

      const priceNum =
        price.trim() === "" ? null : Number.parseFloat(price);

      const { error } = await supabase.from("market_listings").insert([
        {
          seller_uid: userId,
          title: title.trim(),
          description: desc.trim() || null,
          price: Number.isNaN(priceNum) ? null : priceNum,
          category,
          photo_url: photoUrl,
        },
      ]);

      if (error) throw error;

      // reward for contributing to marketplace
      await awardPointsToUser(userId, 1);

      setMsg("Listing posted ✅");
      setTitle("");
      setDesc("");
      setPrice("");
      setCategory("books");
      setFile(null);

      onCreated();
    } catch (err: any) {
      console.error(err);
      setMsg("Error posting listing: " + err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-sm">
      <input
        className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        placeholder="Title (e.g., Engg Maths 3 textbook)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        rows={2}
        placeholder="Short description, condition, extras..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          placeholder="Price (₹) – leave empty if free"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className="sm:w-44 border border-slate-700 rounded-lg p-2 text-sm bg-slate-950 text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="hostel">Hostel Items</option>
          <option value="cycles">Cycles</option>
          <option value="other">Other</option>
        </select>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-xs text-slate-400"
      />

      <button
        disabled={posting}
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-lg text-sm hover:from-indigo-400 hover:to-sky-400 disabled:opacity-60 transition-all"
      >
        {posting ? "Posting…" : "Post listing"}
      </button>

      {msg && <p className="text-xs text-slate-400 mt-1">{msg}</p>}
    </form>
  );
};

export default MarketplaceForm;
