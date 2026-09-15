"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function AgentOnboardingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    const { error: upsertError } = await supabase
      .from("agent_profiles")
      .upsert({ id: user.id, agency_name: agencyName });

    if (upsertError) {
      setError(upsertError.message);
      setSubmitting(false);
      return;
    }

    router.replace("/agent");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <span className="mb-1.5 block text-[13px] font-extrabold uppercase tracking-wide text-mint">
        Agent profile
      </span>
      <h1 className="font-display text-2xl font-extrabold text-ink">
        A little about your agency
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Buyers will see this alongside your listings.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-extrabold uppercase tracking-wide text-ink/50">
            Agency name
          </label>
          <input
            required
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-mint"
          />
        </div>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink px-4 py-3 font-bold text-white hover:bg-blue-deep disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

export default function AgentOnboardingPage() {
  return (
    <AuthGate role="agent">
      <AgentOnboardingForm />
    </AuthGate>
  );
}
