"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { NZ_REGIONS } from "@/lib/nzRegions";

function BuyerOnboardingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredLocation, setPreferredLocation] = useState<string>(NZ_REGIONS[1]);
  const [preApproved, setPreApproved] = useState<"yes" | "no">("no");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    const { error: upsertError } = await supabase.from("buyer_profiles").upsert({
      id: user.id,
      budget_min: budgetMin ? Number(budgetMin) : null,
      budget_max: budgetMax ? Number(budgetMax) : null,
      preferred_location: preferredLocation,
      pre_approved: preApproved === "yes",
    });

    if (upsertError) {
      setError(upsertError.message);
      setSubmitting(false);
      return;
    }

    router.replace("/buyer");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Tell us what you&apos;re after</h1>
      <p className="mt-1 text-sm text-gray-600">
        This helps agents know a bit about you when you reach out.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Budget min (NZD)
            </label>
            <input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="500000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Budget max (NZD)
            </label>
            <input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="750000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred region
          </label>
          <select
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {NZ_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700">
            Are you pre-approved for a mortgage?
          </span>
          <div className="mt-1 flex gap-2">
            {(["yes", "no"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPreApproved(option)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize ${
                  preApproved === option
                    ? "border-rose-600 bg-rose-50 text-rose-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Start browsing"}
        </button>
      </form>
    </div>
  );
}

export default function BuyerOnboardingPage() {
  return (
    <AuthGate role="buyer">
      <BuyerOnboardingForm />
    </AuthGate>
  );
}
