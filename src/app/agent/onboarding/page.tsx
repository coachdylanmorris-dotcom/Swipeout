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
      <h1 className="text-2xl font-bold text-gray-900">A little about your agency</h1>
      <p className="mt-1 text-sm text-gray-600">
        Buyers will see this alongside your listings.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Agency name
          </label>
          <input
            required
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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
