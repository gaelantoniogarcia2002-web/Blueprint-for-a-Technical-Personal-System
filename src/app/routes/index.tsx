import { createRoute, redirect } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';

// Fix: hitting '/' (fresh install, PWA launch, deep-link fallback) had no
// registered route and fell through to the 404 notFoundComponent. Redirect
// straight to the primary entry point of the app: Captura Rápida.
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/capture' });
  },
});
