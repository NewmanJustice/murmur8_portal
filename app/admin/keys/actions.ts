'use server';

/**
 * app/admin/keys/actions.ts — Admin Server Actions for key management.
 *
 * IMPORTANT: All actions check session.user.isAdmin before executing.
 * Non-admin callers (even via direct form POST) will receive an error;
 * no key mutation occurs.
 */

import { auth } from '@/auth.js';
import { adminRevokeApiKey } from '@/lib/api-keys-db.js';
import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// revokeAnyKey(keyId) — admin can revoke any active key
// ---------------------------------------------------------------------------
export async function revokeAnyKey(
  keyId: string
): Promise<{ error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  // Gate: non-admins must not be able to invoke this action
  if (!(session.user as { isAdmin?: boolean }).isAdmin) {
    return { error: 'Forbidden: admin access required.' };
  }

  try {
    await adminRevokeApiKey(keyId);
    return {};
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === '409') {
      return { error: 'This key has already been revoked.' };
    }
    console.error('revokeAnyKey error:', err);
    return { error: 'Failed to revoke key. Please try again.' };
  }
}
