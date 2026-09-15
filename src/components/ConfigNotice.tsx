export default function ConfigNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">
        Almost there — connect Supabase
      </h1>
      <p className="mt-3 text-gray-600">
        Swipeout needs a Supabase project for user accounts, listings, and
        photos. It isn&apos;t connected yet. Follow{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5">README.md</code> in
        the project (section &quot;Set up Supabase&quot;), or the short
        version below:
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-gray-700">
        <li>
          Create a free project at{" "}
          <span className="font-medium">supabase.com</span>.
        </li>
        <li>
          In your Supabase project, open the{" "}
          <span className="font-medium">SQL Editor</span>, paste the contents
          of <code className="rounded bg-gray-100 px-1.5 py-0.5">supabase/schema.sql</code>{" "}
          from this project, and run it.
        </li>
        <li>
          Go to <span className="font-medium">Project Settings → API</span>{" "}
          and copy the <span className="font-medium">Project URL</span> and{" "}
          <span className="font-medium">anon public</span> key.
        </li>
        <li>
          Copy{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5">
            .env.local.example
          </code>{" "}
          to <code className="rounded bg-gray-100 px-1.5 py-0.5">.env.local</code>
          , and paste those two values in.
        </li>
        <li>Restart the dev server (stop it and run it again).</li>
      </ol>
    </div>
  );
}
