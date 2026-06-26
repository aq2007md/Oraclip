import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CREATOR_TYPES,
  NICHES,
  GOALS,
  AUDIENCE_SIZES,
  CADENCES,
  COUNTRIES,
} from "@/lib/onboarding-options";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/account/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [creatorType, setCreatorType] = useState<string>("");
  const [primaryNiche, setPrimaryNiche] = useState<string>("");
  const [nicheCustom, setNicheCustom] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<string>("");
  const [primaryGoalCustom, setPrimaryGoalCustom] = useState("");
  const [audienceSize, setAudienceSize] = useState<string>("");
  const [audienceDescription, setAudienceDescription] = useState("");
  const [postingCadence, setPostingCadence] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setCreatorType(profile.creator_type ?? "");
    setPrimaryNiche(profile.primary_niche ?? "");
    setNicheCustom(profile.niche_custom ?? "");
    setPrimaryGoal(profile.primary_goal ?? "");
    setPrimaryGoalCustom(profile.primary_goal_custom ?? "");
    setAudienceSize(profile.audience_size ?? "");
    setAudienceDescription(profile.audience_description ?? "");
    setPostingCadence(profile.posting_cadence ?? "");
    setCountry(profile.country ?? "");
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        creator_type: creatorType || null,
        primary_niche: primaryNiche || null,
        niche_custom: primaryNiche === "other" ? nicheCustom.trim() || null : null,
        primary_goal: primaryGoal || null,
        primary_goal_custom: primaryGoal === "other" ? primaryGoalCustom.trim() || null : null,
        audience_size: audienceSize || null,
        audience_description: audienceDescription.trim() || null,
        posting_cadence: postingCadence || null,
        country: country || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile updated. Your next simulations will reflect these changes.");
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Profile & preferences</h1>
        <p className="mt-1 text-sm" style={{ opacity: 0.7 }}>
          Edit how Oraclip understands you and your audience.
        </p>
      </header>

      <Section title="Account basics">
        <Field label="Display name">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border-white/15 bg-white/5 text-teal-foreground"
            maxLength={120}
          />
        </Field>
        <Field label="Email">
          <Input value={user?.email ?? ""} readOnly className="border-white/10 bg-white/[0.02] text-teal-foreground/60" />
          <button
            type="button"
            onClick={() => toast("Email change coming soon.")}
            className="mt-1 text-xs text-mint hover:underline"
          >
            Change email
          </button>
        </Field>
      </Section>

      <Section title="Creator profile">
        <Field label="Creator type">
          <SelectField value={creatorType} onChange={setCreatorType} placeholder="Select…">
            {CREATOR_TYPES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectField>
        </Field>
        <Field label="Primary niche">
          <SelectField value={primaryNiche} onChange={setPrimaryNiche} placeholder="Select…">
            {NICHES.map((n) => (
              <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
            ))}
          </SelectField>
          {primaryNiche === "other" && (
            <Input
              value={nicheCustom}
              onChange={(e) => setNicheCustom(e.target.value)}
              placeholder="Describe your niche"
              maxLength={120}
              className="mt-2 border-white/15 bg-white/5 text-teal-foreground"
            />
          )}
        </Field>
        <Field label="Primary goal">
          <SelectField value={primaryGoal} onChange={setPrimaryGoal} placeholder="Select…">
            {GOALS.map((g) => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectField>
          {primaryGoal === "other" && (
            <Input
              value={primaryGoalCustom}
              onChange={(e) => setPrimaryGoalCustom(e.target.value)}
              placeholder="Describe your goal"
              maxLength={200}
              className="mt-2 border-white/15 bg-white/5 text-teal-foreground"
            />
          )}
        </Field>
        <Field label="Audience size">
          <SelectField value={audienceSize} onChange={setAudienceSize} placeholder="Select…">
            {AUDIENCE_SIZES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectField>
        </Field>
        <Field label="Audience description">
          <Textarea
            value={audienceDescription}
            onChange={(e) => setAudienceDescription(e.target.value)}
            placeholder="Tell us about who watches your videos."
            rows={4}
            maxLength={500}
            className="border-white/15 bg-white/5 text-teal-foreground"
          />
        </Field>
        <Field label="Posting cadence">
          <SelectField value={postingCadence} onChange={setPostingCadence} placeholder="Select…">
            {CADENCES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectField>
        </Field>
        <Field label="Country / region">
          <SelectField value={country} onChange={setCountry} placeholder="Select…">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
            ))}
          </SelectField>
        </Field>
      </Section>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full px-6"
          style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl border p-6"
      style={{
        borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
        background: "color-mix(in oklab, var(--mint) 3%, transparent)",
      }}
    >
      <h2 className="mb-5 text-lg font-semibold">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-teal-foreground/70">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="border-white/15 bg-white/5 text-sm text-teal-foreground">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}
