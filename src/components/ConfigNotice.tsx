export default function ConfigNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue/10 px-3.5 py-1.5 text-[13px] font-bold text-blue-deep">
        <span className="h-1.5 w-1.5 rounded-full bg-sand" />
        Setup needed
      </span>
      <h1 className="font-display text-2xl font-extrabold text-ink">
        Almost there — connect Supabase
      </h1>
      <p className="mt-3 text-ink/65">
        Swipeout needs a Supabase project for user accounts, listings, and
        photos. It isn&apos;t connected yet. Follow{" "}
        <code className="rounded bg-white px-1.5 py-0.5">README.md</code> in
        the project (section &quot;Set up Supabase&quot;), or the short
        version below:
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-ink/75">
        <li>
          Create a free project at{" "}
          <span className="font-bold">supabase.com</span>.
        </li>
        <li>
          In your Supabase project, open the{" "}
          <span className="font-bold">SQL Editor</span>, paste the contents
          of <code className="rounded bg-white px-1.5 py-0.5">supabase/schema.sql</code>{" "}
          from this project, and run it.
        </li>
        <li>
          Go to <span className="font-bold">Project Settings → API</span>{" "}
          and copy the <span className="font-bold">Project URL</span> and{" "}
          <span className="font-bold">anon public</span> key.
        </li>
        <li>
          Copy{" "}
          <code className="rounded bg-white px-1.5 py-0.5">
            .env.local.example
          </code>{" "}
          to <code className="rounded bg-white px-1.5 py-0.5">.env.local</code>
          , and paste those two values in.
        </li>
        <li>Restart the dev server (stop it and run it again).</li>
      </ol>
    </div>
  );
}
