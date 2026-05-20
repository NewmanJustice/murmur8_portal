/**
 * app/admin/keys/page.tsx — Admin API Key Management page.
 *
 * Shows all users' keys with owner information.
 * Non-admins and unauthenticated users are redirected.
 */

import { getSession } from '@/auth';
import { redirect } from 'next/navigation';
import { adminListApiKeys } from '@/lib/api-keys-db';
import { computeAdminStats, checkAdminAccess } from '@/lib/admin-key-panel';
import { AdminKeysClient } from './AdminKeysClient';

export const metadata = { title: 'Admin: All API Keys — murmur8 portal' };

export default async function AdminKeysPage() {
  const session = await getSession();
  const sessionLike = session
    ? { user: { id: session.user?.id, isAdmin: (session.user as { isAdmin?: boolean })?.isAdmin } }
    : null;

  const access = checkAdminAccess(sessionLike);
  if (access === 'redirect-login') redirect('/');
  if (access === 'redirect-keys') redirect('/dashboard/keys');

  const keys = await adminListApiKeys();
  const stats = computeAdminStats(keys.map((k) => ({ userId: k.user.id, revokedAt: k.revokedAt })));

  return (
    <main className="min-h-screen bg-starling-night text-starling-cloud">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
                Admin
              </span>
              <h1 className="text-2xl font-semibold text-starling-cloud">All API Keys</h1>
            </div>
            <p className="text-sm text-starling-silver">
              All keys across all users. You can revoke any active key.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total keys', value: stats.total },
            { label: 'Active keys', value: stats.active },
            { label: 'Revoked keys', value: stats.revoked },
            { label: 'Unique owners', value: stats.uniqueOwners },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-starling-dusk border border-starling-slate rounded-brand p-4"
            >
              <p className="text-2xl font-semibold text-starling-cloud">{value}</p>
              <p className="text-xs text-starling-silver mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Client island: table + revoke */}
        <AdminKeysClient keys={keys} />
      </div>
    </main>
  );
}
