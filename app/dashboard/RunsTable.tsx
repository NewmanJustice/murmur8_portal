"use client";

import Link from "next/link";
import { statusBadgeClass, typeBadgeClass, formatDuration, formatCost } from "@/lib/dashboard";

interface RunRow {
  id: string;
  slug: string;
  status: string;
  type: string;
  completedAt: Date | null;
  totalDurationMs: number | null;
  totalCost: unknown;
}

interface RunsTableProps {
  runs: RunRow[];
}

export function RunsTable({ runs }: RunsTableProps) {
  return (
    <tbody>
      {runs.map((run) => (
        <tr
          key={run.id}
          className="group border-b border-starling-cyan/20 transition hover:bg-starling-mist/60"
        >
          <td className="px-4 py-3">
            <Link
              href={`/runs/${run.id}`}
              className="block font-mono text-sm text-starling-ink group-hover:text-starling-blue"
            >
              {run.slug}
            </Link>
          </td>
          <td className="px-4 py-3">
            <Link href={`/runs/${run.id}`} className="block">
              <span className={statusBadgeClass(run.status)}>{run.status}</span>
            </Link>
          </td>
          <td className="px-4 py-3">
            <Link href={`/runs/${run.id}`} className="block">
              <span className={typeBadgeClass(run.type)}>{run.type}</span>
            </Link>
          </td>
          <td className="px-4 py-3 text-sm text-starling-slate">
            <Link href={`/runs/${run.id}`} className="block">
              {run.completedAt
                ? new Date(run.completedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </Link>
          </td>
          <td className="px-4 py-3 text-sm text-starling-slate tabular-nums">
            <Link href={`/runs/${run.id}`} className="block">
              {run.totalDurationMs != null ? formatDuration(run.totalDurationMs) : "—"}
            </Link>
          </td>
          <td className="px-4 py-3 text-sm text-starling-slate tabular-nums">
            <Link href={`/runs/${run.id}`} className="block">
              {run.totalCost != null ? formatCost(Number(run.totalCost)) : "—"}
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
