"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { resolveHomePath } from "@/lib/routing";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || !profile) return;
    resolveHomePath(user.id, profile.role).then((path) => router.replace(path));
  }, [loading, user, profile, router]);

  if (!loading && user) {
    return <p className="p-8 text-center text-gray-500">Loading your account…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900">
        Swipe your way to your next home.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
        Swipeout is a faster way to browse New Zealand property listings.
        Swipe past what isn&apos;t for you, save what is, and only get in
        touch with an agent when you&apos;re genuinely interested.
      </p>

      <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <div className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">I&apos;m buying</h2>
          <p className="mt-1 text-sm text-gray-600">
            Swipe through listings and connect with agents on your terms.
          </p>
          <Link
            href="/signup?role=buyer"
            className="mt-4 inline-block w-full rounded-full bg-rose-600 px-4 py-2 text-center font-medium text-white hover:bg-rose-700"
          >
            Sign up as a buyer
          </Link>
        </div>

        <div className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">I&apos;m an agent</h2>
          <p className="mt-1 text-sm text-gray-600">
            List properties and hear only from genuinely interested buyers.
          </p>
          <Link
            href="/signup?role=agent"
            className="mt-4 inline-block w-full rounded-full bg-gray-900 px-4 py-2 text-center font-medium text-white hover:bg-gray-800"
          >
            Sign up as an agent
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
