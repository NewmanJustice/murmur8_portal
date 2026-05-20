'use client';

/**
 * AdminKeysClient.tsx — Client component for the admin keys table.
 * Handles per-row revoke confirmation dialogs.
 */

import { useState } from 'react';
import { revokeAnyKey } from './actions';

interface KeyOwner {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AdminKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  user: KeyOwner;
}

interface AdminKeysClientProps {
  keys: AdminKeyRow[];
}

function formatDate(d: Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// AdminRevokeButton — per-row revoke with confirmation; shows owner name
// ---------------------------------------------------------------------------
function AdminRevokeButton({
  keyId,
  keyName,
  ownerName,
}: {
  keyId: string;
  keyName: string;
  ownerName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function handleConfirm() {
    setRevoking(true);
    const result = await revokeAnyKey(keyId);
    if (result?.error) {
      setError(result.error);
      setRevoking(false);
      setConfirming(false);
    } else {
      window.location.reload();
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-amber-400">
          Revoke <strong>{keyName}</strong> owned by <strong>{ownerName}</strong>?
          This action is permanent and cannot be undone.
        </p>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={revoking}
            className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded transition-colors"
          >
            {revoking ? 'Revoking…' : 'Confirm revoke'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-starling-silver hover:text-starling-cloud px-3 py-1 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
    >
      Revoke
    </button>
  );
}

// ---------------------------------------------------------------------------
// AdminKeysClient — main export
// ---------------------------------------------------------------------------
export function AdminKeysClient({ keys }: AdminKeysClientProps) {
  if (keys.length === 0) {
    return (
      <div className="text-center py-16 text-starling-silver text-sm">
        No API keys have been created yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-brand-lg border border-starling-slate">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-starling-slate text-starling-silver text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3">Owner</th>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Key Prefix</th>
            <th className="text-left px-4 py-3">Created</th>
            <th className="text-left px-4 py-3">Last Used</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr
              key={key.id}
              className="border-b border-starling-slate/50 last:border-0 hover:bg-starling-dusk/30 transition-colors"
            >
              {/* Owner */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {key.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={key.user.avatarUrl}
                      alt={key.user.name ?? 'User'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-starling-slate flex items-center justify-center text-xs text-starling-silver">
                      {(key.user.name ?? '?')[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-starling-cloud text-xs font-medium">
                    {key.user.name ?? 'Unknown'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-starling-cloud">{key.name}</td>
              <td className="px-4 py-3 font-mono text-starling-sky text-xs">{key.keyPrefix}</td>
              <td className="px-4 py-3 text-starling-silver">{formatDate(key.createdAt)}</td>
              <td className="px-4 py-3 text-starling-silver">{formatDate(key.lastUsedAt)}</td>
              <td className="px-4 py-3">
                {key.revokedAt ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-starling-slate/40 text-starling-silver">
                    Revoked
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-400">
                    Active
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {!key.revokedAt && (
                  <AdminRevokeButton
                    keyId={key.id}
                    keyName={key.name}
                    ownerName={key.user.name ?? 'Unknown'}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
