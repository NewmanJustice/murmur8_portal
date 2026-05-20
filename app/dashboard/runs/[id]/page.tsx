import { getSession } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { getRunDetail } from '@/lib/runs';
import {
  formatDuration,
  formatCost,
  statusBadgeClass,
  parseStages,
  stageAccentClass,
  formatNullable,
  showRefinementLink,
} from '@/lib/run-detail';

interface RunDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user as typeof session.user & {
    id?: string;
  };

  const userId = user.id;
  if (!userId) {
    redirect('/');
  }

  const { id } = await params;
  const run = await getRunDetail(id, userId);

  if (!run) {
    notFound();
  }

  const stages = parseStages(run.stages);
  const refinementLink = showRefinementLink(run.type, run.parentRunId);

  const durationDisplay = run.totalDurationMs !== null
    ? formatDuration(run.totalDurationMs)
    : '—';

  const costDisplay = run.totalCost !== null && run.totalCost !== undefined
    ? formatCost(Number(run.totalCost))
    : '—';

  return (
    <main className="min-h-screen bg-starling-cloud text-starling-ink">
      {/* Header */}
      <header className="border-b border-starling-cyan/30 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-mono text-sm font-semibold text-starling-blue">
            murmur8
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Back link */}
        <a
          href="/dashboard/runs"
          className="mb-6 inline-flex items-center gap-1 text-sm text-starling-slate transition hover:text-starling-ink"
        >
          ← Back to runs
        </a>

        {/* Run header card */}
        <div className="mb-8 rounded-brand border border-starling-cyan/30 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-extrabold tracking-tight text-starling-ink">
              {run.slug}
            </h1>
            <span className={statusBadgeClass(run.status)}>{run.status}</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-starling-slate bg-starling-cloud">
              {run.type}
            </span>
          </div>

          {/* Refinement link */}
          {refinementLink && (
            <div className="mb-4">
              <a
                href={`/dashboard/runs/${run.parentRunId}`}
                className="text-sm font-semibold text-starling-blue underline hover:text-starling-sky"
              >
                View parent run
              </a>
            </div>
          )}

          {/* Key metrics */}
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-starling-slate">
                Duration
              </dt>
              <dd className="mt-1 font-mono text-sm text-starling-ink">{durationDisplay}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-starling-slate">
                Total cost
              </dt>
              <dd className="mt-1 font-mono text-sm text-starling-ink">{costDisplay}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-starling-slate">
                Started
              </dt>
              <dd className="mt-1 font-mono text-sm text-starling-ink">
                {run.startedAt.toISOString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-starling-slate">
                Completed
              </dt>
              <dd className="mt-1 font-mono text-sm text-starling-ink">
                {run.completedAt ? run.completedAt.toISOString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-starling-slate">
                Commit
              </dt>
              <dd className="mt-1 font-mono text-sm text-starling-ink">
                {formatNullable(run.commitHash)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-starling-slate">
                Failed stage
              </dt>
              <dd className="mt-1 font-mono text-sm text-starling-ink">
                {formatNullable(run.failedStage)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Stage breakdown */}
        {stages.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-starling-ink">Stage Breakdown</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {stages.map(({ key, data }) => {
                const accentClass = stageAccentClass(key);
                const stageData = data as Record<string, unknown> | null;

                return (
                  <div
                    key={key}
                    className={`rounded-brand border-l-4 bg-white p-5 shadow-sm ${accentClass}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className={`font-mono text-sm font-bold ${accentClass.split(' ')[1]}`}>
                        {key}
                      </h3>
                      {stageData?.status !== undefined && (
                        <span className={statusBadgeClass(String(stageData.status))}>
                          {String(stageData.status)}
                        </span>
                      )}
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="font-medium uppercase tracking-wide text-starling-slate">
                          Duration
                        </dt>
                        <dd className="mt-0.5 font-mono text-starling-ink">
                          {stageData?.durationMs !== undefined && stageData.durationMs !== null
                            ? formatDuration(Number(stageData.durationMs))
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium uppercase tracking-wide text-starling-slate">
                          Tokens
                        </dt>
                        <dd className="mt-0.5 font-mono text-starling-ink">
                          {formatNullable(
                            stageData?.tokens !== undefined
                              ? (stageData.tokens as string | number | null)
                              : null
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium uppercase tracking-wide text-starling-slate">
                          Cost
                        </dt>
                        <dd className="mt-0.5 font-mono text-starling-ink">
                          {stageData?.cost !== undefined && stageData.cost !== null
                            ? formatCost(Number(stageData.cost))
                            : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium uppercase tracking-wide text-starling-slate">
                          Feedback
                        </dt>
                        <dd className="mt-0.5 font-mono text-starling-ink">
                          {formatNullable(
                            stageData?.feedbackRating !== undefined
                              ? (stageData.feedbackRating as string | number | null)
                              : null
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
