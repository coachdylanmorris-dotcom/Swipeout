"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { NZ_REGIONS } from "@/lib/nzRegions";

const inputClass =
  "w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-blue";
const labelClass =
  "mb-1.5 block text-[12.5px] font-extrabold uppercase tracking-wide text-ink/50";

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
      <span className="mb-1.5 block text-[13px] font-extrabold uppercase tracking-wide text-blue">
        Buyer profile
      </span>
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Tell us what you&apos;re after
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        This helps agents know a bit about you when you reach out.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Budget min (NZD)</label>
            <input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className={inputClass}
              placeholder="500000"
            />
          </div>
          <div>
            <label className={labelClass}>Budget max (NZD)</label>
            <input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className={inputClass}
              placeholder="750000"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Preferred region</label>
          <select
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
            className={inputClass}
          >
            {NZ_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Are you pre-approved for a mortgage?</span>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPreApproved(option)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-bold capitalize ${
                  preApproved === option
                    ? "border-blue bg-blue/10 text-blue-deep"
                    : "border-line text-ink/60"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-blue px-4 py-3 font-bold text-white shadow-[0_14px_24px_-10px_rgba(47,111,237,0.55)] hover:bg-blue-deep disabled:opacity-50"
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
