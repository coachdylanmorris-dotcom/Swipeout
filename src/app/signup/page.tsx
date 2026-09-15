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
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            role === "buyer"
              ? "border-rose-600 bg-rose-50 text-rose-700"
              : "border-gray-200 text-gray-600"
          }`}
        >
          I&apos;m buying
        </button>
        <button
          type="button"
          onClick={() => setRole("agent")}
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            role === "agent"
              ? "border-rose-600 bg-rose-50 text-rose-700"
              : "border-gray-200 text-gray-600"
          }`}
        >
          I&apos;m an agent
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-rose-600 px-4 py-2.5 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
