
## tailwind.config.ts

```typescript

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        starling: {
          ink: "#0B1020",
          night: "#111827",
          dusk: "#1E293B",
          blue: "#1E5A7A",
          slate: "#334155",
          silver: "#94A3B8",
          cloud: "#F8FAFC",
          mist: "#EAF6FF",
          sky: "#38BDF8",
          cyan: "#BAE6FD",
        },
        agent: {
          alex: "#38BDF8",
          cass: "#A78BFA",
          nigel: "#F59E0B",
          codey: "#2DD4BF",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Consolas",
          "ui-monospace",
          "monospace",
        ],
      },
      borderRadius: {
        brand: "1rem",
        "brand-lg": "1.5rem",
        "brand-xl": "2rem",
      },
      boxShadow: {
        brand: "0 24px 80px rgba(15, 23, 42, 0.12)",
        glow: "0 0 48px rgba(56, 189, 248, 0.24)",
        "glow-soft": "0 0 80px rgba(186, 230, 253, 0.42)",
      },
      backgroundImage: {
        "starling-radial":
          "radial-gradient(circle at top right, rgba(56,189,248,0.20), transparent 34%), radial-gradient(circle at bottom left, rgba(186,230,253,0.55), transparent 32%)",
        "hero-dark":
          "radial-gradient(circle at 70% 20%, rgba(56,189,248,0.22), transparent 30%), linear-gradient(135deg, #0B1020 0%, #111827 48%, #1E293B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

```
## globals.css

```css

:root {
  --starling-ink: #0b1020;
  --starling-night: #111827;
  --starling-dusk: #1e293b;
  --starling-blue: #1e5a7a;
  --starling-slate: #334155;
  --starling-silver: #94a3b8;
  --starling-cloud: #f8fafc;
  --starling-mist: #eaf6ff;
  --starling-sky: #38bdf8;
  --starling-cyan: #bae6fd;

  --agent-alex: #38bdf8;
  --agent-cass: #a78bfa;
  --agent-nigel: #f59e0b;
  --agent-codey: #2dd4bf;
}

html {
  scroll-behavior: smooth;
}

body {
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 34%),
    var(--starling-cloud);
  color: var(--starling-ink);
}

::selection {
  background: var(--starling-cyan);
  color: var(--starling-ink);
}

``` 
## Suggested page style

```typescript

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-starling-cloud px-6 py-24 sm:py-32">
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
              {[
                ["Alex", "Feature spec", "bg-agent-alex"],
                ["Cass", "User stories", "bg-agent-cass"],
                ["Nigel", "Executable tests", "bg-agent-nigel"],
                ["Codey", "Implementation", "bg-agent-codey"],
              ].map(([name, role, color]) => (
                <div
                  key={name}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/8 p-4"
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
  );
}

```

## Recommended website classes

Page background:
bg-starling-cloud text-starling-ink

Primary dark section:
bg-hero-dark text-white

Cards:
rounded-brand-lg border border-starling-cyan/60 bg-white shadow-brand

Primary button:
rounded-brand bg-starling-ink text-starling-cyan shadow-brand hover:shadow-glow

Secondary button:
rounded-brand border border-starling-cyan bg-white text-starling-ink hover:bg-starling-mist

Muted text:
text-starling-slate

Code text:
font-mono text-starling-cyan