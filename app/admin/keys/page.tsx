/**
 * app/admin/keys/page.tsx — Admin API Key Management page.
 *
 * Shows all users' keys with owner information.
 * Non-admins and unauthenticated users are redirected.
 */

import { getSession } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
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
      <header className="border-b border-starling-slate/40 bg-starling-dusk/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/murmur8-logo-compact.svg"
              alt="murmur8"
              width={120}
              height={30}
              priority
            />
            <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
              Admin
            </span>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-starling-silver transition hover:text-starling-cloud"
          >
            ← Dashboard
          </a>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-starling-cloud">All API Keys</h1>
          <p className="text-sm text-starling-silver mt-1">
            All keys across all users. You can revoke any active key.
          </p>
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
