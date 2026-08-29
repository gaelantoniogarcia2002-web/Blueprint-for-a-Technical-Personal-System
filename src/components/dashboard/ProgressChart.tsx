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
import { useLoops } from '@/hooks/useLoops';
import { aggregateProjectProgress } from '@/domain/dashboardAggregates';

export function ProgressChart() {
  const projects = useParaNodes('PROJECT');
  const loops = useLoops();
  const data = aggregateProjectProgress(projects, loops);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin proyectos aún.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <XAxis dataKey="title" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="active" name="Activos" fill="#6366f1" />
        <Bar dataKey="closed" name="Cerrados" fill="#94a3b8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
