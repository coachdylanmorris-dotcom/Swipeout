import type { Listing } from "@/lib/types";

export default function SwipeCard({
  listing,
  onNotInterested,
  onWatchlist,
  onContact,
  busy,
}: {
  listing: Listing;
  onNotInterested: () => void;
  onWatchlist: () => void;
  onContact: () => void;
  busy?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[4/3] w-full bg-gray-100">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photo_url}
            alt={listing.address}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No photo yet
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            ${listing.price.toLocaleString()}
          </h2>
          <span className="text-sm text-gray-500">{listing.region}</span>
        </div>
        <p className="mt-1 text-gray-700">{listing.address}</p>
        <p className="mt-1 text-sm text-gray-500">
          {listing.bedrooms} bed · {listing.bathrooms} bath
        </p>
        {listing.description && (
          <p className="mt-3 text-sm text-gray-600">{listing.description}</p>
        )}
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200">
        <button
          disabled={busy}
          onClick={onNotInterested}
          className="py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          Not interested
        </button>
        <button
          disabled={busy}
          onClick={onWatchlist}
          className="py-3 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-50"
        >
          Watchlist
        </button>
        <button
          disabled={busy}
          onClick={onContact}
          className="py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        >
          Contact me
        </button>
      </div>
    </div>
  );
}
