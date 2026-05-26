'use client';

import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  computeTrendData,
  computeCompoundTrendData,
  computeCategoricalTrendData,
} from '@/lib/insights-trend';

const COMPOUND_METRICS = ['runs-by-type', 'stage-success-rates'];
const CATEGORICAL_METRICS = ['most-common-failure-stage', 'most-active-repo'];

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#14b8a6', '#ef4444', '#6366f1'];

interface TrendChartProps {
  metric: string;
  window: string;
  runs: Array<{
    status: string;
    totalDurationMs: number | null;
    totalCost: unknown;
    failedStage: string | null;
    stages: unknown;
    type: string | null;
    slug: string | null;
    startedAt: Date | null;
    repoName: string | null;
  }>;
}

export function TrendChart({ metric, window, runs }: TrendChartProps) {
  const router = useRouter();
  const referenceDate = new Date();

  function handleWindowChange(w: string) {
    router.push(`/dashboard/insights/${metric}?window=${w}`);
  }

  if (CATEGORICAL_METRICS.includes(metric)) {
    const data = computeCategoricalTrendData(runs, metric, window, referenceDate);
    const allCategories = new Set<string>();
    for (const point of data.currentPeriod) {
      for (const key of Object.keys(point.categories)) allCategories.add(key);
    }
    const categories = Array.from(allCategories);

    const chartData = data.currentPeriod.map(point => ({
      bucket: point.bucket,
      ...point.categories,
    }));

    return (
      <div aria-label={`${metric} trend chart`}>
        <WindowToggle current={window} onChange={handleWindowChange} />
        {chartData.length === 0 || categories.length === 0 ? (
          <p className="mt-8 text-center text-starling-slate">No data available for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip />
              <Legend />
              {categories.map((cat, i) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }

  if (COMPOUND_METRICS.includes(metric)) {
    const data = computeCompoundTrendData(runs, metric, window, referenceDate);
    const allSeries = new Set<string>();
    for (const point of data.currentPeriod) {
      for (const key of Object.keys(point.series)) allSeries.add(key);
    }
    const seriesKeys = Array.from(allSeries);

    const chartData = data.currentPeriod.map(point => ({
      bucket: point.bucket,
      ...point.series,
    }));

    const priorChartData = data.priorYear.length > 0
      ? data.priorYear.map(point => ({ bucket: point.bucket, ...point.series }))
      : null;

    return (
      <div aria-label={`${metric} trend chart`}>
        <WindowToggle current={window} onChange={handleWindowChange} />
        {chartData.length === 0 || seriesKeys.length === 0 ? (
          <p className="mt-8 text-center text-starling-slate">No data available for this period.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip />
                <Legend />
                {seriesKeys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} connectNulls={false} dot />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {priorChartData && priorChartData.length > 0 && (
              <>
                <p className="mt-6 mb-2 text-sm font-semibold text-starling-slate">Prior Year</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priorChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {seriesKeys.map((key, i) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeDasharray="5 5" connectNulls={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // Numeric metrics — standard line chart
  const data = computeTrendData(runs, metric, window, referenceDate);

  const chartData = data.currentPeriod.map(point => ({
    bucket: point.bucket,
    value: point.value,
  }));

  const priorYearData = data.priorYear.length > 0
    ? data.priorYear.map(point => ({ bucket: point.bucket, value: point.value }))
    : null;

  const merged = chartData.map((point, i) => ({
    ...point,
    priorYear: priorYearData && priorYearData[i] ? priorYearData[i].value : undefined,
  }));

  const hasData = chartData.some(p => p.value !== null);

  return (
    <div aria-label={`${metric} trend chart`}>
      <WindowToggle current={window} onChange={handleWindowChange} />
      {!hasData ? (
        <p className="mt-8 text-center text-starling-slate">No data available for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" name="Current" stroke="#0ea5e9" connectNulls={false} dot />
            {priorYearData && priorYearData.length > 0 && (
              <Line type="monotone" dataKey="priorYear" name="Prior Year" stroke="#94a3b8" strokeDasharray="5 5" connectNulls={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function WindowToggle({ current, onChange }: { current: string; onChange: (w: string) => void }) {
  const options = ['week', 'month', 'year'] as const;
  return (
    <div className="mb-6 flex gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-brand px-4 py-1.5 text-sm font-semibold transition ${
            current === opt
              ? 'bg-starling-blue text-white'
              : 'border border-starling-cyan bg-white text-starling-ink hover:border-starling-sky hover:bg-starling-mist'
          }`}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}
