type CardListing = {
  address: string;
  region: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  description: string | null;
  photo_url: string | null;
};

// The visual "face" of a listing card -- photo + details. Shared by the
// buyer's swipe deck and the agent's live preview while adding a listing,
// so both always look identical.
export default function ListingCardFace({ listing }: { listing: CardListing }) {
  return (
    <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_18px_30px_-14px_rgba(11,29,58,0.35)]">
      <div className="relative h-64 w-full bg-sky">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photo_url}
            alt={listing.address}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/30">
            No photo yet
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent to-55%" />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-blue-deep backdrop-blur-sm">
          {listing.region}
        </span>
        <span className="absolute bottom-3 left-4 font-display text-2xl font-extrabold text-white">
          {listing.price ? `$${listing.price.toLocaleString()}` : "Price"}
        </span>
      </div>

      <div className="p-4">
        <p className="text-base font-extrabold text-ink">
          {listing.address || "Address"}
        </p>
        <p className="mt-0.5 text-[12.5px] font-semibold text-ink/55">
          {listing.bedrooms || 0} bed · {listing.bathrooms || 0} bath
        </p>
        {listing.description && (
          <p className="mt-2.5 text-sm text-ink/65">{listing.description}</p>
        )}
      </div>
    </div>
  );
}
