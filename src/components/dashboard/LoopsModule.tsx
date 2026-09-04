import { useLoops } from '@/hooks/useLoops';
import { useReviewSessions } from '@/hooks/useReviewSessions';
import { aggregateLoopsModuleSummary } from '@/domain/dashboardAggregates';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Connects the Bucles (loops) area of the Weekly Review with overall app
 * state: how many loops are active vs. completed, and how many weekly
 * reviews (habit/iteration cycles) have actually been completed.
 */
export function LoopsModule() {
  const loops = useLoops();
  const reviewSessions = useReviewSessions();
  const summary = aggregateLoopsModuleSummary(loops, reviewSessions);

  const stats: Array<{ label: string; value: string }> = [
    { label: 'Bucles activos', value: String(summary.activeCount) },
    { label: 'Bucles completados', value: String(summary.closedCount) },
    { label: 'Revisiones completadas', value: String(summary.reviewSessionsCompleted) },
    {
      label: 'Última revisión',
      value: summary.daysSinceLastReview === null ? 'nunca' : `hace ${summary.daysSinceLastReview} día(s)`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} size="sm">
          <CardContent>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-semibold">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
