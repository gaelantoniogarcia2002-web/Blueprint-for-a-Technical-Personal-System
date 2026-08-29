import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ParaBrowser } from '@/components/para/ParaBrowser';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/para',
  component: ParaPage,
});

function ParaPage() {
  return <ParaBrowser />;
}
