"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

interface WatchlistRow {
  swipeId: string;
  listing: Listing;
}

function WatchlistView() {
  const { user } = useAuth();
  const [rows, setRows] = useState<WatchlistRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      if (!user) return;
      const { data, error: fetchError } = await supabase
        .from("swipes")
        .select("id, listing:listings(*)")
        .eq("buyer_id", user.id)
        .eq("action", "watchlist")
        .order("created_at", { ascending: false });

      if (!active) return;
      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      type RawRow = { id: string; listing: Listing | null };
      const parsed = ((data ?? []) as unknown as RawRow[])
        .filter((row): row is { id: string; listing: Listing } => Boolean(row.listing))
        .map((row) => ({ swipeId: row.id, listing: row.listing }));
      setRows(parsed);
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  async function updateAction(row: WatchlistRow, action: "contact" | "not_interested") {
    if (!user) return;
    setBusyId(row.swipeId);
    const { error: updateError } = await supabase.from("swipes").upsert(
      { buyer_id: user.id, listing_id: row.listing.id, action },
      { onConflict: "buyer_id,listing_id" },
    );
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setRows((current) => (current ?? []).filter((r) => r.swipeId !== row.swipeId));
  }

  if (error) return <p className="p-8 text-center font-semibold text-coral">{error}</p>;
  if (rows === null) return <p className="p-8 text-center text-ink/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-5 font-display text-xl font-extrabold text-ink">Your watchlist</h1>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white p-10 text-center text-ink/50">
          Nothing saved yet. Swipe &quot;Watchlist&quot; on a listing to keep it here.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.swipeId}
              className="flex gap-4 overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-[0_10px_24px_-18px_rgba(11,29,58,0.4)]"
            >
              <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-sky">
                {row.listing.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.listing.photo_url}
                    alt={row.listing.address}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-ink/40">
                    No photo
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display font-extrabold text-ink">
                    ${row.listing.price.toLocaleString()}
                  </h2>
                  <span className="text-xs font-semibold text-ink/50">{row.listing.region}</span>
                </div>
                <p className="text-sm font-semibold text-ink/80">{row.listing.address}</p>
                <p className="text-xs font-semibold text-ink/50">
                  {row.listing.bedrooms} bed · {row.listing.bathrooms} bath
                </p>

                <div className="mt-2.5 flex gap-2">
                  <button
                    disabled={busyId === row.swipeId}
                    onClick={() => updateAction(row, "contact")}
                    className="rounded-full bg-mint px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Contact me
                  </button>
                  <button
                    disabled={busyId === row.swipeId}
                    onClick={() => updateAction(row, "not_interested")}
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs font-bold text-ink/60 hover:bg-sky disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <AuthGate role="buyer">
      <WatchlistView />
    </AuthGate>
  );
}
