import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user as typeof session.user & {
    id?: string;
    isAdmin?: boolean;
    avatarUrl?: string | null;
  };

  return (
    <main className="min-h-screen bg-starling-cloud text-starling-ink">
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
            {user.image || user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
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

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-starling-ink">
          Dashboard
        </h1>
        <p className="mt-4 text-lg text-starling-slate">
          Signed in successfully. More features coming soon.
        </p>
      </section>
    </main>
  );
}
