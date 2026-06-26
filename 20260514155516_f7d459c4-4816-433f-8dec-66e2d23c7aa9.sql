
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('creator', 'team_member');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'team', 'enterprise');
CREATE TYPE public.org_plan AS ENUM ('team', 'enterprise');
CREATE TYPE public.org_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.content_type AS ENUM ('text', 'video');
CREATE TYPE public.platform AS ENUM ('tiktok', 'instagram', 'youtube', 'x', 'linkedin', 'facebook', 'other');
CREATE TYPE public.simulation_status AS ENUM ('queued', 'running', 'succeeded', 'failed');
CREATE TYPE public.confidence_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.billable_reason AS ENUM ('compute_started', 'ai_inference_ran', 'gpu_used');

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan public.org_plan NOT NULL DEFAULT 'team',
  seat_count INTEGER NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_organizations_created_by ON public.organizations(created_by);
CREATE INDEX idx_organizations_deleted_at ON public.organizations(deleted_at);

-- ORGANIZATION MEMBERS
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_member_role NOT NULL DEFAULT 'member',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_accepted ON public.organization_members(accepted_at);

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role public.app_role NOT NULL DEFAULT 'creator',
  subscription_tier public.subscription_tier NOT NULL DEFAULT 'free',
  niche TEXT,
  primary_platform public.platform,
  default_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_default_org ON public.profiles(default_organization_id);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- ORG MEMBERSHIP HELPERS
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = _user_id AND accepted_at IS NOT NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_org_id UUID, _user_id UUID, _roles public.org_member_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = _user_id
      AND accepted_at IS NOT NULL AND role = ANY(_roles)
  )
$$;

-- CONTENT SUBMISSIONS
CREATE TABLE public.content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  type public.content_type NOT NULL,
  target_platform public.platform NOT NULL,
  caption TEXT,
  body_text TEXT,
  media_url TEXT,
  media_size_bytes BIGINT,
  media_duration_seconds NUMERIC(10,2),
  media_extracted_metadata JSONB,
  raw_media_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_submissions_user ON public.content_submissions(created_by_user_id);
CREATE INDEX idx_submissions_org ON public.content_submissions(organization_id);
CREATE INDEX idx_submissions_platform ON public.content_submissions(target_platform);
CREATE INDEX idx_submissions_type ON public.content_submissions(type);
CREATE INDEX idx_submissions_created_at ON public.content_submissions(created_at DESC);
CREATE INDEX idx_submissions_deleted_at ON public.content_submissions(deleted_at);
CREATE INDEX idx_submissions_raw_expires ON public.content_submissions(raw_media_expires_at) WHERE raw_media_expires_at IS NOT NULL;

-- SIMULATION RUNS
CREATE TABLE public.simulation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.content_submissions(id) ON DELETE CASCADE,
  triggered_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status public.simulation_status NOT NULL DEFAULT 'queued',
  virality_score SMALLINT CHECK (virality_score IS NULL OR (virality_score BETWEEN 0 AND 100)),
  reach_low INTEGER CHECK (reach_low IS NULL OR reach_low >= 0),
  reach_high INTEGER CHECK (reach_high IS NULL OR reach_high >= 0),
  confidence public.confidence_level,
  raw_response JSONB,
  is_billable BOOLEAN NOT NULL DEFAULT FALSE,
  billable_reason public.billable_reason,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reach_range_valid CHECK (reach_low IS NULL OR reach_high IS NULL OR reach_high >= reach_low)
);
CREATE INDEX idx_runs_submission ON public.simulation_runs(submission_id);
CREATE INDEX idx_runs_user ON public.simulation_runs(triggered_by_user_id);
CREATE INDEX idx_runs_status ON public.simulation_runs(status);
CREATE INDEX idx_runs_billable ON public.simulation_runs(is_billable) WHERE is_billable = TRUE;
CREATE INDEX idx_runs_created_at ON public.simulation_runs(created_at DESC);

-- ACCESS HELPERS (after referenced tables exist)
CREATE OR REPLACE FUNCTION public.can_access_submission(_submission_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.content_submissions cs
    WHERE cs.id = _submission_id
      AND (cs.created_by_user_id = _user_id
           OR (cs.organization_id IS NOT NULL AND public.is_org_member(cs.organization_id, _user_id)))
  )
$$;

CREATE OR REPLACE FUNCTION public.can_access_run(_run_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.simulation_runs sr
    JOIN public.content_submissions cs ON cs.id = sr.submission_id
    WHERE sr.id = _run_id
      AND (cs.created_by_user_id = _user_id
           OR (cs.organization_id IS NOT NULL AND public.is_org_member(cs.organization_id, _user_id)))
  )
$$;

-- AUDIENCE REACTIONS
CREATE TABLE public.audience_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
  persona_label TEXT NOT NULL,
  persona_attributes JSONB,
  sentiment NUMERIC(3,2) CHECK (sentiment IS NULL OR sentiment BETWEEN -1 AND 1),
  predicted_action TEXT,
  reaction_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reactions_run ON public.audience_reactions(run_id);

-- RECOMMENDATIONS
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
  category TEXT,
  suggestion TEXT NOT NULL,
  predicted_score_lift SMALLINT CHECK (predicted_score_lift IS NULL OR predicted_score_lift BETWEEN -100 AND 100),
  priority SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recs_run ON public.recommendations(run_id);
CREATE INDEX idx_recs_priority ON public.recommendations(run_id, priority DESC);

-- SIMILAR REFERENCES
CREATE TABLE public.similar_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
  reference_url TEXT,
  reference_title TEXT,
  platform public.platform,
  similarity_score NUMERIC(4,3) CHECK (similarity_score IS NULL OR similarity_score BETWEEN 0 AND 1),
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_similar_run ON public.similar_references(run_id);

-- STYLE PROFILES
CREATE TABLE public.style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  patterns JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding_version TEXT,
  sample_count INTEGER NOT NULL DEFAULT 0,
  last_trained_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_style_user ON public.style_profiles(user_id);

-- MONTHLY USAGE
CREATE TABLE public.monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  billable_simulations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, period_start)
);
CREATE INDEX idx_usage_user_period ON public.monthly_usage(user_id, period_start DESC);
CREATE INDEX idx_usage_org_period ON public.monthly_usage(organization_id, period_start DESC);

-- updated_at TRIGGER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_orgs_touch BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_subs_touch BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_style_touch BEFORE UPDATE ON public.style_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_usage_touch BEFORE UPDATE ON public.monthly_usage
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.similar_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "orgs_select_member" ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(id, auth.uid()));
CREATE POLICY "orgs_insert_self" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "orgs_update_admin" ON public.organizations
  FOR UPDATE TO authenticated USING (public.has_org_role(id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[]));
CREATE POLICY "orgs_delete_owner" ON public.organizations
  FOR DELETE TO authenticated USING (public.has_org_role(id, auth.uid(), ARRAY['owner']::public.org_member_role[]));

CREATE POLICY "org_members_select" ON public.organization_members
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_org_member(organization_id, auth.uid())
  );
CREATE POLICY "org_members_insert_admin" ON public.organization_members
  FOR INSERT TO authenticated WITH CHECK (
    public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[])
  );
CREATE POLICY "org_members_update_self_or_admin" ON public.organization_members
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid()
    OR public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[])
  );
CREATE POLICY "org_members_delete_admin" ON public.organization_members
  FOR DELETE TO authenticated USING (
    user_id = auth.uid()
    OR public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[])
  );

CREATE POLICY "submissions_select" ON public.content_submissions
  FOR SELECT TO authenticated USING (
    created_by_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id, auth.uid()))
  );
CREATE POLICY "submissions_insert" ON public.content_submissions
  FOR INSERT TO authenticated WITH CHECK (
    created_by_user_id = auth.uid()
    AND (organization_id IS NULL OR public.is_org_member(organization_id, auth.uid()))
  );
CREATE POLICY "submissions_update" ON public.content_submissions
  FOR UPDATE TO authenticated USING (
    created_by_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[]))
  );
CREATE POLICY "submissions_delete" ON public.content_submissions
  FOR DELETE TO authenticated USING (
    created_by_user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[]))
  );

CREATE POLICY "runs_select" ON public.simulation_runs
  FOR SELECT TO authenticated USING (public.can_access_submission(submission_id, auth.uid()));
CREATE POLICY "runs_insert" ON public.simulation_runs
  FOR INSERT TO authenticated WITH CHECK (
    triggered_by_user_id = auth.uid()
    AND public.can_access_submission(submission_id, auth.uid())
  );

CREATE POLICY "reactions_select" ON public.audience_reactions
  FOR SELECT TO authenticated USING (public.can_access_run(run_id, auth.uid()));
CREATE POLICY "recs_select" ON public.recommendations
  FOR SELECT TO authenticated USING (public.can_access_run(run_id, auth.uid()));
CREATE POLICY "similar_select" ON public.similar_references
  FOR SELECT TO authenticated USING (public.can_access_run(run_id, auth.uid()));

CREATE POLICY "style_select_own" ON public.style_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "style_insert_own" ON public.style_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "style_update_own" ON public.style_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "usage_select" ON public.monthly_usage
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR (organization_id IS NOT NULL AND public.has_org_role(organization_id, auth.uid(), ARRAY['owner','admin']::public.org_member_role[]))
  );
