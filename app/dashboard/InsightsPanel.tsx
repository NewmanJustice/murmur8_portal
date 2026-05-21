/**
 * InsightsPanel — Server Component
 * Renders aggregate insights: stat cards, stage breakdown, failure callout.
 */

import { formatDuration, formatCost } from '@/lib/dashboard';
import type { AggregateInsights, StageAverage } from '@/lib/insights';

// ---------------------------------------------------------------------------
// Stage accent classes (mirrors run-detail stageAccentClass)
// ---------------------------------------------------------------------------

function stageAccentClass(stageKey: string): string {
  switch (stageKey) {
    case 'alex':
      return 'text-sky-400 border-sky-400';
    case 'cass':
      return 'text-violet-400 border-violet-400';
    case 'nigel-spec':
    case 'nigel-tests':
      return 'text-amber-400 border-amber-400';
    case 'codey-plan':
    case 'codey-implement':
      return 'text-teal-400 border-teal-400';
    default:
      return 'text-starling-slate border-starling-slate';
  }
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ? 'text-starling-blue' : 'text-starling-ink'}`}>
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InsightsPanel component
// ---------------------------------------------------------------------------

interface InsightsPanelProps {
  insights: AggregateInsights;
  stageAverages: StageAverage[];
  mostCommonFailureStage: string | null;
}

export function InsightsPanel({ insights, stageAverages, mostCommonFailureStage }: InsightsPanelProps) {
  const { totalRuns, successRate, avgDurationMs, totalCost, avgCostPerRun, refinementRate, featureRuns, refinementRuns, stageSuccessRates, last7Days, last30Days, topSlugByRunCount, topSlugByCost, avgFeedbackRating } = insights;

  const successRateDisplay = successRate !== null ? `${successRate}%` : '—';
  const avgDurationDisplay = avgDurationMs !== null ? formatDuration(avgDurationMs) : '—';
  const totalCostDisplay = formatCost(totalCost);

  return (
    <section className="mb-10" aria-label="Pipeline Insights">
      <h2 className="mb-4 text-lg font-bold text-starling-ink">Insights</h2>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Runs" value={String(totalRuns)} />
        <StatCard label="Success Rate" value={successRateDisplay} accent />
        <StatCard label="Avg Duration" value={avgDurationDisplay} />
        <StatCard label="Total Cost" value={totalCostDisplay} />
        <StatCard label="Avg Cost / Run" value={formatCost(avgCostPerRun)} />
        <StatCard label="Refinement Rate" value={`${refinementRate}%`} />
        <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Runs by Type</p>
          <p className="mt-1 text-sm text-starling-ink">
            <span className="font-semibold">Feature:</span> {featureRuns}
          </p>
          <p className="text-sm text-starling-ink">
            <span className="font-semibold">Refinement:</span> {refinementRuns}
          </p>
        </div>
        {Object.keys(stageSuccessRates).length > 0 && (
          <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Stage Success Rates</p>
            {Object.entries(stageSuccessRates).map(([stageKey, rate]) => (
              <p key={stageKey} className="mt-1 text-sm text-starling-ink">
                <span className={`font-mono font-semibold ${stageAccentClass(stageKey).split(' ')[0]}`}>{stageKey}</span>
                {': '}{rate}%
              </p>
            ))}
          </div>
        )}
        <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Run Velocity</p>
          <p className="mt-1 text-sm text-starling-ink">
            <span className="font-semibold">Last 7 Days:</span> {last7Days}
          </p>
          <p className="text-sm text-starling-ink">
            <span className="font-semibold">Last 30 Days:</span> {last30Days}
          </p>
        </div>
        <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Top Feature (Runs)</p>
          <p className="mt-1 text-lg font-extrabold text-starling-ink truncate">
            {topSlugByRunCount ?? '—'}
          </p>
        </div>
        <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Top Feature (Cost $)</p>
          <p className="mt-1 text-lg font-extrabold text-starling-ink truncate">
            {topSlugByCost ?? '—'}
          </p>
        </div>
        <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Avg Feedback Rating</p>
          <p className="mt-1 text-2xl font-extrabold text-starling-ink">
            {avgFeedbackRating !== null ? `${avgFeedbackRating} / 5` : '—'}
          </p>
        </div>
      </div>

      {/* Stage breakdown + failure callout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Stage breakdown table */}
        <div className="lg:col-span-2 overflow-x-auto rounded-brand border border-starling-cyan/30 bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-starling-cyan/30 bg-starling-cloud/50">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                  Stage
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {stageAverages.map(({ key, avgDurationMs: stageDuration }) => (
                <tr
                  key={key}
                  className="border-b border-starling-cyan/20 last:border-0 hover:bg-starling-cloud/30 transition"
                >
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block rounded border-l-2 pl-2 font-mono text-xs font-semibold ${stageAccentClass(key)}`}
                    >
                      {key}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-starling-ink">
                    {stageDuration !== null ? formatDuration(stageDuration) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Failure callout — only shown when there are failures */}
        {mostCommonFailureStage !== null && (
          <div className="rounded-brand border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Most Common Failure Stage
            </p>
            <p className="mt-2 font-mono text-lg font-extrabold text-red-700">
              {mostCommonFailureStage}
            </p>
            <p className="mt-1 text-xs text-red-400">
              This stage fails more often than any other in your pipeline.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
