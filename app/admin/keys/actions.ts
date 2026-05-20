'use server';

/**
 * app/admin/keys/actions.ts — Admin Server Actions for key management.
 *
 * IMPORTANT: All actions check session.user.isAdmin before executing.
 * Non-admin callers (even via direct form POST) will receive an error;
 * no key mutation occurs.
 */

import { getSession } from '@/auth';
import { adminRevokeApiKey } from '@/lib/api-keys-db';
import { checkAdminAccess } from '@/lib/admin-key-panel';
import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// revokeAnyKey(keyId) — admin can revoke any active key
// ---------------------------------------------------------------------------
export async function revokeAnyKey(
  keyId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  const sessionLike = session
    ? { user: { id: session.user?.id, isAdmin: (session.user as { isAdmin?: boolean })?.isAdmin } }
    : null;

  const access = checkAdminAccess(sessionLike);
  if (access === 'redirect-login') redirect('/');
  if (access === 'redirect-keys') return { error: 'Forbidden: admin access required.' };

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
