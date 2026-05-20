'use server';

/**
 * app/(dashboard)/keys/actions.ts — Server Actions for user key management.
 *
 * All actions require an authenticated session. The session is checked via
 * auth() from auth.ts. Mutations are scoped to the authenticated user's keys.
 */

import { auth } from '@/auth.js';
import { validateKeyName } from '@/lib/api-keys.js';
import { createApiKey, revokeApiKey } from '@/lib/api-keys-db.js';
import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// createKey(formData) — validates name, generates key, returns raw key once
// ---------------------------------------------------------------------------
export async function createKey(
  _prevState: { error?: string; rawKey?: string } | null,
  formData: FormData
): Promise<{ error?: string; rawKey?: string; keyName?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const name = (formData.get('name') as string) ?? '';
  const validationError = validateKeyName(name);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const { record, rawKey } = await createApiKey(session.user.id, name);
    return { rawKey, keyName: record.name };
  } catch (err) {
    console.error('createKey error:', err);
    return { error: 'Failed to create key. Please try again.' };
  }
}

// ---------------------------------------------------------------------------
// revokeKey(keyId) — sets revokedAt on user's own key
// ---------------------------------------------------------------------------
export async function revokeKey(
  keyId: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  try {
    await revokeApiKey(session.user.id, keyId);
    return {};
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === '409') {
      return { error: 'This key has already been revoked.' };
    }
    console.error('revokeKey error:', err);
    return { error: 'Failed to revoke key. Please try again.' };
  }
}
