import type { Metadata } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import ConfigNotice from "@/components/ConfigNotice";
import { isSupabaseConfigured } from "@/lib/supabase";

const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Swipeout",
  description:
    "Swipe through real estate listings and connect with agents only when you're genuinely interested.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${baloo2.variable} ${plusJakartaSans.variable}`}
    >
      <body className="flex min-h-full flex-col bg-sky font-sans text-ink">
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
