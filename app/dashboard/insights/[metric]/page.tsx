import { getSession } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import { isValidMetricKey, getMetricTitle } from '@/lib/insights-trend';
import { getInsightsData } from '@/lib/runs';
import { TrendChart } from './TrendChart';

interface InsightTrendPageProps {
  params: Promise<{ metric: string }>;
  searchParams: Promise<{ window?: string }>;
}

export default async function InsightTrendPage({ params, searchParams }: InsightTrendPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user as typeof session.user & { id?: string };
  const userId = user.id;
  if (!userId) {
    redirect('/');
  }

  const { metric } = await params;

  if (!isValidMetricKey(metric)) {
    notFound();
  }

  const { window: windowParam } = await searchParams;
  const window = windowParam === 'week' || windowParam === 'month' || windowParam === 'year'
    ? windowParam
    : 'month';

  const metricTitle = getMetricTitle(metric);
  const runs = await getInsightsData(userId);

  return (
    <main className="min-h-screen bg-starling-cloud text-starling-ink">
      <header className="border-b border-starling-cyan/30 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image
            src="/murmur8-logo-compact.svg"
            alt="murmur8"
            width={120}
            height={30}
            priority
          />
          <a
            href="/dashboard"
            className="text-sm text-starling-slate transition hover:text-starling-ink"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-starling-ink">
          {metricTitle}
        </h1>
        <p className="mb-8 text-sm text-starling-slate">Trend over time</p>

        <TrendChart metric={metric} window={window} runs={runs} />
      </div>
    </main>
  );
}
