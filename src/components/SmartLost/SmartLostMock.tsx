import React, { useState } from "react";

type FoundItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  location: string;
};

// Mock dataset for demo. Later we’ll replace with Supabase data + AI.
const MOCK_FOUND_ITEMS: FoundItem[] = [
  {
    id: "f1",
    title: "Brown leather wallet",
    description: "Found near C-Block stairway.",
    tags: ["wallet", "brown", "leather"],
    imageUrl:
      "https://images.pexels.com/photos/910288/pexels-photo-910288.jpeg?auto=compress&cs=tinysrgb&w=400",
    location: "C-Block",
  },
  {
    id: "f2",
    title: "Red spiral notebook",
    description: "Found in the library reading hall.",
    tags: ["notebook", "red", "spiral"],
    imageUrl:
      "https://images.pexels.com/photos/951240/pexels-photo-951240.jpeg?auto=compress&cs=tinysrgb&w=400",
    location: "Library",
  },
  {
    id: "f3",
    title: "Black wired earphones",
    description: "Found in the main canteen area.",
    tags: ["earphones", "black", "wired"],
    imageUrl:
      "https://images.pexels.com/photos/373945/pexels-photo-373945.jpeg?auto=compress&cs=tinysrgb&w=400",
    location: "Canteen",
  },
];

const SmartLostMock: React.FC = () => {
  const [lostText, setLostText] = useState("");
  const [results, setResults] = useState<{ item: FoundItem; score: number }[]>(
    []
  );
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    const q = lostText.toLowerCase();
    const tokens = q.split(/[^a-z0-9]+/).filter(Boolean);

    // Simple scoring: count how many tags appear in the description
    const scored = MOCK_FOUND_ITEMS.map((item) => {
      const common = item.tags.filter((tag) => tokens.includes(tag));
      return { item, score: common.length };
    })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    setResults(scored);
    setSearched(true);
  }

  function handleClear() {
    setLostText("");
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">
        SmartLost (Mock)
      </h2>
      <p className="text-sm text-slate-600">
        Describe what you lost, and we&apos;ll try to match it with recently
        found items.
      </p>

      <textarea
        className="w-full border rounded p-2 text-sm"
        rows={3}
        placeholder="Example: I lost my brown leather wallet near C-Block..."
        value={lostText}
        onChange={(e) => setLostText(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          Find matches
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm"
        >
          Clear
        </button>
      </div>

      <div className="border-t pt-3 mt-2">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Matches
        </h3>

        {!searched && (
          <p className="text-xs text-slate-500">
            Type a description and click &quot;Find matches&quot; to see
            results.
          </p>
        )}

        {searched && results.length === 0 && (
          <p className="text-xs text-rose-500">
            No matches found in this mock dataset. Try using simple keywords
            like &quot;wallet&quot;, &quot;red notebook&quot;, or
            &quot;earphones&quot;.
          </p>
        )}

        {results.length > 0 && (
          <ul className="space-y-3">
            {results.map(({ item, score }) => (
              <li
                key={item.id}
                className="flex gap-3 border rounded-lg p-2 bg-slate-50"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-24 h-20 object-cover rounded border"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.location}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Match score: <span className="font-semibold">{score}</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <button className="mt-2 text-xs px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600">
                    Message finder (mock)
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SmartLostMock;
