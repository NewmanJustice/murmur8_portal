const agents = [
  { name: "Alex", role: "Feature spec", color: "bg-agent-alex" },
  { name: "Cass", role: "User stories", color: "bg-agent-cass" },
  { name: "Nigel", role: "Executable tests", color: "bg-agent-nigel" },
  { name: "Codey", role: "Implementation", color: "bg-agent-codey" },
];

export default function Home() {
  return (
    <main className="bg-starling-cloud text-starling-ink">
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_420px]">

          <div>
            <div className="mb-6 inline-flex rounded-full border border-starling-cyan bg-white/80 px-4 py-2 text-sm font-semibold text-starling-blue shadow-sm">
              AI coding with a readable trail
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-starling-ink sm:text-7xl">
              Agents that move together.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-starling-slate">
              murmur8 turns fuzzy feature ideas into specs, stories, tests, and
              implementation through a structured AI engineering pipeline.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#quick-start"
                className="rounded-brand bg-starling-ink px-5 py-3 font-mono text-sm font-semibold text-starling-cyan shadow-brand transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                npx murmur8 init
              </a>
              <a
                href="#workflow"
                className="rounded-brand border border-starling-cyan bg-white px-5 py-3 text-sm font-bold text-starling-ink transition hover:border-starling-sky hover:bg-starling-mist"
              >
                View workflow
              </a>
            </div>
          </div>

          <div className="rounded-brand-xl border border-starling-cyan/70 bg-white/80 p-6 shadow-brand backdrop-blur">
            <div className="rounded-brand-lg bg-hero-dark p-6 text-white shadow-glow">
              <p className="font-mono text-sm text-starling-cyan">
                /implement-feature user-auth
              </p>

              <div className="mt-8 space-y-4">
                {agents.map(({ name, role, color }) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4"
                  >
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                    <div>
                      <p className="font-bold">{name}</p>
                      <p className="text-sm text-slate-300">{role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-slate-300">
                Spec → Stories → Tests → Code → History
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
