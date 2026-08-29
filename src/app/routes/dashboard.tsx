import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Dashboard — PR-2.</p>
    </div>
  );
}
