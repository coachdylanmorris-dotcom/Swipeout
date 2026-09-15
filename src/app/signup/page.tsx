"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveHomePath } from "@/lib/routing";
import type { Role } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-select the role from a link like /signup?role=agent.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("role") === "agent") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the ?role= link param on mount
      setRole("agent");
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    if (!data.session || !data.user) {
      setInfo(
        "Account created! Check your email to confirm it, then log in.",
      );
      setSubmitting(false);
      return;
    }

    const path = await resolveHomePath(data.user.id, role);
    router.replace(path);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Create your account
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`rounded-xl border-2 px-4 py-3 text-sm font-bold ${
            role === "buyer"
              ? "border-blue bg-blue/10 text-blue-deep"
              : "border-line text-ink/60"
          }`}
        >
          I&apos;m buying
        </button>
        <button
          type="button"
          onClick={() => setRole("agent")}
          className={`rounded-xl border-2 px-4 py-3 text-sm font-bold ${
            role === "agent"
              ? "border-mint bg-mint/10 text-mint"
              : "border-line text-ink/60"
          }`}
        >
          I&apos;m an agent
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-extrabold uppercase tracking-wide text-ink/50">
            Full name
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-blue"
          />
        </div>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-blue"
          />
        </div>

        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        {info && <p className="text-sm font-semibold text-mint">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-blue px-4 py-3 font-bold text-white shadow-[0_14px_24px_-10px_rgba(47,111,237,0.55)] hover:bg-blue-deep disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-ink/50">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
