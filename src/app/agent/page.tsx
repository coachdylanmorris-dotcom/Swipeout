"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

function AgentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      if (!user) return;

      const { data: agentProfile } = await supabase
        .from("agent_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!agentProfile) {
        router.replace("/agent/onboarding");
        return;
      }

      const { data, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (listingsError) {
        setError(listingsError.message);
        return;
      }
      setListings(data ?? []);
    }

    load();
    return () => {
      active = false;
    };
  }, [user, router]);

  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (listings === null) return <p className="p-8 text-center text-gray-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Your listings</h1>
        <Link
          href="/agent/listings/new"
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          You haven&apos;t added any listings yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] w-full bg-gray-100">
                {listing.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.photo_url}
                    alt={listing.address}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No photo
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-bold text-gray-900">
                    ${listing.price.toLocaleString()}
                  </h2>
                  <span className="text-xs text-gray-500">{listing.region}</span>
                </div>
                <p className="text-sm text-gray-700">{listing.address}</p>
                <p className="text-xs text-gray-500">
                  {listing.bedrooms} bed · {listing.bathrooms} bath
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentPage() {
  return (
    <AuthGate role="agent">
      <AgentDashboard />
    </AuthGate>
  );
}
