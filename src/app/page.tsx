"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { resolveHomePath } from "@/lib/routing";

const TIERS = [
  {
    icon: "✕",
    color: "coral" as const,
    title: "Not for me",
    body: "Gone for good. It won't resurface, and nothing is shared with the agent — you just move on to the next place.",
  },
  {
    icon: "☆",
    color: "sand" as const,
    title: "Watchlist",
    body: "Keep an eye on it quietly. It's saved to your list — the agent still has no idea you're looking.",
  },
  {
    icon: "♥",
    color: "mint" as const,
    title: "Contact me",
    body: "This is the one signal that reaches an agent. Your profile unlocks to them, and the conversation starts warm, not cold.",
  },
];

const TIER_STYLES = {
  coral: "bg-coral/10 text-coral",
  sand: "bg-sand/20 text-[#8a6300]",
  mint: "bg-mint/15 text-mint",
};

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || !profile) return;
    resolveHomePath(user.id, profile.role).then((path) => router.replace(path));
  }, [loading, user, profile, router]);

  if (!loading && user) {
    return <p className="p-8 text-center text-ink/50">Loading your account…</p>;
  }

  return (
    <div>
      <header className="px-4 pb-6 pt-16 text-center">
        <div className="wrap mx-auto max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue/10 px-3.5 py-1.5 text-[13px] font-bold text-blue-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Real estate, minus the cold calls
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">
            Swipe right on your <span className="text-blue">next front door.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink/65">
            Browse New Zealand property listings like they&apos;re actually made
            for you, and only talk to an agent the moment you&apos;re genuinely
            ready. No pressure, no spam, no guessing.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup?role=buyer"
              className="w-full rounded-full bg-blue px-7 py-3.5 text-center text-[15px] font-bold text-white shadow-[0_14px_24px_-10px_rgba(47,111,237,0.55)] hover:bg-blue-deep sm:w-auto"
            >
              Join as a buyer
            </Link>
            <Link
              href="/signup?role=agent"
              className="w-full rounded-full border-2 border-line px-7 py-3.5 text-center text-[15px] font-bold text-ink hover:bg-white sm:w-auto"
            >
              I&apos;m an agent
            </Link>
          </div>
          <p className="mt-4 text-[13px] font-semibold text-ink/50">
            Free for buyers · Free listings for agents
          </p>
        </div>
      </header>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <span className="mb-2 block text-[13px] font-extrabold uppercase tracking-wide text-blue">
              The swipe, explained
            </span>
            <h2 className="font-display text-3xl font-extrabold text-ink">
              Three swipes. Zero bombardment.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.title}
                className="rounded-3xl border border-line bg-white p-7 transition-transform hover:-translate-y-1"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${TIER_STYLES[tier.color]}`}
                >
                  {tier.icon}
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-ink">{tier.title}</h3>
                <p className="text-sm leading-relaxed text-ink/60">{tier.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-white p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue/25 blur-3xl" />
            <div className="relative">
              <div className="mb-1.5 text-[13px] font-extrabold uppercase tracking-wide text-blue">
                Buyers
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-ink">I&apos;m buying</h3>
              <p className="mb-5 text-sm text-ink/60">
                Swipe through listings and connect with agents on your terms.
              </p>
              <Link
                href="/signup?role=buyer"
                className="inline-block w-full rounded-full bg-blue px-4 py-2.5 text-center font-bold text-white hover:bg-blue-deep"
              >
                Sign up as a buyer
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-line bg-white p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-mint/25 blur-3xl" />
            <div className="relative">
              <div className="mb-1.5 text-[13px] font-extrabold uppercase tracking-wide text-mint">
                Agents
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-ink">I&apos;m an agent</h3>
              <p className="mb-5 text-sm text-ink/60">
                List properties and hear only from genuinely interested buyers.
              </p>
              <Link
                href="/signup?role=agent"
                className="inline-block w-full rounded-full bg-ink px-4 py-2.5 text-center font-bold text-white hover:bg-blue-deep"
              >
                Sign up as an agent
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-ink/50">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </div>
  );
}
