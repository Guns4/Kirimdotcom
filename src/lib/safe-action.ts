import { createClient } from '@/utils/supabase/server';
import { handleAppError } from './error-handler';
import { ActionResponse } from '@/types';

/**
 * Safe Action Wrapper for Server Actions
 * Wraps logic with Try/Catch, Supabase Authentication check, and standardized return type.
 */
export async function safeAction<TInput, TOutput>(
  action: (input: TInput, user: any | null) => Promise<TOutput>,
  input: TInput,
  options: {
    requireAuth?: boolean;
  } = { requireAuth: false }
): Promise<ActionResponse<TOutput>> {
  try {
    const supabase = await createClient();
    let user = null;

    // Auth Check
    if (options.requireAuth) {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return {
          success: false,
          error: 'Unauthorized. Please login first.',
        };
      }
      user = authUser;
    } else {
      // Optional user fetch
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    // Execute Action
    const result = await action(input, user);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleAppError(error);
  }
}
