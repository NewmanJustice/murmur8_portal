/**
 * InsightsPanel — Server Component
 * Renders aggregate insights: stat cards, stage breakdown, failure callout.
 */

import Link from 'next/link';
import { formatDuration, formatCost } from '@/lib/dashboard';
import type { AggregateInsights, StageAverage } from '@/lib/insights';

// ---------------------------------------------------------------------------
// Stage glyph prefix helper
// Maps each stage key to its glyph-prefixed label:
//   alex      → "} alex"
//   cass      → "}} cass"
//   nigel-*   → "}}} nigel-spec" / "}}} nigel-tests"
//   codey-*   → "}}}} codey-plan" / "}}}} codey-implement"
// ---------------------------------------------------------------------------

const STAGE_GLYPH_LABELS: Record<string, string> = {
  'alex':             '} alex',
  'cass':             '}} cass',
  'nigel-spec':       '}}} nigel-spec',
  'nigel-tests':      '}}} nigel-tests',
  'codey-plan':       '}}}} codey-plan',
  'codey-implement':  '}}}} codey-implement',
};

function stageGlyphPrefix(key: string): string {
  return STAGE_GLYPH_LABELS[key] ?? key;
}

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
  href?: string;
}

function StatCard({ label, value, accent, href }: StatCardProps) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ? 'text-starling-blue' : 'text-starling-ink'}`}>
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4 cursor-pointer transition hover:border-starling-sky hover:bg-starling-mist" aria-label={`${label} — view trend`}>
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
      {content}
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
  const { totalRuns, successRate, avgDurationMs, totalCost, avgCostPerRun, refinementRate, featureRuns, refinementRuns, stageSuccessRates, last7Days, last30Days, topRepoByRunCount, avgFeedbackRating } = insights;

  const successRateDisplay = successRate !== null ? `${successRate}%` : '—';
  const avgDurationDisplay = avgDurationMs !== null ? formatDuration(avgDurationMs) : '—';
  const totalCostDisplay = formatCost(totalCost);

  return (
    <section className="mb-10" aria-label="Pipeline Insights">
      <h2 className="mb-4 text-lg font-bold text-starling-ink">Insights</h2>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Runs" value={String(totalRuns)} href="/dashboard/insights/total-runs" />
        <StatCard label="Success Rate" value={successRateDisplay} accent href="/dashboard/insights/success-rate" />
        <StatCard label="Avg Duration" value={avgDurationDisplay} href="/dashboard/insights/avg-duration" />
        <StatCard label="Total Cost" value={totalCostDisplay} href="/dashboard/insights/total-cost" />
        <StatCard label="Avg Cost / Run" value={formatCost(avgCostPerRun)} href="/dashboard/insights/avg-cost-per-run" />
        <StatCard label="Refinement Rate" value={`${refinementRate}%`} href="/dashboard/insights/refinement-rate" />
        <Link href="/dashboard/insights/runs-by-type" className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4 cursor-pointer transition hover:border-starling-sky hover:bg-starling-mist" aria-label="Runs by Type — view trend">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Runs by Type</p>
          <p className="mt-1 text-sm text-starling-ink">
            <span className="font-semibold">Feature:</span> {featureRuns}
          </p>
          <p className="text-sm text-starling-ink">
            <span className="font-semibold">Refinement:</span> {refinementRuns}
          </p>
        </Link>
        {Object.keys(stageSuccessRates).length > 0 && (
          <Link href="/dashboard/insights/stage-success-rates" className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4 cursor-pointer transition hover:border-starling-sky hover:bg-starling-mist" aria-label="Stage Success Rates — view trend">
            <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Stage Success Rates</p>
            {Object.entries(stageSuccessRates).map(([stageKey, rate]) => (
              <p key={stageKey} className="mt-1 text-sm text-starling-ink">
                <span className={`font-mono font-semibold ${stageAccentClass(stageKey).split(' ')[0]}`}>{stageKey}</span>
                {': '}{rate}%
              </p>
            ))}
          </Link>
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
        <Link href="/dashboard/insights/avg-feedback-rating" className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4 cursor-pointer transition hover:border-starling-sky hover:bg-starling-mist" aria-label="Avg Feedback Rating — view trend">
          <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">Avg Feedback Rating</p>
          <p className="mt-1 text-2xl font-extrabold text-starling-ink">
            {avgFeedbackRating !== null ? `${avgFeedbackRating} / 5` : '—'}
          </p>
        </Link>
        {mostCommonFailureStage !== null && (
          <Link href="/dashboard/insights/most-common-failure-stage" className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4 cursor-pointer transition hover:border-starling-sky hover:bg-starling-mist" aria-label="Most Common Failure Stage — view trend">
            <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">
              Most Common Failure Stage
            </p>
            <p className="mt-1 text-2xl font-extrabold text-starling-ink">
              {mostCommonFailureStage}
            </p>
          </Link>
        )}
        <StatCard label="Most Active Repo" value={topRepoByRunCount ?? '—'} href="/dashboard/insights/most-active-repo" />
      </div>

      {/* Stage breakdown table */}
      <div className="overflow-x-auto rounded-brand border border-starling-cyan/30 bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-starling-cyan/30 bg-starling-cloud/50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                Stage
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                Avg Duration
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                Avg Total Tokens
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                Avg Feedback Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {stageAverages.map(({ key, avgDurationMs: stageDuration, avgTokens, avgFeedbackRating: stageAvgFeedback }) => (
              <tr
                key={key}
                className="border-b border-starling-cyan/20 last:border-0 hover:bg-starling-cloud/30 transition"
              >
                <td className="px-4 py-2.5">
                  <span
                    className={`font-mono text-xs font-semibold ${stageAccentClass(key).split(' ')[0]}`}
                  >
                    {stageGlyphPrefix(key)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-sm text-starling-ink">
                  {stageDuration !== null ? formatDuration(stageDuration) : '—'}
                </td>
                <td className="px-4 py-2.5 text-sm text-starling-ink">
                  {avgTokens !== null ? avgTokens.toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2.5 text-sm text-starling-ink">
                  {stageAvgFeedback !== null ? stageAvgFeedback : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
