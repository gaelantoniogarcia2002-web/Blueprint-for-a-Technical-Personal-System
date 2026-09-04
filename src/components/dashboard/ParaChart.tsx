import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParaNodes } from '@/hooks/useParaNodes';
import { aggregateParaByType } from '@/domain/dashboardAggregates';
import { DEPOSIT_TYPE_LABELS } from '@/domain/paraRules';

const COLORS: Record<string, string> = {
  PROJECT: '#6366f1',
  AREA: '#22c55e',
  RESOURCE: '#f59e0b',
  ARCHIVE: '#94a3b8',
};

export function ParaChart() {
  const nodes = useParaNodes();
  const data = aggregateParaByType(nodes).map((d) => ({ ...d, label: DEPOSIT_TYPE_LABELS[d.type] }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Sin nodos PARA aún.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name }) => String(name)}
        >
          {data.map((entry) => (
            <Cell
              key={entry.type}
              fill={COLORS[entry.type] ?? '#64748b'}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
