export type Role = "buyer" | "agent";

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  created_at: string;
}

export interface BuyerProfile {
  id: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  pre_approved: boolean;
}

export interface AgentProfile {
  id: string;
  agency_name: string | null;
}

export type SwipeAction = "not_interested" | "watchlist" | "contact";

export interface Listing {
  id: string;
  agent_id: string;
  address: string;
  region: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  description: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Swipe {
  id: string;
  buyer_id: string;
  listing_id: string;
  action: SwipeAction;
  created_at: string;
}
