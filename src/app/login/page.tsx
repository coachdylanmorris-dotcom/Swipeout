"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveHomePath } from "@/lib/routing";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      setError("We couldn't find your profile. Please try signing up again.");
      setSubmitting(false);
      return;
    }

    const path = await resolveHomePath(data.user.id, profile.role);
    router.replace(path);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl font-extrabold text-ink">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-extrabold uppercase tracking-wide text-ink/50">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-blue"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[12.5px] font-extrabold uppercase tracking-wide text-ink/50">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-blue"
          />
        </div>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-blue px-4 py-3 font-bold text-white shadow-[0_14px_24px_-10px_rgba(47,111,237,0.55)] hover:bg-blue-deep disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-ink/50">
        No account yet?{" "}
        <Link href="/signup" className="font-bold text-blue hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
