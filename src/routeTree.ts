import { Route as rootRoute } from './app/routes/__root';
import { Route as indexRoute } from './app/routes/index';
import { Route as captureRoute } from './app/routes/capture';
import { Route as dashboardRoute } from './app/routes/dashboard';
import { Route as paraRoute } from './app/routes/para';
import { Route as reviewRoute } from './app/routes/review';

export const routeTree = rootRoute.addChildren([
  indexRoute,
  captureRoute,
  dashboardRoute,
  paraRoute,
  reviewRoute,
]);
