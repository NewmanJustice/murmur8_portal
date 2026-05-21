import { getSession, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getInsightsData } from "@/lib/runs";
import { computeInsights, computeStageAverages, getMostCommonFailureStage } from "@/lib/insights";
import { InsightsPanel } from "@/app/dashboard/InsightsPanel";

export default async function DashboardPage() {
  const session = await getSession();

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

  const insightsRuns = await getInsightsData(userId);

  const insights = computeInsights(insightsRuns);
  const stageAverages = computeStageAverages(insightsRuns);
  const mostCommonFailureStage = getMostCommonFailureStage(insightsRuns);

  return (
    <main className="min-h-screen bg-starling-cloud text-starling-ink">
      {/* Header */}
      <header className="border-b border-starling-cyan/30 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/murmur8-logo-compact.svg"
              alt="murmur8"
              width={120}
              height={30}
              priority
            />
            {user.isAdmin && (
              <span className="rounded-full bg-agent-alex/20 px-2 py-0.5 text-xs font-semibold text-starling-blue">
                Admin
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <a
                href="/dashboard/runs"
                className="rounded-brand border border-starling-cyan/50 px-3 py-1.5 text-sm font-medium text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
              >
                Run History
              </a>
              <a
                href="/keys"
                className="rounded-brand border border-starling-cyan/50 px-3 py-1.5 text-sm font-medium text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
              >
                API Keys
              </a>
              {user.isAdmin && (
                <a
                  href="/admin/keys"
                  className="rounded-brand border border-starling-cyan/50 px-3 py-1.5 text-sm font-medium text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
                >
                  Admin Keys
                </a>
              )}
            </nav>

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
      </div>
    </main>
  );
}
