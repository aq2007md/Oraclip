
-- ============================================================
-- A. org type enum + column (personal vs team)
-- ============================================================
CREATE TYPE public.org_type AS ENUM ('personal', 'team');

ALTER TABLE public.organizations
  ADD COLUMN type public.org_type NOT NULL DEFAULT 'team';

COMMENT ON COLUMN public.organizations.type IS
  'personal = auto-created on signup, 1 owner, cannot be deleted while owner exists. team = user-created shared workspace.';

-- Backfill: any org whose creator is also its sole accepted member is personal.
UPDATE public.organizations o
SET type = 'personal'
WHERE EXISTS (
  SELECT 1
  FROM public.organization_members om
  WHERE om.organization_id = o.id
    AND om.user_id = o.created_by
    AND om.accepted_at IS NOT NULL
)
AND (
  SELECT COUNT(*) FROM public.organization_members om
  WHERE om.organization_id = o.id AND om.accepted_at IS NOT NULL
) = 1;

-- ============================================================
-- B. Update signup trigger to mark the auto-org as personal
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
  _name   TEXT;
BEGIN
  _name := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email);

  INSERT INTO public.organizations (name, type, plan, seat_count, created_by)
  VALUES (_name || '''s workspace', 'personal', 'team', 1, NEW.id)
  RETURNING id INTO _org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, accepted_at)
  VALUES (_org_id, NEW.id, 'owner', now());

  INSERT INTO public.profiles (id, display_name, default_organization_id)
  VALUES (NEW.id, _name, _org_id);

  RETURN NEW;
END;
$$;

-- ============================================================
-- C. Trigger: prevent soft-deleting a personal org while owner exists
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_personal_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire on a soft-delete transition (NULL -> NOT NULL).
  IF NEW.deleted_at IS NULL OR OLD.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Only personal orgs are protected.
  IF NEW.type <> 'personal' THEN
    RETURN NEW;
  END IF;

  -- Block if the creator's auth user still exists.
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.created_by) THEN
    RAISE EXCEPTION
      'Cannot soft-delete personal organization % while owner % is still an active user. Delete the user account instead.',
      NEW.id, NEW.created_by
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_personal_org
  BEFORE UPDATE OF deleted_at ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_personal_org();

-- ============================================================
-- D. Make profiles.default_organization_id NOT NULL
-- ============================================================
-- Defensive backfill (handle_new_user already populates for new signups,
-- and the prior migration backfilled existing users).
UPDATE public.profiles p
SET default_organization_id = (
  SELECT om.organization_id
  FROM public.organization_members om
  JOIN public.organizations o ON o.id = om.organization_id
  WHERE om.user_id = p.id
    AND o.type = 'personal'
    AND o.created_by = p.id
  LIMIT 1
)
WHERE p.default_organization_id IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN default_organization_id SET NOT NULL;

-- ============================================================
-- E. Active-org index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_organizations_active
  ON public.organizations(id) WHERE deleted_at IS NULL;
