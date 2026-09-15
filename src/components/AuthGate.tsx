"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/types";

// Wrap a protected page in this to require login, and optionally require
// a specific role (buyer vs agent). Redirects instead of rendering when
// the requirement isn't met.
export default function AuthGate({
  role,
  children,
}: {
  role?: Role;
  children: ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && profile && profile.role !== role) {
      router.replace(profile.role === "buyer" ? "/buyer" : "/agent");
    }
  }, [loading, user, profile, role, router]);

  if (loading || !user) {
    return <p className="p-8 text-center text-gray-500">Loading…</p>;
  }
  if (role && profile && profile.role !== role) {
    return null;
  }

  return <>{children}</>;
}
