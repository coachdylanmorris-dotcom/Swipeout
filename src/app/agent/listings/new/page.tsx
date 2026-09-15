"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { NZ_REGIONS } from "@/lib/nzRegions";

function NewListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<string>(NZ_REGIONS[1]);
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    let photoUrl: string | null = null;

    if (photo) {
      const safeName = photo.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(path, photo);

      if (uploadError) {
        setError(uploadError.message);
        setSubmitting(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("listing-photos")
        .getPublicUrl(path);
      photoUrl = publicUrl.publicUrl;
    }

    const { error: insertError } = await supabase.from("listings").insert({
      agent_id: user.id,
      address,
      region,
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      description: description || null,
      photo_url: photoUrl,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.replace("/agent");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Add a listing</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="12 Queen Street, Ponsonby"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {NZ_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (NZD)
          </label>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="895000"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bedrooms
            </label>
            <input
              required
              type="number"
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bathrooms
            </label>
            <input
              required
              type="number"
              min={0}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Publish listing"}
        </button>
      </form>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <AuthGate role="agent">
      <NewListingForm />
    </AuthGate>
  );
}
