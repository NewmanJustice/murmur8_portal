/**
 * MetricTile — Server-safe reusable metric tile component.
 * Matches the StatCard visual pattern used in InsightsPanel.
 *
 * Props:
 *   label  — short uppercase label displayed above the value
 *   value  — the metric value to display prominently
 *   accent — when true, renders the value in starling-blue (default: starling-ink)
 */

interface MetricTileProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function MetricTile({ label, value, accent }: MetricTileProps) {
  return (
    <div className="rounded-brand border border-starling-cyan/30 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-starling-slate">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ? 'text-starling-blue' : 'text-starling-ink'}`}>
        {value}
      </p>
    </div>
  );
}
