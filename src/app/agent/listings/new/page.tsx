"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import ListingCardFace from "@/components/ListingCardFace";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { NZ_REGIONS } from "@/lib/nzRegions";

const inputClass =
  "w-full rounded-xl border border-line bg-sky px-3.5 py-2.5 font-semibold text-ink outline-none focus:border-mint";
const labelClass =
  "mb-1.5 block text-[12.5px] font-extrabold uppercase tracking-wide text-ink/50";

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
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Keep a local preview URL for the chosen photo, and clean it up when it
  // changes or the page unmounts.
  useEffect(() => {
    if (!photo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the preview is part of the same object-URL lifecycle as the branch below
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <span className="mb-1.5 block text-[13px] font-extrabold uppercase tracking-wide text-mint">
        New listing
      </span>
      <h1 className="font-display text-2xl font-extrabold text-ink">Add a listing</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Address</label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="12 Queen Street, Ponsonby"
            />
          </div>

          <div>
            <label className={labelClass}>Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputClass}
            >
              {NZ_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Price (NZD)</label>
            <input
              required
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="895000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <input
                required
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bathrooms</label>
              <input
                required
                type="number"
                min={0}
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="w-full text-sm font-semibold text-ink/70"
            />
          </div>

          {error && <p className="text-sm font-semibold text-coral">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-ink px-4 py-3 font-bold text-white hover:bg-blue-deep disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Publish listing"}
          </button>
        </form>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <p className={labelClass}>Buyers will see</p>
          <ListingCardFace
            listing={{
              address,
              region,
              price: Number(price) || 0,
              bedrooms: Number(bedrooms) || 0,
              bathrooms: Number(bathrooms) || 0,
              description: description || null,
              photo_url: photoPreviewUrl,
            }}
          />
        </div>
      </div>
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
