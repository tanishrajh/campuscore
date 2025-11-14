import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MarketplaceForm from "./MarketplaceForm";

type Listing = {
  id: string;
  seller_uid: string | null;
  title: string;
  description: string | null;
  price: number | null;
  category: string | null;
  photo_url: string | null;
  created_at: string;
};

interface MarketplaceProps {
  userId: string;
  onOpenChat?: (
    targetUserId: string,
    contextType: "market",
    contextId: string,
    title: string
  ) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ userId, onOpenChat }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  async function fetchListings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("market_listings")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.error("Error fetching listings:", error);
      return;
    }

    setListings((data as Listing[]) ?? []);
  }

  useEffect(() => {
    fetchListings();
  }, []);

  const filtered =
    filter === "all"
      ? listings
      : listings.filter((l) => l.category === filter);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-md shadow-xl shadow-slate-950/50 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">
        Campus Marketplace
      </h2>
      <p className="text-sm text-slate-400">
        Buy and sell items inside campus: books, electronics, hostel supplies,
        cycles, and more. Chat stays inside CampusCore.
      </p>

      {/* POST LISTING */}
      <section className="border border-slate-800 rounded-xl p-3 bg-slate-900/70 space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">
          Add a listing
        </h3>
        <MarketplaceForm onCreated={fetchListings} userId={userId} />
      </section>

      {/* FILTERS */}
      <div className="flex gap-2 text-sm items-center">
        <span className="text-xs text-slate-400">Filter:</span>
        <select
          className="border border-slate-700 bg-slate-950 text-slate-100 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All items</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
          <option value="hostel">Hostel Items</option>
          <option value="cycles">Cycles</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* LISTINGS */}
      {loading && (
        <p className="text-xs text-slate-500">Loading listings…</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-xs text-slate-500">No items found.</p>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="border border-slate-800 rounded-xl p-2 bg-slate-900/70 flex flex-col hover:border-sky-500/60 hover:bg-slate-900 transition-all"
          >
            {item.photo_url && (
              <img
                src={item.photo_url}
                alt={item.title}
                className="w-full h-40 object-cover rounded-lg border border-slate-700"
              />
            )}

            <p className="font-semibold text-slate-50 text-sm mt-2">
              {item.title}
            </p>

            {item.description && (
              <p className="text-xs text-slate-400 mt-1">
                {item.description}
              </p>
            )}

            {item.price !== null && (
              <p className="text-xs font-semibold text-emerald-400 mt-1">
                ₹{item.price}
              </p>
            )}

            <p className="text-[10px] text-slate-500 mt-1">
              Category: {item.category}
            </p>

            <div className="mt-2 flex justify-between items-center">
              <p className="text-[10px] text-slate-500">
                {new Date(item.created_at).toLocaleString()}
              </p>

              {onOpenChat &&
                item.seller_uid &&
                item.seller_uid !== userId && (
                  <button
                    onClick={() =>
                      onOpenChat(
                        item.seller_uid!,
                        "market",
                        item.id,
                        item.title
                      )
                    }
                    className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-400 hover:to-sky-400 transition-all"
                  >
                    Contact seller
                  </button>
                )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Marketplace;
