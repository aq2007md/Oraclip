// Shared tier metadata for the Account Center plan page.
// Mirrors the marketing pricing table but trimmed for the dashboard mini-cards.

export type TierId = "free" | "creator" | "pro" | "agency";

export interface AccountTier {
  id: TierId;
  name: string;
  subtitle: string;
  monthly: number;
  annual: number;
  monthlyAnalyses: number; // Infinity = unlimited
  highlight?: boolean;
}

export const TIERS: AccountTier[] = [
  {
    id: "free",
    name: "Free",
    subtitle: "Try before you commit",
    monthly: 0,
    annual: 0,
    monthlyAnalyses: 2,
  },
  {
    id: "creator",
    name: "Creator",
    subtitle: "For growing channels",
    monthly: 24,
    annual: 19,
    monthlyAnalyses: 20,
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For serious creators",
    monthly: 49,
    annual: 39,
    monthlyAnalyses: Infinity,
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    subtitle: "For teams & brands",
    monthly: 249,
    annual: 199,
    monthlyAnalyses: Infinity,
  },
];

export function tierById(id: string | null | undefined): AccountTier {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}

export function tierOrder(id: TierId): number {
  return TIERS.findIndex((t) => t.id === id);
}
