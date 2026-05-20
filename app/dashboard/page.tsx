import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getPaginationParams, getFilterParams } from "@/lib/dashboard";
import { getUserRuns, getInsightsData } from "@/lib/runs";
import { computeInsights, computeStageAverages, getMostCommonFailureStage } from "@/lib/insights";
import { RunsTable } from "@/app/dashboard/RunsTable";
import { InsightsPanel } from "@/app/dashboard/InsightsPanel";

interface SearchParams {
  page?: string;
  status?: string;
  slug?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user as typeof session.user & {
    id?: string;
    isAdmin?: boolean;
    avatarUrl?: string | null;
  };

  const userId = user.id;
  if (!userId) {
    redirect("/");
  }

  // Await searchParams (Next.js 15 makes this async)
  const params = await searchParams;

  const pagination = getPaginationParams(params);
  const filters = getFilterParams(params);

  const [{ runs, total, totalPages }, insightsRuns] = await Promise.all([
    getUserRuns(userId, filters, pagination),
    getInsightsData(userId),
  ]);

  const insights = computeInsights(insightsRuns);
  const stageAverages = computeStageAverages(insightsRuns);
  const mostCommonFailureStage = getMostCommonFailureStage(insightsRuns);

  const hasFilters = !!(params.status || params.slug || params.dateFrom || params.dateTo);
  const isEmpty = runs.length === 0;
  const isNewUser = isEmpty && !hasFilters && total === 0;

  return (
    <main className="min-h-screen bg-starling-cloud text-starling-ink">
      {/* Header */}
      <header className="border-b border-starling-cyan/30 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-starling-blue">
              murmur8
            </span>
            {user.isAdmin && (
              <span className="rounded-full bg-agent-alex/20 px-2 py-0.5 text-xs font-semibold text-starling-blue">
                Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {(user.image || user.avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl ?? user.image ?? ""}
                alt={user.name ?? "User avatar"}
                className="h-8 w-8 rounded-full border border-starling-cyan/50"
              />
            ) : null}

            <span className="text-sm text-starling-slate">{user.name}</span>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-brand border border-starling-cyan bg-white px-4 py-2 text-sm font-semibold text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Insights Panel */}
        <InsightsPanel
          insights={insights}
          stageAverages={stageAverages}
          mostCommonFailureStage={mostCommonFailureStage}
        />

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-starling-ink">
            Run History
          </h1>
          {total > 0 && (
            <p className="mt-1 text-sm text-starling-slate">
              {total} {total === 1 ? "run" : "runs"} total
            </p>
          )}
        </div>

        {/* Filter form */}
        <form
          method="get"
          className="mb-6 flex flex-wrap gap-3 rounded-brand border border-starling-cyan/30 bg-white p-4"
        >
          {/* Status filter */}
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-xs font-medium text-starling-slate">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={params.status ?? ""}
              className="rounded border border-starling-cyan/40 bg-starling-cloud px-3 py-1.5 text-sm text-starling-ink focus:outline-none focus:ring-2 focus:ring-starling-sky"
            >
              <option value="">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Slug search */}
          <div className="flex flex-col gap-1">
            <label htmlFor="slug" className="text-xs font-medium text-starling-slate">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              name="slug"
              defaultValue={params.slug ?? ""}
              placeholder="Search slugs…"
              className="rounded border border-starling-cyan/40 bg-starling-cloud px-3 py-1.5 text-sm text-starling-ink placeholder:text-starling-silver focus:outline-none focus:ring-2 focus:ring-starling-sky"
            />
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label htmlFor="dateFrom" className="text-xs font-medium text-starling-slate">
              From
            </label>
            <input
              id="dateFrom"
              type="date"
              name="dateFrom"
              defaultValue={params.dateFrom ?? ""}
              className="rounded border border-starling-cyan/40 bg-starling-cloud px-3 py-1.5 text-sm text-starling-ink focus:outline-none focus:ring-2 focus:ring-starling-sky"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label htmlFor="dateTo" className="text-xs font-medium text-starling-slate">
              To
            </label>
            <input
              id="dateTo"
              type="date"
              name="dateTo"
              defaultValue={params.dateTo ?? ""}
              className="rounded border border-starling-cyan/40 bg-starling-cloud px-3 py-1.5 text-sm text-starling-ink focus:outline-none focus:ring-2 focus:ring-starling-sky"
            />
          </div>

          {/* Hidden page reset */}
          <input type="hidden" name="page" value="1" />

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-brand bg-starling-blue px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-starling-sky"
            >
              Filter
            </button>
            {hasFilters && (
              <a
                href="/dashboard"
                className="rounded-brand border border-starling-cyan px-4 py-1.5 text-sm font-semibold text-starling-slate transition hover:border-starling-sky hover:text-starling-ink"
              >
                Clear
              </a>
            )}
          </div>
        </form>

        {/* Run list */}
        {isEmpty ? (
          <div className="rounded-brand border border-starling-cyan/30 bg-white px-8 py-16 text-center">
            {isNewUser ? (
              <>
                <p className="text-2xl font-bold text-starling-ink">No runs yet</p>
                <p className="mt-2 text-sm text-starling-slate">
                  Connect your pipeline and start building — your history will appear here.
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-starling-ink">No runs match your filters</p>
                <p className="mt-2 text-sm text-starling-slate">
                  Try adjusting or{" "}
                  <a href="/dashboard" className="text-starling-blue underline hover:text-starling-sky">
                    clearing your filters
                  </a>{" "}
                  to see all runs.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-brand border border-starling-cyan/30 bg-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-starling-cyan/30 bg-starling-cloud/50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                      Completed
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-starling-slate">
                      Cost
                    </th>
                  </tr>
                </thead>
                <RunsTable runs={runs} />
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-starling-slate">
                  Page {pagination.page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  {pagination.page > 1 && (
                    <a
                      href={`/dashboard?${new URLSearchParams({
                        ...(params.status ? { status: params.status } : {}),
                        ...(params.slug ? { slug: params.slug } : {}),
                        ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
                        ...(params.dateTo ? { dateTo: params.dateTo } : {}),
                        page: String(pagination.page - 1),
                      }).toString()}`}
                      className="rounded-brand border border-starling-cyan px-4 py-2 text-sm font-semibold text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
                    >
                      ← Previous
                    </a>
                  )}
                  {pagination.page < totalPages && (
                    <a
                      href={`/dashboard?${new URLSearchParams({
                        ...(params.status ? { status: params.status } : {}),
                        ...(params.slug ? { slug: params.slug } : {}),
                        ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
                        ...(params.dateTo ? { dateTo: params.dateTo } : {}),
                        page: String(pagination.page + 1),
                      }).toString()}`}
                      className="rounded-brand border border-starling-cyan px-4 py-2 text-sm font-semibold text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
                    >
                      Next →
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
