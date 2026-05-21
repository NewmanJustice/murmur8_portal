/**
 * app/(dashboard)/keys/page.tsx — User API Key Management page.
 *
 * Server component: fetches keys for the authenticated user.
 * Unauthenticated requests redirect to login.
 */

import { getSession } from '@/auth';
import { redirect } from 'next/navigation';
import { listApiKeys } from '@/lib/api-keys-db';
import { KeysClient } from './KeysClient';

export const metadata = { title: 'API Keys — murmur8 portal' };

export default async function KeysPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/');
  }

  const keys = await listApiKeys(session.user.id);

  return (
    <main className="min-h-screen bg-starling-cloud text-starling-ink">
      <header className="border-b border-starling-cyan/30 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-starling-ink">API Keys</h1>
          <a
            href="/dashboard"
            className="text-sm text-starling-slate transition hover:text-starling-ink"
          >
            ← Dashboard
          </a>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-starling-ink">API Keys</h1>
            <p className="mt-1 text-sm text-starling-slate">
              Keys are used to authenticate the murmur8 pipeline client. Each key is shown
              once at creation and cannot be retrieved again.
            </p>
          </div>
        </div>

        {/* Client island handles form state + modal */}
        <KeysClient initialKeys={keys} />
      </div>
    </main>
  );
}
