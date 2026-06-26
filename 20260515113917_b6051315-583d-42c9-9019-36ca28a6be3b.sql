
-- ============================================================
-- 1. submission_snapshot on simulation_runs
-- ============================================================
ALTER TABLE public.simulation_runs
  ADD COLUMN submission_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.simulation_runs.submission_snapshot IS
  'Frozen copy of submission state at run time: { caption, body_text, target_platform, media_url }. Reads MUST come from here, not from the live content_submissions row.';

-- ============================================================
-- 2. handle_new_user already updated in prior migration to create
--    personal org + membership + profile. No change needed here.
--    Backfill any pre-existing users that lack a personal org.
-- ============================================================
DO $$
DECLARE
  u RECORD;
  _org_id UUID;
BEGIN
  FOR u IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.default_organization_id IS NULL
  LOOP
    INSERT INTO public.organizations (name, type, plan, seat_count, created_by)
    VALUES (
      COALESCE(u.raw_user_meta_data->>'display_name', u.email) || '''s workspace',
      'personal', 'team', 1, u.id
    )
    RETURNING id INTO _org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role, accepted_at)
    VALUES (_org_id, u.id, 'owner', now())
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    INSERT INTO public.profiles (id, display_name, default_organization_id)
    VALUES (u.id, COALESCE(u.raw_user_meta_data->>'display_name', u.email), _org_id)
    ON CONFLICT (id) DO UPDATE SET default_organization_id = EXCLUDED.default_organization_id
      WHERE public.profiles.default_organization_id IS NULL;
  END LOOP;
END $$;

-- ============================================================
-- 3. content_submissions.organization_id NOT NULL + RESTRICT FK
-- ============================================================
UPDATE public.content_submissions cs
SET organization_id = p.default_organization_id
FROM public.profiles p
WHERE cs.organization_id IS NULL
  AND p.id = cs.created_by_user_id
  AND p.default_organization_id IS NOT NULL;

ALTER TABLE public.content_submissions
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.content_submissions
  DROP CONSTRAINT IF EXISTS content_submissions_organization_id_fkey;
ALTER TABLE public.content_submissions
  ADD CONSTRAINT content_submissions_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;

ALTER TABLE public.organization_members
  DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;
ALTER TABLE public.organization_members
  ADD CONSTRAINT organization_members_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;

-- ============================================================
-- 4. Org-scoped-only RLS on content_submissions, no DELETE policy
-- ============================================================
DROP POLICY IF EXISTS submissions_select ON public.content_submissions;
DROP POLICY IF EXISTS submissions_insert ON public.content_submissions;
DROP POLICY IF EXISTS submissions_update ON public.content_submissions;
DROP POLICY IF EXISTS submissions_delete ON public.content_submissions;

CREATE POLICY "submissions_select" ON public.content_submissions
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "submissions_insert" ON public.content_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND public.is_org_member(organization_id, auth.uid())
  );

CREATE POLICY "submissions_update" ON public.content_submissions
  FOR UPDATE TO authenticated
  USING (
    created_by_user_id = auth.uid()
    OR public.has_org_role(organization_id, auth.uid(),
                           ARRAY['owner','admin']::public.org_member_role[])
  );

-- ============================================================
-- 5. Drop hard-delete policy on organizations (soft-delete only)
-- ============================================================
DROP POLICY IF EXISTS orgs_delete_owner ON public.organizations;

-- ============================================================
-- 6. Helpers: ignore soft-deleted orgs everywhere
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.organization_id = _org_id
      AND om.user_id = _user_id
      AND om.accepted_at IS NOT NULL
      AND o.deleted_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_org_id UUID, _user_id UUID, _roles public.org_member_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.organization_id = _org_id
      AND om.user_id = _user_id
      AND om.accepted_at IS NOT NULL
      AND o.deleted_at IS NULL
      AND om.role = ANY(_roles)
  )
$$;

COMMENT ON COLUMN public.content_submissions.media_extracted_metadata IS
  'Video-specific extracted data lives here as JSONB until the shape stabilizes (transcript, frame analysis, scene graph, etc.). Do NOT create a video_submissions child table without an explicit migration plan.';

COMMENT ON COLUMN public.organizations.deleted_at IS
  'Soft-delete timestamp. Hard-delete is forbidden via RLS and blocked by RESTRICT FKs from submissions and members. Service-role cleanup job removes the org only after the contractual retention window expires: delete submissions -> delete members -> delete org. See docs/data-lifecycle.md.';
