import type { Goal, TargetPlatform } from "@/components/ContentUploader";

export type RecommendationCategory =
  | "hook"
  | "length"
  | "script"
  | "message"
  | "audience"
  | "cta"
  | "visual"
  | "editing"
  | "caption"
  | "audio"
  | "thumbnail";

export type Recommendation = {
  category: RecommendationCategory;
  title: string;
  detail: string;
  predicted_lift: number;
};

export const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  hook: "Hook",
  length: "Length & pacing",
  script: "Script",
  message: "Message clarity",
  audience: "Audience targeting",
  cta: "Call-to-action",
  visual: "Visual content",
  editing: "Editing & cuts",
  caption: "On-screen captions",
  audio: "Sound / music",
  thumbnail: "Thumbnail",
};

// Subtle category color classes (badge styling).
export const CATEGORY_BADGE: Record<RecommendationCategory, string> = {
  hook: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  length: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  script: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  message: "bg-pink-100 text-pink-900 dark:bg-pink-900/30 dark:text-pink-200",
  audience: "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200",
  cta: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-200",
  visual: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  editing: "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200",
  caption: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200",
  audio: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  thumbnail: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200",
};

const PLATFORM_LABEL: Record<TargetPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Reels",
  youtube: "YouTube Shorts",
  facebook: "Facebook Reels",
};

const AUDIENCE_TAG_LABEL: Record<string, string> = {
  gen_z: "Gen Z",
  millennials: "Millennials",
  gen_x: "Gen X",
  boomers: "Boomers",
  students: "students",
  parents: "parents",
  professionals: "professionals",
  independent_creators: "independent creators",
  smes: "SMEs",
  enterprises: "enterprises",
  consumers_b2c: "consumers",
  businesses_b2b: "B2B audiences",
  niche_hobbyists: "niche hobbyists",
};

export type SubmissionContext = {
  platform: TargetPlatform;
  goal: Goal | null;
  scriptLength: number; // chars
  captionLength: number; // chars
  durationSeconds: number | null;
  audienceTags: string[];
  audienceDescription: string | null;
};

type Template = {
  category: RecommendationCategory;
  title: (ctx: SubmissionContext) => string;
  detail: (ctx: SubmissionContext) => string | null; // null = skip
  base_lift: number;
};

const platformName = (p: TargetPlatform) => PLATFORM_LABEL[p];
const firstAudienceTag = (ctx: SubmissionContext): string | null => {
  if (!ctx.audienceTags.length) return null;
  return AUDIENCE_TAG_LABEL[ctx.audienceTags[0]] ?? ctx.audienceTags[0];
};

// ---------- Pool (~30 templates, ~3 per category) ----------
const POOL: Template[] = [
  // hook
  {
    category: "hook",
    title: () => "Lead with the payoff, not the setup",
    detail: (c) =>
      `On ${platformName(c.platform)}, 60% of viewers swipe before 0:04 — your hook needs to land in the first frame.`,
    base_lift: 8,
  },
  {
    category: "hook",
    title: () => "Open with a question or pattern interrupt",
    detail: () =>
      "First-frame statements convert about 2x better than slow intros that ease into the topic.",
    base_lift: 6,
  },
  {
    category: "hook",
    title: () => "Tease the result in the first second",
    detail: (c) =>
      `${platformName(c.platform)} viewers decide whether to keep watching in under 2 seconds — show them what they'll get.`,
    base_lift: 7,
  },

  // length
  {
    category: "length",
    title: () => "Trim to under 22 seconds",
    detail: (c) => {
      const d = c.durationSeconds ? Math.round(c.durationSeconds) : null;
      if (d && d > 25)
        return `Audience drops off sharply past 25s — your current length is ${d}s.`;
      return `Most short-form audiences drop off past 25s on ${platformName(c.platform)}.`;
    },
    base_lift: 5,
  },
  {
    category: "length",
    title: () => "Front-load the value in the first half",
    detail: () =>
      "Average watch time is the strongest virality signal — pack the best moment before the midpoint.",
    base_lift: 4,
  },
  {
    category: "length",
    title: () => "Add a loop-back ending",
    detail: () =>
      "Closing on a line that re-references the opening encourages replays, which boosts the algorithm.",
    base_lift: 5,
  },

  // script
  {
    category: "script",
    title: () => "Reduce filler words in voiceover",
    detail: (c) => {
      if (c.scriptLength > 0 && c.scriptLength < 80) return null;
      return "Detected likely filler words ('um', 'like', 'so') in the opening — every word in the first 10s should earn its place.";
    },
    base_lift: 4,
  },
  {
    category: "script",
    title: () => "Tighten sentences to under 12 words",
    detail: (c) =>
      c.scriptLength > 200
        ? "Your script is dense — short sentences read faster on captions and feel more energetic."
        : "Short, punchy sentences read faster on captions and feel more energetic.",
    base_lift: 3,
  },
  {
    category: "script",
    title: () => "Rewrite the second beat with stronger verbs",
    detail: () =>
      "The middle section often loses energy — swap weak verbs for action verbs to keep momentum.",
    base_lift: 4,
  },

  // message
  {
    category: "message",
    title: () => "One core message per video",
    detail: (c) =>
      c.scriptLength > 250
        ? "Your script is long enough to hint at multiple takeaways — viewers retain best when there's exactly one."
        : "Viewers retain best when a video commits to a single takeaway. Cut anything that isn't reinforcing it.",
    base_lift: 7,
  },
  {
    category: "message",
    title: () => "State the takeaway in plain language",
    detail: () =>
      "If a viewer can't repeat your point in one sentence, the algorithm won't surface it to lookalikes either.",
    base_lift: 5,
  },
  {
    category: "message",
    title: () => "Cut the disclaimer or caveat",
    detail: () =>
      "Caveats dilute the punch. Move them to a pinned comment instead of inside the video.",
    base_lift: 3,
  },

  // audience
  {
    category: "audience",
    title: (c) => {
      const tag = firstAudienceTag(c);
      return tag ? `Reframe the opening for ${tag}` : "Sharpen who this is for";
    },
    detail: (c) => {
      const tag = firstAudienceTag(c);
      if (!tag && !c.audienceDescription) return null;
      if (tag)
        return `You're targeting ${tag}, but the tone reads more generic — name them in the first 3 seconds.`;
      return "Calling out the audience by name in the first seconds raises completion rate.";
    },
    base_lift: 9,
  },
  {
    category: "audience",
    title: () => "Use vocabulary your audience uses",
    detail: (c) =>
      c.audienceDescription
        ? "Mirror words from your audience description back into the script — it raises perceived relevance."
        : "Mirror your audience's own vocabulary in the script — it raises perceived relevance.",
    base_lift: 5,
  },
  {
    category: "audience",
    title: (c) => {
      const tag = firstAudienceTag(c);
      return tag ? `Add a "${tag} only" cue` : "Add an in-group cue";
    },
    detail: () =>
      "An explicit in-group signal early on makes target viewers stay and non-target viewers swipe — both help the algorithm.",
    base_lift: 4,
  },

  // cta
  {
    category: "cta",
    title: () => "Move CTA earlier",
    detail: () =>
      "When your CTA only appears at the end, ~70% of viewers never see it. Place it around 0:08.",
    base_lift: 6,
  },
  {
    category: "cta",
    title: () => "Use one CTA, not three",
    detail: () =>
      "Like + comment + follow + share dilutes intent. Pick the single action that maps to your goal.",
    base_lift: 5,
  },
  {
    category: "cta",
    title: () => "Reinforce the CTA in the caption",
    detail: (c) =>
      c.captionLength < 40
        ? "Your caption is short — restate the CTA there for viewers watching with sound off."
        : "Restate the CTA in the caption for viewers watching with sound off.",
    base_lift: 4,
  },

  // visual
  {
    category: "visual",
    title: () => "Add b-roll for the second half",
    detail: () =>
      "Static talking-head from 0:15 onward is the most common cause of mid-video drop-off.",
    base_lift: 5,
  },
  {
    category: "visual",
    title: () => "Vary the framing every 3-4 seconds",
    detail: () =>
      "A simple zoom or angle change resets attention — the eye treats it as a new shot.",
    base_lift: 4,
  },
  {
    category: "visual",
    title: () => "Increase contrast on the subject",
    detail: () =>
      "Higher subject-to-background contrast holds attention on small phone screens.",
    base_lift: 3,
  },

  // editing
  {
    category: "editing",
    title: () => "Cut average shot length to under 2s",
    detail: () =>
      "Short-form pacing rewards tight cuts — anything over ~3s per shot reads as slow.",
    base_lift: 4,
  },
  {
    category: "editing",
    title: () => "Remove silent gaps between sentences",
    detail: () =>
      "Even 0.3s of silence drops watch time — cut hard between sentences with no breathing room.",
    base_lift: 4,
  },
  {
    category: "editing",
    title: () => "Add a visual punch on the key line",
    detail: () =>
      "A flash, zoom, or text pop on the key line cements the moment viewers will share.",
    base_lift: 3,
  },

  // caption
  {
    category: "caption",
    title: () => "Add hard-coded captions",
    detail: (c) =>
      `On ${platformName(c.platform)}, the majority of views happen with sound off — captions are not optional.`,
    base_lift: 10,
  },
  {
    category: "caption",
    title: () => "Highlight one keyword per caption line",
    detail: () =>
      "Bolding or coloring the key word per line gives the eye an anchor and lifts retention.",
    base_lift: 4,
  },
  {
    category: "caption",
    title: () => "Position captions in the middle third",
    detail: (c) =>
      `${platformName(c.platform)} UI overlays the bottom and top — captions in the middle third stay readable.`,
    base_lift: 3,
  },

  // audio
  {
    category: "audio",
    title: () => "Use a trending audio",
    detail: (c) =>
      `Original audio limits algorithmic reach on ${platformName(c.platform)}. Trending sounds boost discovery up to 3x.`,
    base_lift: 7,
  },
  {
    category: "audio",
    title: () => "Layer ambient music at -18dB",
    detail: () =>
      "Even a quiet music bed lifts perceived production value and reduces drop-off in silent moments.",
    base_lift: 4,
  },
  {
    category: "audio",
    title: () => "Boost vocal clarity in the first 3s",
    detail: () =>
      "If the hook isn't crystal clear over a phone speaker, viewers swipe before parsing it.",
    base_lift: 5,
  },

  // thumbnail
  {
    category: "thumbnail",
    title: () => "Choose a high-contrast first frame",
    detail: () =>
      "Your opening frame doubles as the thumbnail on autoplay platforms — low contrast costs scrollers.",
    base_lift: 3,
  },
  {
    category: "thumbnail",
    title: () => "Overlay 3-5 word teaser text on the first frame",
    detail: () =>
      "A short text overlay on frame 1 raises tap-through on grids and search results.",
    base_lift: 4,
  },
  {
    category: "thumbnail",
    title: () => "Show a face in the first frame",
    detail: () =>
      "Faces outperform objects as thumbnails on every short-form platform — even if briefly.",
    base_lift: 3,
  },
];

const GOAL_PRIORITY: Record<Goal, RecommendationCategory[]> = {
  leads: ["cta", "message", "audience"],
  followers: ["hook", "thumbnail", "caption"],
  engagement: ["hook", "script", "editing"],
  reach: ["audio", "caption", "length"],
  awareness: ["message", "visual", "hook"],
  traffic: ["cta", "message"],
  other: [],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function jitter(base: number): number {
  // ±2 with clamp to [2, 15]
  const v = base + Math.floor(Math.random() * 5) - 2;
  return Math.max(2, Math.min(15, v));
}

/**
 * Generate 5-7 recommendations for a submission, biased by goal.
 * Ensures coverage of at least 4 distinct categories.
 */
export function generateRecommendations(ctx: SubmissionContext): Recommendation[] {
  const target = 5 + Math.floor(Math.random() * 3); // 5..7
  const priorities = ctx.goal ? GOAL_PRIORITY[ctx.goal] : [];

  // Materialise candidates with their resolved detail.
  const all = POOL.map((t) => {
    const detail = t.detail(ctx);
    return detail
      ? {
          category: t.category,
          title: t.title(ctx),
          detail,
          predicted_lift: jitter(t.base_lift),
        }
      : null;
  }).filter((x): x is Recommendation => x !== null);

  const fromPriority = shuffle(all.filter((r) => priorities.includes(r.category)));
  const fromOther = shuffle(all.filter((r) => !priorities.includes(r.category)));

  const picked: Recommendation[] = [];
  const usedCategories = new Set<RecommendationCategory>();

  // Take up to 4 from priority categories, max 1 per category to spread.
  for (const r of fromPriority) {
    if (picked.length >= 4) break;
    if (usedCategories.has(r.category)) continue;
    picked.push(r);
    usedCategories.add(r.category);
  }

  // Fill the rest from anywhere (still preferring category diversity).
  const remainder = shuffle([...fromPriority, ...fromOther]).filter(
    (r) => !picked.includes(r),
  );
  for (const r of remainder) {
    if (picked.length >= target) break;
    if (usedCategories.has(r.category) && usedCategories.size < 4) continue;
    picked.push(r);
    usedCategories.add(r.category);
  }

  // Safety net: if still under target and we ran out due to dedup, relax.
  if (picked.length < target) {
    for (const r of remainder) {
      if (picked.length >= target) break;
      if (!picked.includes(r)) picked.push(r);
    }
  }

  // Sort by lift desc.
  picked.sort((a, b) => b.predicted_lift - a.predicted_lift);
  return picked;
}
