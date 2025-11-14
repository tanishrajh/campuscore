import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface FoundItemFormProps {
  onCreated?: () => void; // callback to refresh list
}

const FoundItemForm: React.FC<FoundItemFormProps> = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let photoUrl: string | null = null;

      // upload image if present
      if (file) {
        const filePath = `found/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from("campuscore") // your bucket
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase
          .storage
          .from("campuscore")
          .getPublicUrl(filePath);

        photoUrl = data.publicUrl;
      }

      // get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      // convert tagsInput "wallet, brown, leather" -> ["wallet","brown","leather"]
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const { error: insertError } = await supabase.from("found_items").insert([
        {
          uploader_uid: user?.id ?? null,
          title,
          description,
          location,
          tags: tags.length ? tags : null,
          photo_url: photoUrl,
        },
      ]);

      if (insertError) throw insertError;

      setMessage("Found item added ✅");
      setTitle("");
      setDescription("");
      setLocation("");
      setTagsInput("");
      setFile(null);

      onCreated?.();
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        className="w-full border p-2 rounded text-sm"
        placeholder="Item title (e.g., Brown wallet)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full border p-2 rounded text-sm"
        placeholder="Short description (where you found it, any details)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded text-sm"
        placeholder="Location (e.g., C-Block, Library)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded text-sm"
        placeholder="Tags (comma separated: wallet, brown, leather)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />

      <div className="text-sm">
        <label className="block mb-1 text-slate-700">Photo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add found item"}
      </button>

      {message && <p className="text-xs text-slate-600 mt-1">{message}</p>}
    </form>
  );
};

export default FoundItemForm;
