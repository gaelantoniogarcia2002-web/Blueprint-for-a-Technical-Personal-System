import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLoops } from '@/hooks/useLoops';
import { aggregateLoopsStatusByDay } from '@/domain/dashboardAggregates';

/** Comparative: active vs. closed loops by day — closed loops are completed iterations. */
export function LoopsChart() {
  const loops = useLoops();
  const data = aggregateLoopsStatusByDay(loops);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin bucles aún.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="active" name="Activos" stackId="loops" fill="#6366f1" />
        <Bar dataKey="closed" name="Completados" stackId="loops" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
