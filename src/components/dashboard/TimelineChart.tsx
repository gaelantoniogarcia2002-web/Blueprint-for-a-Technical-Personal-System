import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useParaNodes } from '@/hooks/useParaNodes';
import { aggregateDurationByType, mostRecentUpdate, daysSince } from '@/domain/dashboardAggregates';
import { DEPOSIT_TYPE_LABELS } from '@/domain/paraRules';

/**
 * Comparative timeline: average duration (days) per PARA deposit type, so
 * Proyectos can be read against Áreas/Recursos to spot stalled work, plus a
 * "última actualización: hace X días" freshness indicator for the whole system.
 */
export function TimelineChart() {
  const nodes = useParaNodes();
  const data = aggregateDurationByType(nodes).map((d) => ({
    ...d,
    label: DEPOSIT_TYPE_LABELS[d.type],
    avgDurationDays: Math.round(d.avgDurationDays * 10) / 10,
  }));

  const lastUpdate = mostRecentUpdate(nodes);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin nodos PARA aún.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Última actualización:{' '}
        {lastUpdate === null ? 'sin datos' : `hace ${daysSince(lastUpdate)} día(s)`}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} label={{ value: 'días', angle: -90, position: 'insideLeft', fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="avgDurationDays" name="Duración promedio (días)" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
