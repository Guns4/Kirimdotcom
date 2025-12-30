'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Create a new team
 */
export async function createTeam(teamName: string, businessName?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const { data: teamId, error } = await supabase.rpc('create_team', {
      p_owner_id: user.id,
      p_team_name: teamName,
      p_business_name: businessName,
    });

    if (error) {
      console.error('Error creating team:', error);
      return {
        success: false,
        error: 'Failed to create team',
      };
    }

    return {
      success: true,
      teamId,
      message: 'Team created successfully!',
    };
  } catch (error) {
    console.error('Error in createTeam:', error);
    return {
      success: false,
      error: 'System error',
    };
  }
}

/**
 * Invite member to team
 */
export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: 'staff' | 'manager' = 'staff',
  permissions?: {
    can_view_finance?: boolean;
    can_edit_products?: boolean;
    can_manage_team?: boolean;
  }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Check if user has permission to invite
    const { data: member } = await supabase
      .from('team_members')
      .select('role, can_manage_team')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!member || (!member.can_manage_team && member.role !== 'owner')) {
      return {
        success: false,
        error: 'You do not have permission to invite members',
      };
    }

    const { data: invitationId, error } = await supabase.rpc(
      'create_team_invitation',
      {
        p_team_id: teamId,
        p_invited_by: user.id,
        p_email: email,
        p_role: role,
        p_permissions: permissions ? JSON.stringify(permissions) : null,
      }
    );

    if (error) {
      console.error('Error creating invitation:', error);
      return {
        success: false,
        error: 'Failed to send invitation',
      };
    }

    // TODO: Send invitation email here

    return {
      success: true,
      invitationId,
      message: `Invitation sent to ${email}`,
    };
  } catch (error) {
    console.error('Error in inviteTeamMember:', error);
    return {
      success: false,
      error: 'System error',
    };
  }
}

/**
 * Accept team invitation
 */
export async function acceptInvitation(inviteToken: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const { data: accepted, error } = await supabase.rpc(
      'accept_team_invitation',
      {
        p_invite_token: inviteToken,
        p_user_id: user.id,
      }
    );

    if (error || !accepted) {
      console.error('Error accepting invitation:', error);
      return {
        success: false,
        error: 'Invalid or expired invitation',
      };
    }

    return {
      success: true,
      message: 'Welcome to the team!',
    };
  } catch (error) {
    console.error('Error in acceptInvitation:', error);
    return {
      success: false,
      error: 'System error',
    };
  }
}

/**
 * Get user's teams
 */
export async function getUserTeams() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('team_members')
      .select('*, teams(*)')
      .eq('user_id', user.id)
      .eq('status', 'active');

    return { data, error };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { data: null, error: 'Failed to fetch teams' };
  }
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching team members:', error);
    return { data: null, error: 'Failed to fetch members' };
  }
}

/**
 * Get team activity log
 */
export async function getTeamActivity(teamId: string, limit: number = 50) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('team_activity_log')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching activity:', error);
    return { data: null, error: 'Failed to fetch activity' };
  }
}

/**
 * Log team activity
 */
export async function logActivity(
  teamId: string,
  action: string,
  description?: string,
  metadata?: any
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.rpc('log_team_activity', {
      p_team_id: teamId,
      p_user_id: user.id,
      p_action: action,
      p_description: description,
      p_metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
