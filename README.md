# Swipeout

"Tinder for houses." Buyers swipe through property listings; agents only
hear from buyers who are genuinely interested.

This is the first build: buyer + agent accounts, agents manually adding
listings, buyers swiping ("Not interested" / "Watchlist" / "Contact me"),
and agents seeing leads when a buyer hits "Contact me". No AI listing
generation, analytics, mortgage matching, or chat yet — that's deliberate,
see the project brief.

**Stack:** Next.js (App Router) + Tailwind CSS for the app, Supabase for
auth/database/photo storage, deployable to Vercel.

## How the app is put together

- `supabase/schema.sql` — the entire database: tables, security rules, and
  photo storage. You run this once in your Supabase project.
- `src/lib/supabase.ts` — connects the app to your Supabase project using
  two keys you'll set in `.env.local`.
- `src/contexts/AuthContext.tsx` — tracks who's logged in across the app.
- `src/components/AuthGate.tsx` — protects buyer/agent-only pages,
  redirecting to login (or the other role's home) when needed.
- `src/app/` — one folder per screen: landing page, signup, login, buyer
  onboarding/swipe deck/watchlist, agent onboarding/dashboard/add
  listing/leads.

The app talks to Supabase directly from the browser (no custom backend
server). That's safe because Supabase's **Row Level Security** — defined
in `supabase/schema.sql` — enforces who can read or write what, no matter
what the browser sends. For example, an agent can only see a buyer's
profile once that buyer has swiped "Contact me" on one of their listings;
the database refuses the request otherwise.

## Set up Supabase

Supabase is the free backend this app relies on for logins, the database,
and listing photos. Takes about 5 minutes.

1. **Create a project.** Go to [supabase.com](https://supabase.com), sign
   up (free), and click "New project". Pick any name and password (the
   password is for the database itself — you won't need it day-to-day)
   and a region close to your users (e.g. Sydney for NZ).
2. **Run the schema.** Once the project is ready, open the **SQL Editor**
   in the left sidebar, click **New query**, paste in the entire contents
   of [`supabase/schema.sql`](./supabase/schema.sql) from this repo, and
   click **Run**. This creates every table, security rule, and the photo
   storage bucket. (Re-running it later after a change is safe.)
3. **Copy your API keys.** Go to **Project Settings → API**. You'll need:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string — this is safe to use in the
     browser; it only grants what the security rules from step 2 allow)
4. **Add them to the app.** In this project, copy `.env.local.example` to
   a new file named `.env.local`, and paste the two values in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

5. **(Recommended while testing) Turn off email confirmation.** By
   default Supabase makes new users click a confirmation link in their
   email before they can log in — fine for launch, annoying while you're
   testing with friends. To skip it: in Supabase, go to
   **Authentication → Providers → Email** and turn off **"Confirm
   email"**. You can turn it back on later before a real launch.

## Run it locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). If you see a
"connect Supabase" screen instead of the app, double check `.env.local`
has both values and restart `npm run dev`.

## Trying it out

- Sign up once as an **agent**, add a listing or two (an address, price,
  bed/bath count, a photo, a short description).
- Sign up again with a different email as a **buyer**, set your budget
  and preferred region, and you'll see the listings you just added as
  swipeable cards.
- Swipe "Contact me" on one, then log back in as that agent and check
  **Leads** — you'll see the buyer's profile there.

## Deploying to Vercel

1. Push this repo to GitHub (or your preferred git host).
2. In [Vercel](https://vercel.com/new), import the repository.
3. Add the same two environment variables from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project's **Settings →
   Environment Variables**.
4. Deploy. No other configuration is needed — Vercel detects Next.js
   automatically.

## What's deliberately not built yet

AI listing generation, an analytics dashboard, mortgage broker matching,
and in-app chat are all out of scope for this build. Agent notifications
for "Contact me" are handled entirely in-app (the **Leads** page) — no
email or SMS integration yet.
