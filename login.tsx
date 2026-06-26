import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Music2, Instagram, Youtube, Facebook, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/connections")({
  component: ConnectionsPage,
});

type Platform = "instagram" | "tiktok" | "youtube" | "facebook";

const PLATFORMS: { id: Platform; label: string; icon: typeof Music2 }[] = [
  { id: "instagram", label: "Instagram (Reels)", icon: Instagram },
  { id: "tiktok", label: "TikTok", icon: Music2 },
  { id: "youtube", label: "YouTube Shorts", icon: Youtube },
  { id: "facebook", label: "Facebook (Reels)", icon: Facebook },
];

function ConnectionsPage() {
  const { user } = useAuth();
  const [waitlisted, setWaitlisted] = useState<Set<Platform>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Platform | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("connection_waitlist")
        .select("platform")
        .eq("user_id", user.id);
      setWaitlisted(new Set((data ?? []).map((r) => r.platform as Platform)));
      setLoading(false);
    })();
  }, [user?.id]);

  const join = async (platform: Platform) => {
    if (!user) return;
    setPending(platform);
    const { error } = await supabase
      .from("connection_waitlist")
      .insert({ user_id: user.id, platform });
    setPending(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setWaitlisted((s) => new Set([...s, platform]));
    toast.success(`Added to the ${platform} waitlist.`);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Connect your social accounts</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ opacity: 0.75 }}>
          Connect your platforms so Oraclip can learn from your past posts and personalize
          predictions. This feature is in development — join the waitlist below to be notified
          when it goes live.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const isOn = waitlisted.has(p.id);
          const isPending = pending === p.id;
          return (
            <div
              key={p.id}
              className="rounded-2xl border p-5"
              style={{
                borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
                background: "color-mix(in oklab, var(--mint) 3%, transparent)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: "color-mix(in oklab, var(--mint) 15%, transparent)",
                    color: "var(--mint)",
                  }}
                >
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.label}</p>
                  <p className="mt-0.5 text-xs" style={{ opacity: 0.6 }}>
                    Not connected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isOn && join(p.id)}
                disabled={isOn || isPending || loading}
                className={cn(
                  "mt-4 w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  isOn ? "cursor-not-allowed" : "hover:scale-[1.01]",
                )}
                style={
                  isOn
                    ? {
                        background: "color-mix(in oklab, var(--mint) 12%, transparent)",
                        color: "color-mix(in oklab, var(--mint) 80%, transparent)",
                      }
                    : { background: "var(--mint)", color: "var(--teal-deep)" }
                }
              >
                {isPending ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : isOn ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> On waitlist
                  </span>
                ) : (
                  "Join waitlist"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed" style={{ opacity: 0.55 }}>
        Once available, connections will let Oraclip analyze your published posts' actual
        performance and refine future predictions for your specific style and audience.
      </p>
    </div>
  );
}
