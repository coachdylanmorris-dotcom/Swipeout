import ListingCardFace from "@/components/ListingCardFace";
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
    <div>
      <ListingCardFace listing={listing} />

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          disabled={busy}
          onClick={onNotInterested}
          aria-label="Not interested"
          title="Not interested"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-xl text-coral shadow-[0_8px_16px_-6px_rgba(11,29,58,0.25)] hover:scale-105 disabled:opacity-50"
        >
          ✕
        </button>
        <button
          disabled={busy}
          onClick={onWatchlist}
          aria-label="Watchlist"
          title="Watchlist"
          className="flex h-11 w-11 items-center justify-center self-center rounded-full bg-white text-base text-sand shadow-[0_8px_16px_-6px_rgba(11,29,58,0.25)] hover:scale-105 disabled:opacity-50"
        >
          ☆
        </button>
        <button
          disabled={busy}
          onClick={onContact}
          aria-label="Contact me"
          title="Contact me"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-mint text-xl text-white shadow-[0_8px_16px_-6px_rgba(11,29,58,0.25)] hover:scale-105 disabled:opacity-50"
        >
          ♥
        </button>
      </div>
      <p className="mt-2.5 text-center text-[11px] font-bold text-ink/45">
        Not interested · Watchlist · Contact me
      </p>
    </div>
  );
}
