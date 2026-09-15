import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import ConfigNotice from "@/components/ConfigNotice";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Swipeout",
  description:
    "Swipe through real estate listings and connect with agents only when you're genuinely interested.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-gray-50 font-sans text-gray-900">
        {isSupabaseConfigured ? (
          <AuthProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        ) : (
          <ConfigNotice />
        )}
      </body>
    </html>
  );
}
