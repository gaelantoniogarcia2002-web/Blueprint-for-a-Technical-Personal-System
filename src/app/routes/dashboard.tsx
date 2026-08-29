import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ParaChart } from '@/components/dashboard/ParaChart';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { LoopsChart } from '@/components/dashboard/LoopsChart';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          PARA Node Distribution
        </h2>
        <ParaChart />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Project Progress
        </h2>
        <ProgressChart />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">
          Active Loops Over Time
        </h2>
        <LoopsChart />
      </section>
    </div>
  );
}
