"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { BuyerProfile, Listing, Profile } from "@/lib/types";

interface Lead {
  swipeId: string;
  createdAt: string;
  listing: Pick<Listing, "id" | "address" | "region">;
  buyer: Profile;
  buyerProfile: BuyerProfile | null;
}

function LeadsView() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      if (!user) return;

      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("id, address, region")
        .eq("agent_id", user.id);

      if (listingsError) {
        if (active) setError(listingsError.message);
        return;
      }

      const listingIds = (listings ?? []).map((l) => l.id);
      if (listingIds.length === 0) {
        if (active) setLeads([]);
        return;
      }

      const { data: swipes, error: swipesError } = await supabase
        .from("swipes")
        .select("id, created_at, listing_id, buyer_id")
        .eq("action", "contact")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });

      if (swipesError) {
        if (active) setError(swipesError.message);
        return;
      }

      const buyerIds = Array.from(new Set((swipes ?? []).map((s) => s.buyer_id)));
      if (buyerIds.length === 0) {
        if (active) setLeads([]);
        return;
      }

      const [{ data: profiles }, { data: buyerProfiles }] = await Promise.all([
        supabase.from("profiles").select("*").in("id", buyerIds),
        supabase.from("buyer_profiles").select("*").in("id", buyerIds),
      ]);

      if (!active) return;

      const listingsById = new Map((listings ?? []).map((l) => [l.id, l]));
      const profilesById = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
      const buyerProfilesById = new Map(
        (buyerProfiles ?? []).map((bp) => [bp.id, bp as BuyerProfile]),
      );

      const combined: Lead[] = (swipes ?? [])
        .map((s) => {
          const listing = listingsById.get(s.listing_id);
          const buyer = profilesById.get(s.buyer_id);
          if (!listing || !buyer) return null;
          return {
            swipeId: s.id,
            createdAt: s.created_at,
            listing,
            buyer,
            buyerProfile: buyerProfilesById.get(s.buyer_id) ?? null,
          };
        })
        .filter((lead): lead is Lead => lead !== null);

      setLeads(combined);
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (leads === null) return <p className="p-8 text-center text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Leads</h1>
      <p className="mb-6 text-sm text-gray-600">
        Buyers who hit &quot;Contact me&quot; on one of your listings.
      </p>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          No leads yet. They&apos;ll show up here as soon as a buyer contacts you.
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.swipeId}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold text-gray-900">
                  {lead.buyer.full_name ?? "A buyer"}
                </h2>
                <span className="text-xs text-gray-400">
                  {new Date(lead.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Interested in {lead.listing.address} ({lead.listing.region})
              </p>

              {lead.buyerProfile && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
                  <div>
                    <dt className="text-xs text-gray-400">Budget</dt>
                    <dd>
                      {lead.buyerProfile.budget_min || lead.buyerProfile.budget_max
                        ? `$${(lead.buyerProfile.budget_min ?? 0).toLocaleString()} – $${(
                            lead.buyerProfile.budget_max ?? 0
                          ).toLocaleString()}`
                        : "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Preferred region</dt>
                    <dd>{lead.buyerProfile.preferred_location ?? "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400">Pre-approved</dt>
                    <dd>{lead.buyerProfile.pre_approved ? "Yes" : "No"}</dd>
                  </div>
                </dl>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <AuthGate role="agent">
      <LeadsView />
    </AuthGate>
  );
}
