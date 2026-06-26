import {
  User,
  Briefcase,
  Users,
  Building2,
  Coffee,
  TrendingUp,
  GraduationCap,
  Cpu,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
  Gamepad2,
  Plane,
  Smile,
  Music,
  Baby,
  Newspaper,
  BriefcaseBusiness,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type CreatorType = "independent" | "freelancer" | "team_startup" | "team_agency";

export const CREATOR_TYPES: {
  value: CreatorType;
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  { value: "independent", label: "Independent creator", desc: "Solo, building my personal brand or channel", icon: User },
  { value: "freelancer", label: "Freelancer / consultant", desc: "I create content for myself and sometimes clients", icon: Briefcase },
  { value: "team_startup", label: "Marketing team — startup or SME", desc: "I work in-house at a small or growing company", icon: Users },
  { value: "team_agency", label: "Marketing team — agency or enterprise", desc: "I manage content for multiple brands or large org", icon: Building2 },
];

export const NICHES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "lifestyle", label: "Lifestyle & vlog", icon: Coffee },
  { value: "business_finance", label: "Business & finance", icon: TrendingUp },
  { value: "education", label: "Education & tutorials", icon: GraduationCap },
  { value: "tech", label: "Tech & software", icon: Cpu },
  { value: "health_fitness", label: "Health & fitness", icon: Dumbbell },
  { value: "food", label: "Food & cooking", icon: UtensilsCrossed },
  { value: "fashion_beauty", label: "Fashion & beauty", icon: Sparkles },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "comedy", label: "Comedy & entertainment", icon: Smile },
  { value: "music_arts", label: "Music & arts", icon: Music },
  { value: "parenting", label: "Parenting & family", icon: Baby },
  { value: "news", label: "News & commentary", icon: Newspaper },
  { value: "b2b", label: "B2B / professional", icon: BriefcaseBusiness },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export const GOALS: { value: string; label: string }[] = [
  { value: "reach", label: "Reach new audiences" },
  { value: "followers", label: "Gain followers" },
  { value: "engagement", label: "Drive engagement" },
  { value: "leads", label: "Generate qualified leads" },
  { value: "awareness", label: "Build brand awareness" },
  { value: "traffic", label: "Drive traffic to my website" },
  { value: "other", label: "Other" },
];

export const AUDIENCE_SIZES: { value: string; label: string }[] = [
  { value: "starting", label: "Just getting started (under 1K followers)" },
  { value: "growing", label: "Growing (1K–10K)" },
  { value: "established", label: "Established (10K–100K)" },
  { value: "large", label: "Large (100K–1M)" },
  { value: "major", label: "Major creator (1M+)" },
  { value: "mixed", label: "Mixed across platforms / not sure" },
];

export const CADENCES: { value: string; label: string }[] = [
  { value: "daily", label: "Daily or more" },
  { value: "few_week", label: "A few times a week" },
  { value: "weekly", label: "Weekly" },
  { value: "few_month", label: "A few times a month" },
  { value: "less_monthly", label: "Less than monthly" },
  { value: "starting", label: "Just starting" },
];

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "multi", name: "Multi-region / global audience" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czechia" },
  { code: "GR", name: "Greece" },
  { code: "TR", name: "Turkey" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "MY", name: "Malaysia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IL", name: "Israel" },
  { code: "EG", name: "Egypt" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "MA", name: "Morocco" },
];

export function detectCountry(): string {
  if (typeof navigator === "undefined") return "multi";
  const locale = navigator.language || "";
  const region = locale.split("-")[1]?.toUpperCase();
  if (region && COUNTRIES.some((c) => c.code === region)) return region;
  return "multi";
}

/** Map a creator_type to default audience tags for the upload form. */
export function audienceTagsForCreatorType(ct: string | null): string[] {
  switch (ct) {
    case "independent":
      return ["independent_creators"];
    case "freelancer":
      return ["independent_creators", "smes"];
    case "team_startup":
      return ["smes"];
    case "team_agency":
      return ["enterprises"];
    default:
      return [];
  }
}
