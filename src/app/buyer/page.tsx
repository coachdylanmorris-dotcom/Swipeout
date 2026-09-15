"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import SwipeCard from "@/components/SwipeCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Listing, SwipeAction } from "@/lib/types";

function BuyerSwipeDeck() {
  const { user } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<Listing[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      if (!user) return;

      const { data: buyerProfile } = await supabase
        .from("buyer_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!buyerProfile) {
        router.replace("/buyer/onboarding");
        return;
      }

      const [{ data: listings, error: listingsError }, { data: swipes }] =
        await Promise.all([
          supabase
            .from("listings")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.from("swipes").select("listing_id").eq("buyer_id", user.id),
        ]);

      if (!active) return;

      if (listingsError) {
        setError(listingsError.message);
        return;
      }

      const swipedIds = new Set((swipes ?? []).map((s) => s.listing_id));
      setQueue((listings ?? []).filter((l) => !swipedIds.has(l.id)));
    }

    load();
    return () => {
      active = false;
    };
  }, [user, router]);

  async function handleSwipe(action: SwipeAction) {
    if (!user || !queue || queue.length === 0 || busy) return;
    setBusy(true);
    const listing = queue[0];

    const { error: swipeError } = await supabase.from("swipes").upsert(
      { buyer_id: user.id, listing_id: listing.id, action },
      { onConflict: "buyer_id,listing_id" },
    );

    setBusy(false);
    if (swipeError) {
      setError(swipeError.message);
      return;
    }
    setQueue((q) => (q ? q.slice(1) : q));
  }

  if (error) {
    return <p className="p-8 text-center font-semibold text-coral">{error}</p>;
  }

  if (queue === null) {
    return <p className="p-8 text-center text-ink/50">Loading listings…</p>;
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-8">
      <h1 className="mb-5 text-center font-display text-xl font-extrabold text-ink">
        New listings for you
      </h1>

      {queue.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white p-10 text-center text-ink/50">
          <div className="mb-2 text-3xl">🏁</div>
          You&apos;ve seen every listing.
          <br />
          Check back soon for more.
        </div>
      ) : (
        <SwipeCard
          listing={queue[0]}
          busy={busy}
          onNotInterested={() => handleSwipe("not_interested")}
          onWatchlist={() => handleSwipe("watchlist")}
          onContact={() => handleSwipe("contact")}
        />
      )}

      {queue.length > 0 && (
        <p className="mt-4 text-center text-xs font-bold text-ink/40">
          {queue.length} listing{queue.length === 1 ? "" : "s"} left
        </p>
      )}
    </div>
  );
}

export default function BuyerPage() {
  return (
    <AuthGate role="buyer">
      <BuyerSwipeDeck />
    </AuthGate>
  );
}
