import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/para',
  component: ParaPage,
});

function ParaPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">PARA Browser</h1>
      <p className="text-muted-foreground">PARA browser — PR-2.</p>
    </div>
  );
}
