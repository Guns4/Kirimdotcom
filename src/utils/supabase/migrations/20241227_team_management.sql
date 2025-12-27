-- =============================================================================
-- TEAM MANAGEMENT SYSTEM
-- Phase 421-425: Corporate Account & Multi-User Access
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- 1. TEAMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Team details
    team_name VARCHAR(255) NOT NULL,
    team_slug VARCHAR(255) UNIQUE NOT NULL,
    -- Owner
    owner_id UUID NOT NULL,
    -- Business info
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    logo_url TEXT,
    -- Settings
    settings JSONB DEFAULT '{}',
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(team_slug);
-- =============================================================================
-- 2. TEAM MEMBERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Relationships
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    -- Role & Permissions
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    -- 'owner', 'manager', 'staff'
    -- Permission flags
    can_view_finance BOOLEAN DEFAULT false,
    can_edit_products BOOLEAN DEFAULT false,
    can_manage_team BOOLEAN DEFAULT false,
    can_track_shipments BOOLEAN DEFAULT true,
    can_reply_chat BOOLEAN DEFAULT true,
    -- Invitation
    invited_by UUID,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    -- 'pending', 'active', 'suspended'
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON public.team_members(team_id, role);
-- =============================================================================
-- 3. TEAM INVITATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Team & Inviter
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL,
    -- Invitee
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'staff',
    -- Invitation details
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    -- Permissions to grant
    permissions JSONB,
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'accepted', 'expired', 'revoked'
    accepted_by UUID,
    accepted_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(invite_token);
-- =============================================================================
-- 4. TEAM ACTIVITY LOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.team_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Team & User
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    -- Activity
    action VARCHAR(100) NOT NULL,
    -- 'checked_tracking', 'replied_chat', 'created_order', etc.
    description TEXT,
    -- Metadata
    metadata JSONB,
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_activity_team ON public.team_activity_log(team_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_user ON public.team_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_action ON public.team_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_team_activity_date ON public.team_activity_log(team_id, created_at DESC);
-- =============================================================================
-- 5. FUNCTION: Create Team
-- =============================================================================
CREATE OR REPLACE FUNCTION create_team(
        p_owner_id UUID,
        p_team_name VARCHAR,
        p_business_name VARCHAR DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_team_id UUID;
v_slug VARCHAR;
BEGIN -- Generate slug
v_slug := LOWER(
    REGEXP_REPLACE(p_team_name, '[^a-zA-Z0-9]+', '-', 'g')
);
v_slug := SUBSTRING(v_slug, 1, 100) || '-' || EXTRACT(
    EPOCH
    FROM NOW()
)::INTEGER;
-- Create team
INSERT INTO public.teams (
        owner_id,
        team_name,
        team_slug,
        business_name
    )
VALUES (
        p_owner_id,
        p_team_name,
        v_slug,
        p_business_name
    )
RETURNING id INTO v_team_id;
-- Add owner as member
INSERT INTO public.team_members (
        team_id,
        user_id,
        role,
        can_view_finance,
        can_edit_products,
        can_manage_team,
        can_track_shipments,
        can_reply_chat,
        joined_at,
        status
    )
VALUES (
        v_team_id,
        p_owner_id,
        'owner',
        true,
        -- Full access
        true,
        true,
        true,
        true,
        NOW(),
        'active'
    );
-- Log activity
INSERT INTO public.team_activity_log (
        team_id,
        user_id,
        action,
        description
    )
VALUES (
        v_team_id,
        p_owner_id,
        'team_created',
        'Team "' || p_team_name || '" created'
    );
RETURN v_team_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 6. FUNCTION: Create Team Invitation
-- =============================================================================
CREATE OR REPLACE FUNCTION create_team_invitation(
        p_team_id UUID,
        p_invited_by UUID,
        p_email VARCHAR,
        p_role VARCHAR DEFAULT 'staff',
        p_permissions JSONB DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_invitation_id UUID;
v_token VARCHAR;
BEGIN -- Generate unique token
v_token := encode(gen_random_bytes(32), 'hex');
-- Create invitation
INSERT INTO public.team_invitations (
        team_id,
        invited_by,
        email,
        role,
        invite_token,
        expires_at,
        permissions,
        status
    )
VALUES (
        p_team_id,
        p_invited_by,
        p_email,
        p_role,
        v_token,
        NOW() + INTERVAL '7 days',
        p_permissions,
        'pending'
    )
RETURNING id INTO v_invitation_id;
-- Log activity
INSERT INTO public.team_activity_log (
        team_id,
        user_id,
        action,
        description,
        metadata
    )
VALUES (
        p_team_id,
        p_invited_by,
        'member_invited',
        'Invited ' || p_email || ' as ' || p_role,
        jsonb_build_object('email', p_email, 'role', p_role)
    );
RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 7. FUNCTION: Accept Team Invitation
-- =============================================================================
CREATE OR REPLACE FUNCTION accept_team_invitation(p_invite_token VARCHAR, p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE v_invitation RECORD;
v_permissions JSONB;
BEGIN -- Get invitation
SELECT * INTO v_invitation
FROM public.team_invitations
WHERE invite_token = p_invite_token
    AND status = 'pending'
    AND expires_at > NOW();
IF NOT FOUND THEN RETURN false;
END IF;
-- Extract permissions
v_permissions := v_invitation.permissions;
-- Add member to team
INSERT INTO public.team_members (
        team_id,
        user_id,
        role,
        can_view_finance,
        can_edit_products,
        can_manage_team,
        can_track_shipments,
        can_reply_chat,
        invited_by,
        invited_at,
        joined_at,
        status
    )
VALUES (
        v_invitation.team_id,
        p_user_id,
        v_invitation.role,
        COALESCE(
            (v_permissions->>'can_view_finance')::BOOLEAN,
            false
        ),
        COALESCE(
            (v_permissions->>'can_edit_products')::BOOLEAN,
            false
        ),
        COALESCE(
            (v_permissions->>'can_manage_team')::BOOLEAN,
            false
        ),
        COALESCE(
            (v_permissions->>'can_track_shipments')::BOOLEAN,
            true
        ),
        COALESCE(
            (v_permissions->>'can_reply_chat')::BOOLEAN,
            true
        ),
        v_invitation.invited_by,
        v_invitation.created_at,
        NOW(),
        'active'
    );
-- Update invitation status
UPDATE public.team_invitations
SET status = 'accepted',
    accepted_by = p_user_id,
    accepted_at = NOW()
WHERE id = v_invitation.id;
-- Log activity
INSERT INTO public.team_activity_log (
        team_id,
        user_id,
        action,
        description
    )
VALUES (
        v_invitation.team_id,
        p_user_id,
        'member_joined',
        'New member joined as ' || v_invitation.role
    );
RETURN true;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 8. FUNCTION: Log Team Activity
-- =============================================================================
CREATE OR REPLACE FUNCTION log_team_activity(
        p_team_id UUID,
        p_user_id UUID,
        p_action VARCHAR,
        p_description TEXT DEFAULT NULL,
        p_metadata JSONB DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_activity_id UUID;
BEGIN
INSERT INTO public.team_activity_log (
        team_id,
        user_id,
        action,
        description,
        metadata
    )
VALUES (
        p_team_id,
        p_user_id,
        p_action,
        p_description,
        p_metadata
    )
RETURNING id INTO v_activity_id;
RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================================================
-- 9. RLS POLICIES
-- =============================================================================
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view teams they belong to" ON public.teams FOR
SELECT USING (
        owner_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members
            WHERE team_id = id
                AND user_id = auth.uid()
                AND status = 'active'
        )
    );
CREATE POLICY "Owners can update their teams" ON public.teams FOR
UPDATE USING (owner_id = auth.uid());
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view team members" ON public.team_members FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.team_members tm
            WHERE tm.team_id = team_id
                AND tm.user_id = auth.uid()
                AND tm.status = 'active'
        )
    );
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view team activity" ON public.team_activity_log FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.team_members
            WHERE team_id = team_activity_log.team_id
                AND user_id = auth.uid()
                AND status = 'active'
        )
    );
-- =============================================================================
-- COMPLETION
-- =============================================================================
DO $$ BEGIN RAISE NOTICE '✅ Team Management System created!';
RAISE NOTICE '👥 Multi-user corporate accounts enabled';
RAISE NOTICE '🔐 RBAC with Owner/Staff roles';
RAISE NOTICE '📧 Email invitation system ready';
RAISE NOTICE '📊 Activity logging implemented';
END $$;