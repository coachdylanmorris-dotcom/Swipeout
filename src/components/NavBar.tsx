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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-rose-600">
          Swipeout
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {!user && (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-rose-600 px-4 py-1.5 font-medium text-white hover:bg-rose-700"
              >
                Sign up
              </Link>
            </>
          )}

          {user && profile?.role === "buyer" && (
            <>
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900">
                Browse
              </Link>
              <Link
                href="/buyer/watchlist"
                className="text-gray-600 hover:text-gray-900"
              >
                Watchlist
              </Link>
            </>
          )}

          {user && profile?.role === "agent" && (
            <>
              <Link href="/agent" className="text-gray-600 hover:text-gray-900">
                Listings
              </Link>
              <Link
                href="/agent/listings/new"
                className="text-gray-600 hover:text-gray-900"
              >
                + Add listing
              </Link>
              <Link href="/agent/leads" className="text-gray-600 hover:text-gray-900">
                Leads
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-700"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
