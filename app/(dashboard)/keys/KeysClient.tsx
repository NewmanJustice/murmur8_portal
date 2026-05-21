'use client';

/**
 * KeysClient.tsx — Client component for the API Keys page.
 *
 * Handles:
 * - New key form (useActionState)
 * - One-time reveal modal (shown once after creation, closed by "I've copied it")
 * - Revoke confirmation dialog per key
 */

import { useActionState, useState } from 'react';
import { createKey, revokeKey } from './actions';

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

interface KeysClientProps {
  initialKeys: ApiKeyRow[];
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
// CopyButton — per-row copy key prefix to clipboard
// ---------------------------------------------------------------------------
function CopyButton({ keyPrefix }: { keyPrefix: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    try {
      navigator.clipboard.writeText(keyPrefix).then(() => setCopied(true)).catch(() => {});
    } catch {}
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy key prefix"
      className="text-starling-slate hover:text-starling-ink transition-colors"
    >
      {copied ? (
        <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// RevealModal — shown once after key creation
// ---------------------------------------------------------------------------
function RevealModal({
  rawKey,
  keyName,
  onDismiss,
}: {
  rawKey: string;
  keyName: string;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-starling-dusk border border-starling-slate rounded-brand-lg max-w-lg w-full p-6 shadow-brand">
        <h2 className="text-lg font-semibold text-starling-cloud mb-1">
          Key created: <span className="text-agent-codey">{keyName}</span>
        </h2>
        <p className="text-sm text-amber-400 font-medium mb-4">
          Copy this key now — you will not see it again.
        </p>

        {/* Raw key display */}
        <div className="bg-starling-ink rounded-brand font-mono text-xs text-starling-sky break-all p-3 mb-4 select-all">
          {rawKey}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-starling-blue hover:bg-sky-600 text-white text-sm font-medium py-2 px-4 rounded-brand transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-starling-slate hover:bg-starling-silver/20 text-starling-cloud text-sm font-medium py-2 px-4 rounded-brand transition-colors"
          >
            {"I've copied it — close"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RevokeButton — per-row revoke with confirmation
// ---------------------------------------------------------------------------
function RevokeButton({ keyId, keyName }: { keyId: string; keyName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function handleConfirm() {
    setRevoking(true);
    const result = await revokeKey(keyId);
    if (result?.error) {
      setError(result.error);
      setRevoking(false);
      setConfirming(false);
    }
    // On success, Next.js revalidates automatically via revalidatePath in action
    // but since we're in a client component we reload the page to reflect the change.
    if (!result?.error) {
      window.location.reload();
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-amber-400">
          Revoke <strong>{keyName}</strong>? This action is permanent and cannot be undone.
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
            className="text-xs text-starling-slate hover:text-starling-ink px-3 py-1 rounded transition-colors"
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
// KeysClient — main export
// ---------------------------------------------------------------------------
export function KeysClient({ initialKeys }: KeysClientProps) {
  const [revealData, setRevealData] = useState<{
    rawKey: string;
    keyName: string;
  } | null>(null);

  const [formState, formAction, isPending] = useActionState(
    async (prev: { error?: string; rawKey?: string; keyName?: string } | null, formData: FormData) => {
      const result = await createKey(prev, formData);
      if (result.rawKey && result.keyName) {
        setRevealData({ rawKey: result.rawKey, keyName: result.keyName });
        // Reload to show new key in list
        window.location.reload();
      }
      return result;
    },
    null
  );

  return (
    <>
      {/* One-time reveal modal */}
      {revealData && (
        <RevealModal
          rawKey={revealData.rawKey}
          keyName={revealData.keyName}
          onDismiss={() => setRevealData(null)}
        />
      )}

      {/* New Key form */}
      <div className="bg-white border border-starling-cyan/30 rounded-brand-lg p-5 mb-6">
        <h2 className="text-sm font-semibold text-starling-slate mb-3 uppercase tracking-wide">
          Create new key
        </h2>
        <form action={formAction} className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              name="name"
              placeholder="Key name (e.g. my-saas-project)"
              maxLength={64}
              required
              className="w-full bg-starling-cloud border border-starling-cyan/40 rounded-brand text-sm text-starling-ink placeholder-starling-silver px-3 py-2 focus:outline-none focus:border-starling-sky transition-colors"
            />
            {formState?.error && (
              <p className="mt-1 text-xs text-red-400">{formState.error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-starling-blue hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-brand transition-colors whitespace-nowrap"
          >
            {isPending ? 'Creating…' : 'New Key'}
          </button>
        </form>
      </div>

      {/* Keys table */}
      {initialKeys.length === 0 ? (
        <div className="text-center py-16 text-starling-slate text-sm">
          No API keys yet. Create one above to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-brand-lg border border-starling-cyan/30 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-starling-cyan/30 bg-starling-cloud/50 text-starling-slate text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Key Prefix</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Last Used</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {initialKeys.map((key) => (
                <tr
                  key={key.id}
                  className="border-b border-starling-cyan/20 last:border-0 hover:bg-starling-mist transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-starling-ink">{key.name}</td>
                  <td className="px-4 py-3 font-mono text-starling-blue text-xs">{key.keyPrefix}</td>
                  <td className="px-4 py-3 text-starling-slate">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3 text-starling-slate">{formatDate(key.lastUsedAt)}</td>
                  <td className="px-4 py-3">
                    {key.revokedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-starling-silver/20 text-starling-slate">
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CopyButton keyPrefix={key.keyPrefix} />
                      {!key.revokedAt && (
                        <RevokeButton keyId={key.id} keyName={key.name} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
