"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBar() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-sky/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
          <span className="flex h-8 w-8 -rotate-6 items-center justify-center rounded-[11px] bg-gradient-to-br from-blue to-blue-deep text-base text-white shadow-[0_8px_16px_-6px_rgba(47,111,237,0.6)]">
            ➤
          </span>
          Swipeout
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {!user && (
            <>
              <Link href="/login" className="font-semibold text-ink/65 hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-deep"
              >
                Sign up
              </Link>
            </>
          )}

          {user && profile?.role === "buyer" && (
            <>
              <Link href="/buyer" className="font-semibold text-ink/65 hover:text-ink">
                Browse
              </Link>
              <Link href="/buyer/watchlist" className="font-semibold text-ink/65 hover:text-ink">
                Watchlist
              </Link>
            </>
          )}

          {user && profile?.role === "agent" && (
            <>
              <Link href="/agent" className="font-semibold text-ink/65 hover:text-ink">
                Listings
              </Link>
              <Link href="/agent/listings/new" className="font-semibold text-ink/65 hover:text-ink">
                + Add listing
              </Link>
              <Link href="/agent/leads" className="font-semibold text-ink/65 hover:text-ink">
                Leads
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className="font-semibold text-ink/40 hover:text-ink"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
